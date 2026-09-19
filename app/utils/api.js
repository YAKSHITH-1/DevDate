// DevDate Lightweight API Client for React Native / Expo
// Zero extra dependencies, uses native fetch.
import {
  saveAuthTokens,
  getAuthTokens,
  clearAuthTokens,
} from './authStorage.js';

export function getApiBaseUrl() {
  // If running in a web browser (React Native Web)
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    const envUrl = typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_API_URL : null;

    // If an explicit HTTPS tunnel (e.g. ngrok or production) is configured, prioritize it
    if (envUrl && envUrl.startsWith('https://')) {
      return envUrl;
    }

    // If accessing web locally via localhost or 127.0.0.1, talk to local backend directly
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }

    // If accessing web via local network IP (e.g. http://192.168.1.6:8081), match the host
    return `http://${hostname}:5000/api`;
  }

  return (
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
    'http://localhost:5000/api'
  );
}

export function getSocketBaseUrl() {
  const apiUrl = getApiBaseUrl();
  return apiUrl.replace(/\/api\/?$/, '');
}

export const API_BASE_URL = getApiBaseUrl();

// In-memory token cache for fast access
let inMemoryAccessToken = null;
let inMemoryRefreshToken = null;

// Synchronous setters / getters for in-memory token state
export function setAuthTokensInMemory(accessToken, refreshToken = undefined) {
  inMemoryAccessToken = accessToken || null;
  if (accessToken === null && (refreshToken === null || refreshToken === undefined)) {
    inMemoryRefreshToken = null;
  } else if (refreshToken !== undefined) {
    inMemoryRefreshToken = refreshToken || null;
  }
}

export const setAuthToken = setAuthTokensInMemory;
export const getAuthToken = () => inMemoryAccessToken;

export function getInMemoryAccessToken() {
  return inMemoryAccessToken;
}

export function getInMemoryRefreshToken() {
  return inMemoryRefreshToken;
}

// Token refresh & session listeners (AppContext synchronization)
const tokenRefreshedListeners = new Set();
const sessionRevokedListeners = new Set();

export function onTokenRefreshed(callback) {
  tokenRefreshedListeners.add(callback);
  return () => tokenRefreshedListeners.delete(callback);
}

export function onSessionRevoked(callback) {
  sessionRevokedListeners.add(callback);
  return () => sessionRevokedListeners.delete(callback);
}

function notifyTokenRefreshed(accessToken, refreshToken) {
  tokenRefreshedListeners.forEach((cb) => {
    try {
      cb(accessToken, refreshToken);
    } catch {
      // Ignore listener error
    }
  });
}

function notifySessionRevoked(reason) {
  sessionRevokedListeners.forEach((cb) => {
    try {
      cb(reason);
    } catch {
      // Ignore listener error
    }
  });
}

/**
 * Resolves current access token: in-memory first, SecureStore fallback.
 */
export async function getEffectiveAccessToken() {
  if (inMemoryAccessToken) {
    return inMemoryAccessToken;
  }
  try {
    const tokens = await getAuthTokens();
    if (tokens?.accessToken) {
      inMemoryAccessToken = tokens.accessToken;
      if (tokens.refreshToken) {
        inMemoryRefreshToken = tokens.refreshToken;
      }
      return tokens.accessToken;
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

/**
 * Resolves current refresh token: in-memory first, SecureStore fallback.
 */
export async function getEffectiveRefreshToken() {
  if (inMemoryRefreshToken) {
    return inMemoryRefreshToken;
  }
  try {
    const tokens = await getAuthTokens();
    if (tokens?.refreshToken) {
      inMemoryRefreshToken = tokens.refreshToken;
      if (tokens.accessToken) {
        inMemoryAccessToken = tokens.accessToken;
      }
      return tokens.refreshToken;
    }
  } catch {
    // Ignore storage errors
  }
  return null;
}

// Shared mutex promise for concurrent 401 refresh requests
let activeRefreshPromise = null;

/**
 * Executes token refresh or joins an existing in-flight refresh.
 * Guaranteed to execute only one refresh request at any given time.
 */
async function performTokenRefresh() {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }

  activeRefreshPromise = (async () => {
    try {
      const currentRefreshToken = await getEffectiveRefreshToken();
      if (!currentRefreshToken) {
        return {
          success: false,
          status: 401,
          error: 'No refresh token available',
          isAuthRejection: true,
        };
      }

      // Call refreshTokenApi with raw request (skipAuth & skipRefresh to prevent recursion)
      const refreshResult = await refreshTokenApi(currentRefreshToken);

      if (refreshResult.success && refreshResult.accessToken) {
        // Guard: Check if logout occurred while refresh was in flight
        if (inMemoryAccessToken === null && inMemoryRefreshToken === null) {
          return {
            success: false,
            status: 401,
            error: 'Session logged out during refresh',
            isAuthRejection: true,
          };
        }

        const newAccess = refreshResult.accessToken;
        const newRefresh = refreshResult.refreshToken || currentRefreshToken;

        // 1. Update in-memory tokens
        setAuthTokensInMemory(newAccess, newRefresh);

        // 2. Persist rotated tokens to SecureStore
        await saveAuthTokens(newAccess, newRefresh);

        // 3. Notify listeners
        notifyTokenRefreshed(newAccess, newRefresh);

        return {
          success: true,
          accessToken: newAccess,
          refreshToken: newRefresh,
        };
      } else {
        const status = refreshResult.status || 0;
        // Distinguish authentication rejection from transient network failure
        const isAuthRejection = status === 400 || status === 401 || status === 403;

        if (isAuthRejection) {
          // Clear stored and in-memory tokens
          setAuthTokensInMemory(null, null);
          await clearAuthTokens();
          notifySessionRevoked('refresh_rejected');
        }

        return {
          success: false,
          status,
          error: refreshResult.error || 'Token refresh failed',
          isAuthRejection,
        };
      }
    } catch (err) {
      return {
        success: false,
        status: 0,
        error: err.message || 'Network error during token refresh',
        isAuthRejection: false,
      };
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}

/**
 * Generic fetch wrapper with centralized auth header injection, timeout & error handling,
 * automatic 401 token refresh, and retry exactly once.
 */
export async function request(endpoint, options = {}) {
  const url = `${getApiBaseUrl()}${endpoint}`;

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const defaultHeaders = isFormData ? {} : { 'Content-Type': 'application/json' };
  const headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  // 1. Centralized Authorization header injection
  const hasAuthHeader = Boolean(headers['Authorization'] || headers['authorization']);
  if (!options.skipAuth && !hasAuthHeader) {
    const token = await getEffectiveAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    // 2. Automatic 401 refresh and retry (exactly once, non-recursive)
    if (res.status === 401 && !options.skipAuth && !options.skipRefresh && !options._isRetry) {
      const refreshResult = await performTokenRefresh();

      if (refreshResult.success && refreshResult.accessToken) {
        // Retry original request with new access token
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${refreshResult.accessToken}`,
        };
        delete retryHeaders['authorization'];

        const retryOptions = {
          ...options,
          headers: retryHeaders,
          _isRetry: true,
        };

        return await request(endpoint, retryOptions);
      } else {
        // Refresh failed: return 401 failure
        return {
          success: false,
          status: 401,
          error: data.message || refreshResult.error || 'Unauthorized: Token expired or invalid',
          data: null,
          isAuthError: true,
        };
      }
    }

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        error: data.message || `HTTP ${res.status}`,
        data: null,
      };
    }

    return {
      success: true,
      status: res.status,
      data: data.data !== undefined ? data.data : data,
    };
  } catch (err) {
    return {
      success: false,
      status: 0,
      error: err.message || 'Network request failed',
      data: null,
    };
  }
}

/**
 * Fetch accepted Match conversations for current user
 */
export async function fetchMatchesApi(userId, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  const query = userId ? `?userId=${userId}` : '';
  const result = await request(`/chat/conversations${query}`, {
    method: 'GET',
    headers,
  });

  return result;
}

/**
 * Fetch received invitations for current developer
 */
export async function fetchInvitationsApi(userId, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  const query = userId ? `?status=Pending&userId=${userId}` : '?status=Pending';
  const result = await request(`/invitations/received${query}`, {
    method: 'GET',
    headers,
  });

  return result;
}

/**
 * Create and send an invitation via POST /api/invitations
 * Guards against attempting recruitment using mock project IDs (e.g. 'p1')
 */
export async function createInvitationApi({ projectId, developerId, message = '', senderId = null }, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (senderId) headers['x-user-id'] = senderId;

  // Frontend/API guard: do not attempt recruitment with mock project IDs
  if (!projectId || !/^[0-9a-fA-F]{24}$/.test(projectId)) {
    return {
      success: false,
      status: 400,
      error: 'Invalid Project ID format',
      data: null,
    };
  }

  const result = await request('/invitations', {
    method: 'POST',
    headers,
    body: JSON.stringify({ projectId, developerId, message, senderId }),
  });

  return result;
}

/**
 * Record a swipe action (PASS or INTERESTED) via POST /api/discovery/swipe
 * Guards against attempting swipe using mock project IDs (e.g. 'p1', 'p2')
 */
export async function recordSwipeApi(projectId, developerId, action = 'PASS', token = null, userId = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  // Reject mock project IDs (e.g. p1, p2, p3, p4) before making a backend request
  if (!projectId || !/^[0-9a-fA-F]{24}$/.test(projectId)) {
    return {
      success: false,
      status: 400,
      error: 'Invalid Project ID format',
      data: null,
    };
  }

  const result = await request('/discovery/swipe', {
    method: 'POST',
    headers,
    body: JSON.stringify({ projectId, developerId, action }),
  });

  return result;
}

/**
 * Fetch developers for discovery via GET /api/discovery/developers
 */
export async function fetchDiscoveryDevelopersApi({ projectId = null, search = '', skills = '', role = '', availability = '', limit = 50, page = 1 } = {}, token = null, userId = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  const params = new URLSearchParams();
  if (projectId) params.append('projectId', projectId);
  if (search) params.append('search', search);
  if (skills) params.append('skills', skills);
  if (role) params.append('role', role);
  if (availability) params.append('availability', availability);
  if (limit) params.append('limit', limit);
  if (page) params.append('page', page);

  const query = params.toString() ? `?${params.toString()}` : '';
  const result = await request(`/discovery/developers${query}`, {
    method: 'GET',
    headers,
  });

  return result;
}

/**
 * Accept an invitation via PATCH /api/invitations/:id/accept
 * Automatically triggers Match creation on backend
 */
export async function acceptInvitationApi(invitationId, userId, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  const result = await request(`/invitations/${invitationId}/accept`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ developerId: userId }),
  });

  return result;
}

/**
 * Reject an invitation via PATCH /api/invitations/:id/reject
 */
export async function rejectInvitationApi(invitationId, userId, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  const result = await request(`/invitations/${invitationId}/reject`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ developerId: userId }),
  });

  return result;
}

/**
 * Normalizes backend Match document to frontend Match UI shape
 */
export function normalizeMatch(rawMatch, currentUserId) {
  if (!rawMatch) return null;

  const isLead =
    rawMatch.isLead !== undefined
      ? rawMatch.isLead
      : rawMatch.lead?._id?.toString() === currentUserId?.toString();

  const partner =
    rawMatch.otherParticipant || (isLead ? rawMatch.developer : rawMatch.lead) || {};

  const matchId = (rawMatch._id || rawMatch.matchId || '').toString();

  return {
    id: matchId,
    matchId,
    developerId: (partner._id || partner.id || '').toString(),
    developerName: partner.name || 'Collaborator',
    developerRole: partner.role || partner.preferredRole || 'Developer',
    developerAvatar:
      partner.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    projectId: (rawMatch.project?._id || rawMatch.project?.id || rawMatch.project || '').toString(),
    projectName: rawMatch.projectName || rawMatch.project?.title || 'Project',
    projectDescription: rawMatch.projectDescription || rawMatch.project?.description || '',
    matchScore: rawMatch.matchScore || 96,
    breakdown: rawMatch.breakdown || { skill: 50, interest: 28, role: 18 },
    recentMessage:
      rawMatch.lastMessage?.message ||
      rawMatch.recentMessage ||
      `Matched for ${rawMatch.projectName || 'project'}! Start chatting.`,
    status: rawMatch.status || 'ACCEPTED',
    createdAt: rawMatch.createdAt || 'Just now',
    raw: rawMatch,
  };
}

/**
 * Normalizes backend Invitation document to frontend Invitation UI shape
 */
export function normalizeInvitation(rawInv) {
  if (!rawInv) return null;

  const dev = rawInv.developerId || {};
  const proj = rawInv.projectId || {};
  const sender = rawInv.senderId || {};
  const invId = (rawInv._id || rawInv.id || '').toString();

  return {
    id: invId,
    invitationId: invId,
    developerId: (dev._id || dev.id || '').toString(),
    developerName: dev.name || 'Developer',
    developerRole: dev.role || dev.preferredRole || 'Developer',
    developerAvatar:
      dev.avatar ||
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    projectId: (proj._id || proj.id || '').toString(),
    projectName: proj.title || 'Project',
    projectDescription: proj.description || '',
    senderName: sender.name || 'Project Lead',
    message: rawInv.message || '',
    matchScore: rawInv.matchScore || 92,
    timeAgo: rawInv.createdAt ? 'Recently' : rawInv.timeAgo || 'Recently',
    status: rawInv.status || 'Pending',
    raw: rawInv,
  };
}

/**
 * Fetch chat conversations (alias for fetchMatchesApi)
 */
export const fetchChatConversations = fetchMatchesApi;

/**
 * Fetch persisted messages for a conversation by Match._id
 */
export async function fetchChatMessages(matchId, userId, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  const query = userId ? `?userId=${userId}` : '';
  const result = await request(`/chat/conversations/${matchId}/messages${query}`, {
    method: 'GET',
    headers,
  });

  return result;
}

/**
 * Send a message in a conversation via POST /api/chat/conversations/:matchId/messages
 */
export async function sendChatMessage(matchId, message, userId, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  const query = userId ? `?userId=${userId}` : '';
  const result = await request(`/chat/conversations/${matchId}/messages${query}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message: message.trim() }),
  });

  return result;
}

/**
 * Normalizes backend Message document to frontend UI shape
 */
export function normalizeMessage(rawMsg, currentUserId) {
  if (!rawMsg) return null;

  const sender = rawMsg.sender || {};
  const senderId = (sender._id || sender.id || sender).toString();
  const myId = (currentUserId?._id || currentUserId?.id || currentUserId || '').toString();
  const isMe = Boolean(myId && senderId === myId);

  const createdAt = rawMsg.createdAt ? new Date(rawMsg.createdAt) : new Date();
  const timeStr = !isNaN(createdAt.getTime())
    ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Just now';

  return {
    id: (rawMsg._id || rawMsg.id || `msg-${Date.now()}-${Math.random()}`).toString(),
    text: rawMsg.message || rawMsg.text || '',
    sender: sender.name || (isMe ? 'You' : 'Partner'),
    senderId,
    time: timeStr,
    isMe,
    createdAt: rawMsg.createdAt,
    raw: rawMsg,
  };
}

/**
 * Normalizes backend Conversation document to frontend Chat UI shape
 */
export function normalizeConversation(rawConv, currentUserId) {
  if (!rawConv) return null;

  const matchId = (rawConv._id || rawConv.matchId || '').toString();
  const myId = (currentUserId?._id || currentUserId?.id || currentUserId || '').toString();

  const isLead =
    rawConv.isLead !== undefined
      ? rawConv.isLead
      : rawConv.lead?._id?.toString() === myId;

  const partner =
    rawConv.otherParticipant || (isLead ? rawConv.developer : rawConv.lead) || {};

  const lastMsg = rawConv.lastMessage;
  let lastMsgText = '';
  let timeStr = 'Just now';

  if (lastMsg) {
    lastMsgText = lastMsg.message || lastMsg.text || '';
    if (lastMsg.createdAt) {
      const d = new Date(lastMsg.createdAt);
      if (!isNaN(d.getTime())) {
        timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }
  } else {
    lastMsgText = `Matched for ${rawConv.projectName || rawConv.project?.title || 'project'}!`;
    if (rawConv.createdAt) {
      const d = new Date(rawConv.createdAt);
      if (!isNaN(d.getTime())) {
        timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
    }
  }

  return {
    id: matchId,
    matchId,
    projectId: (rawConv.project?._id || rawConv.project?.id || rawConv.project || '').toString(),
    projectName: rawConv.projectName || rawConv.project?.title || 'Project',
    developerId: (partner._id || partner.id || '').toString(),
    developerName: partner.name || 'Collaborator',
    developerRole: partner.role || partner.preferredRole || 'Developer',
    developerAvatar:
      partner.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'Online',
    lastMessage: lastMsgText,
    time: timeStr,
    unreadCount: 0,
    messages: [],
    raw: rawConv,
  };
}

/**
 * Fetch notifications for current user via GET /api/notifications
 */
export async function fetchNotifications(userId, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  const query = userId ? `?userId=${userId}` : '';
  const result = await request(`/notifications${query}`, {
    method: 'GET',
    headers,
  });

  return result;
}

/**
 * Fetch unread notification count for current user via GET /api/notifications/unread-count
 */
export async function fetchUnreadNotificationCount(userId, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  const query = userId ? `?userId=${userId}` : '';
  const result = await request(`/notifications/unread-count${query}`, {
    method: 'GET',
    headers,
  });

  return result;
}

/**
 * Mark a single notification as read via PATCH /api/notifications/:id/read
 */
export async function markNotificationRead(notificationId, userId, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  const query = userId ? `?userId=${userId}` : '';
  const result = await request(`/notifications/${notificationId}/read${query}`, {
    method: 'PATCH',
    headers,
  });

  return result;
}

/**
 * Mark all notifications as read for current user via PATCH /api/notifications/read-all
 */
export async function markAllNotificationsRead(userId, token = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  const query = userId ? `?userId=${userId}` : '';
  const result = await request(`/notifications/read-all${query}`, {
    method: 'PATCH',
    headers,
  });

  return result;
}

export const markAllNotificationsReadApi = markAllNotificationsRead;

/**
 * Normalizes backend Notification document to frontend Notification UI shape
 */
export function normalizeNotification(rawNotif, currentUserId) {
  if (!rawNotif) return null;

  const notifId = (rawNotif._id || rawNotif.id || '').toString();
  const type = (rawNotif.type || 'NOTIFICATION').toUpperCase();
  const actor = rawNotif.actor || {};
  const project = rawNotif.project || {};
  const invitation = rawNotif.invitation || {};
  const match = rawNotif.match || null;

  const matchId = match ? (match._id || match.id || match).toString() : null;
  const projectId = project ? (project._id || project.id || project).toString() : null;
  const invitationId = invitation ? (invitation._id || invitation.id || invitation).toString() : null;

  let title = 'Notification 🔔';
  if (type === 'INVITATION_RECEIVED') {
    title = 'New Collaboration Invite! ✉️';
  } else if (type === 'INVITATION_ACCEPTED') {
    title = 'Invitation Accepted! 🎉';
  } else if (type === 'INVITATION_REJECTED') {
    title = 'Invitation Declined ✖';
  } else if (type === 'INVITATION_WITHDRAWN') {
    title = 'Invitation Withdrawn';
  } else if (type === 'MATCH_CREATED' || type === 'MATCH') {
    title = "It's a Match! 🚀";
  } else if (type === 'MESSAGE' || type === 'NEW_MESSAGE') {
    title = `New Message from ${actor.name || 'Collaborator'} 💬`;
  } else if (rawNotif.title) {
    title = rawNotif.title;
  }

  // Format relative or readable time
  let timeStr = 'Just now';
  if (rawNotif.createdAt) {
    const d = new Date(rawNotif.createdAt);
    if (!isNaN(d.getTime())) {
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) {
        timeStr = 'Just now';
      } else if (diffMins < 60) {
        timeStr = `${diffMins}m ago`;
      } else if (diffHours < 24) {
        timeStr = `${diffHours}h ago`;
      } else if (diffDays < 7) {
        timeStr = `${diffDays}d ago`;
      } else {
        timeStr = d.toLocaleDateString();
      }
    }
  } else if (rawNotif.time) {
    timeStr = rawNotif.time;
  }

  const isRead = Boolean(rawNotif.readAt || rawNotif.read);

  return {
    id: notifId,
    notifId,
    type,
    title,
    message: rawNotif.message || '',
    time: timeStr,
    read: isRead,
    readAt: rawNotif.readAt || (isRead ? new Date().toISOString() : null),
    actor,
    project,
    projectId,
    invitation,
    invitationId,
    match,
    matchId,
    createdAt: rawNotif.createdAt,
    raw: rawNotif,
  };
}

// =======================================================
// CHUNK 11A: PROJECT DATA CONTRACT & SKILLS INTEGRATION
// =======================================================

/**
 * Fetch canonical skills from backend GET /api/skills
 * Supports optional ?category= and ?search=
 */
export async function fetchSkillsApi(params = {}) {
  const queryParts = [];
  if (params.category) queryParts.push(`category=${encodeURIComponent(params.category)}`);
  if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
  const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  return await request(`/skills${query}`, {
    method: 'GET',
    skipAuth: true,
  });
}

/**
 * Fetch skill categories from backend GET /api/skills/categories
 */
export async function fetchSkillCategoriesApi() {
  return await request('/skills/categories', {
    method: 'GET',
    skipAuth: true,
  });
}

/**
 * Fetch a single skill by ID from backend GET /api/skills/:id
 */
export async function fetchSkillByIdApi(id) {
  if (!id) return { success: false, error: 'Skill ID is required' };
  return await request(`/skills/${id}`, {
    method: 'GET',
    skipAuth: true,
  });
}

/**
 * Create a new project via POST /api/projects
 * Accepts canonical payload created by toBackendProjectPayload()
 */
export async function createProjectApi(projectPayload, token = null, userId = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  return await request('/projects', {
    method: 'POST',
    headers,
    body: JSON.stringify(projectPayload),
  });
}

/**
 * Fetch projects owned by authenticated user via GET /api/projects
 */
export async function fetchMyProjectsApi(token = null, userId = null) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  return await request('/projects', {
    method: 'GET',
    headers,
  });
}

/**
 * Fetch a single project by ID via GET /api/projects/:id
 */
export async function fetchProjectByIdApi(projectId, token = null, userId = null) {
  if (!projectId || !/^[0-9a-fA-F]{24}$/.test(projectId.toString())) {
    return { success: false, error: 'Invalid MongoDB project ID', status: 400, data: null };
  }

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  return await request(`/projects/${projectId}`, {
    method: 'GET',
    headers,
  });
}

/**
 * Update an existing project via PATCH /api/projects/:id
 * Accepts canonical payload created by toBackendProjectPayload()
 */
export async function updateProjectApi(projectId, projectPayload, token = null, userId = null) {
  if (!projectId || !/^[0-9a-fA-F]{24}$/.test(projectId.toString())) {
    return { success: false, error: 'Invalid MongoDB project ID', status: 400, data: null };
  }

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  return await request(`/projects/${projectId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(projectPayload),
  });
}

/**
 * Close an existing project via POST /api/projects/:id/close
 */
export async function closeProjectApi(projectId, token = null, userId = null) {
  if (!projectId || !/^[0-9a-fA-F]{24}$/.test(projectId.toString())) {
    return { success: false, error: 'Invalid MongoDB project ID', status: 400, data: null };
  }

  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['x-user-id'] = userId;

  return await request(`/projects/${projectId}/close`, {
    method: 'POST',
    headers,
  });
}



/**
 * Normalizes backend Skill document to canonical frontend shape
 */
export function normalizeSkill(rawSkill) {
  if (!rawSkill) return null;
  const id = (rawSkill._id || rawSkill.id || '').toString();
  return {
    id,
    _id: id,
    name: rawSkill.name || '',
    categories: Array.isArray(rawSkill.categories) ? rawSkill.categories : [],
    aliases: Array.isArray(rawSkill.aliases) ? rawSkill.aliases : [],
  };
}

/**
 * Normalizes a string for fuzzy skill matching (ignoring punctuation, spaces, case)
 */
function normalizeSkillKey(str) {
  if (!str || typeof str !== 'string') return '';
  return str.toLowerCase().replace(/[\s\-_./]/g, '').trim();
}

/**
 * Resolves a single skill input (ObjectId, object, name, alias, or slug)
 * to its canonical MongoDB ObjectId string.
 *
 * Rules:
 * - Do NOT silently send the old slug.
 * - Do NOT invent a MongoDB ObjectId.
 * - Return null if cannot be resolved.
 */
export function resolveSkillToId(skillInput, canonicalSkills = []) {
  if (!skillInput) return null;

  // 1. If it's an object with _id or id
  if (typeof skillInput === 'object') {
    const rawId = (skillInput._id || skillInput.id || '').toString();
    if (rawId && /^[0-9a-fA-F]{24}$/.test(rawId)) {
      return rawId;
    }
    // Try resolving by object.name
    if (skillInput.name) {
      return resolveSkillToId(skillInput.name, canonicalSkills);
    }
    return null;
  }

  const strInput = String(skillInput).trim();
  if (!strInput) return null;

  // 2. If it is already a valid 24-character hex MongoDB ObjectId
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(strInput);
  if (isMongoId) {
    if (Array.isArray(canonicalSkills) && canonicalSkills.length > 0) {
      const match = canonicalSkills.find((s) => (s._id || s.id || '').toString() === strInput);
      if (match) return strInput;
      return strInput;
    }
    return strInput;
  }

  // 3. Search in canonicalSkills list by exact name, alias, or normalized key
  if (Array.isArray(canonicalSkills) && canonicalSkills.length > 0) {
    const normalizedInput = normalizeSkillKey(strInput);

    for (const skill of canonicalSkills) {
      const sId = (skill._id || skill.id || '').toString();
      if (!sId) continue;

      // Exact name match (case-insensitive)
      if (skill.name && skill.name.toLowerCase() === strInput.toLowerCase()) {
        return sId;
      }

      // Alias match (case-insensitive)
      if (Array.isArray(skill.aliases)) {
        if (skill.aliases.some((a) => a && a.toLowerCase() === strInput.toLowerCase())) {
          return sId;
        }
      }

      // Normalized key match (e.g. "reactjs" -> "React", "nodejs" -> "Node.js", "c++" -> "C++")
      if (normalizeSkillKey(skill.name) === normalizedInput) {
        return sId;
      }
      if (Array.isArray(skill.aliases)) {
        if (skill.aliases.some((a) => normalizeSkillKey(a) === normalizedInput)) {
          return sId;
        }
      }
    }
  }

  return null;
}

/**
 * Maps an array of skill inputs to unique canonical MongoDB ObjectId strings.
 * Enforces deduplication using Skill._id.
 * Throws an Error if any skill cannot be mapped to a canonical backend Skill.
 */
export function mapSkillsToIds(skillsList, canonicalSkills = []) {
  if (!Array.isArray(skillsList)) return [];

  const resolvedIds = [];
  const unmappedSkills = [];

  for (const skill of skillsList) {
    if (!skill) continue;
    const resolvedId = resolveSkillToId(skill, canonicalSkills);
    if (resolvedId) {
      resolvedIds.push(resolvedId);
    } else {
      const display = typeof skill === 'object' ? skill.name || skill.id || JSON.stringify(skill) : String(skill);
      unmappedSkills.push(display);
    }
  }

  if (unmappedSkills.length > 0) {
    throw new Error(
      `Cannot map skill(s) to canonical backend Skill ID: ${unmappedSkills.join(', ')}. Please select valid skills.`
    );
  }

  // Deduplicate canonical Skill ObjectIds
  return [...new Set(resolvedIds)];
}

/**
 * Normalizes backend requiredSkills (populated objects or ObjectIds)
 * into frontend display names (techStack) and structured skill objects.
 */
export function mapSkillsFromBackend(requiredSkills = [], canonicalSkills = []) {
  if (!Array.isArray(requiredSkills)) {
    return { techStack: [], skillObjects: [] };
  }

  const techStack = [];
  const skillObjects = [];

  for (const item of requiredSkills) {
    if (!item) continue;

    if (typeof item === 'object' && item.name) {
      const id = (item._id || item.id || '').toString();
      techStack.push(item.name);
      skillObjects.push({
        id,
        _id: id,
        name: item.name,
        categories: Array.isArray(item.categories) ? item.categories : [],
        aliases: Array.isArray(item.aliases) ? item.aliases : [],
      });
    } else {
      const idStr = item.toString();
      let matchedName = idStr;

      if (Array.isArray(canonicalSkills) && canonicalSkills.length > 0) {
        const found = canonicalSkills.find((s) => (s._id || s.id || '').toString() === idStr);
        if (found) {
          matchedName = found.name;
          skillObjects.push({
            id: idStr,
            _id: idStr,
            name: found.name,
            categories: found.categories || [],
            aliases: found.aliases || [],
          });
        } else {
          skillObjects.push({ id: idStr, _id: idStr, name: idStr });
        }
      } else {
        skillObjects.push({ id: idStr, _id: idStr, name: idStr });
      }

      techStack.push(matchedName);
    }
  }

  return { techStack: [...new Set(techStack)], skillObjects };
}

/**
 * ONE canonical project normalization function.
 * Converts backend Project data into the frontend Project UI shape.
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (/^(javascript|vbscript|data(?!:image\/)):/i.test(trimmed)) {
    return false;
  }
  return /^https?:\/\/.+/i.test(trimmed) || /^data:image\//i.test(trimmed);
}

export function normalizeProject(rawProject, canonicalSkills = []) {
  if (!rawProject) return null;

  const id = (rawProject._id || rawProject.id || '').toString();
  const rawSkills = rawProject.requiredSkills || [];

  const { techStack, skillObjects } = mapSkillsFromBackend(rawSkills, canonicalSkills);

  // Status mapping:
  // Backend "OPEN" -> Frontend "Recruiting"
  // Backend "CLOSED" -> Frontend "CLOSED"
  const rawStatus = (rawProject.status || 'OPEN').toUpperCase();
  const status = rawStatus === 'CLOSED' ? 'CLOSED' : 'Recruiting';

  // Owner mapping (authenticated user, no hardcoded u1):
  let owner = null;
  if (rawProject.owner) {
    if (typeof rawProject.owner === 'object') {
      const ownerId = (rawProject.owner._id || rawProject.owner.id || '').toString();
      owner = {
        id: ownerId,
        _id: ownerId,
        name: rawProject.owner.name || 'Owner',
        email: rawProject.owner.email || '',
        avatar: rawProject.owner.avatar || null,
        role: rawProject.owner.role || 'Developer',
        bio: rawProject.owner.bio || '',
      };
    } else {
      owner = rawProject.owner.toString();
    }
  }

  // Members mapping
  const members = Array.isArray(rawProject.members)
    ? rawProject.members.map((m) => {
        if (typeof m === 'object' && m !== null) {
          const mId = (m._id || m.id || '').toString();
          return {
            id: mId,
            _id: mId,
            name: m.name || 'Member',
            avatar: m.avatar || null,
            role: m.role || 'Developer',
          };
        }
        return { id: m.toString(), _id: m.toString() };
      })
    : [];

  const minMembers = Number(rawProject.teamSize?.min ?? 2);
  const maxMembers = Number(rawProject.teamSize?.max ?? 5);
  const roles = Array.isArray(rawProject.requiredRoles) ? rawProject.requiredRoles : [];

  const rawImage = typeof rawProject.image === 'string' ? rawProject.image.trim() : null;
  const isImageHttp = rawImage && (rawImage.startsWith('http://') || rawImage.startsWith('https://') || rawImage.startsWith('data:image/'));
  const image = isImageHttp ? rawImage : (rawImage || null);
  const icon = rawProject.icon || (isImageHttp ? '🚀' : (rawImage || '🚀'));

  return {
    id,
    _id: id,
    title: rawProject.title || '',
    description: rawProject.description || '',
    category: rawProject.category || 'Web Development',
    duration: rawProject.duration || '1-2 months',

    // Canonical skills and UI techStack
    requiredSkills: skillObjects,
    techStack, // UI array of display names

    // Roles
    requiredRoles: roles,
    wantedRoles: roles, // UI alias

    // Team size
    teamSize: {
      min: minMembers,
      max: maxMembers,
    },
    minMembers, // UI alias
    maxMembers, // UI alias

    // Image / Icon
    image,
    icon,

    // Status
    status,
    backendStatus: rawStatus,

    // Owner & Members
    owner,
    members,
    membersCount: members.length || 1,

    // Interests & Activity
    interests: Array.isArray(rawProject.interests) ? rawProject.interests : [],
    lastActivityAt: rawProject.lastActivityAt || rawProject.updatedAt || null,
    createdAt: rawProject.createdAt || null,
    updatedAt: rawProject.updatedAt || null,

    raw: rawProject,
  };
}

/**
 * Converts frontend project shape into canonical backend Project payload.
 * Enforces:
 * - requiredSkills: array of MongoDB Skill ObjectIds (deduplicated)
 * - requiredRoles: array of strings
 * - teamSize: { min, max }
 * - image: URL string or null
 * - status: 'OPEN' | 'CLOSED'
 */
export function toBackendProjectPayload(formData, canonicalSkills = []) {
  if (!formData) throw new Error('Project data is required');

  const title = (formData.title || '').trim();
  const description = (formData.description || '').trim();
  const category = (formData.category || '').trim();
  const duration = (formData.duration || '').trim();

  // Map skills to canonical MongoDB ObjectIds
  const inputSkills = formData.requiredSkills || formData.techStack || [];
  const requiredSkills = mapSkillsToIds(inputSkills, canonicalSkills);

  // Map roles
  const roles = formData.requiredRoles || formData.wantedRoles || [];
  const requiredRoles = Array.isArray(roles)
    ? roles.map((r) => (typeof r === 'string' ? r.trim() : '')).filter(Boolean)
    : [];

  // Map team size
  const min = Number(formData.teamSize?.min ?? formData.minMembers ?? 2);
  const max = Number(formData.teamSize?.max ?? formData.maxMembers ?? 5);

  // Map image
  let image = formData.image !== undefined ? formData.image : (formData.icon || null);
  if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:image/'))) {
    image = image.trim();
  } else if (typeof image === 'string' && image.length > 5 && !image.includes('🚀') && !image.includes('⚡')) {
    image = image.trim();
  } else {
    image = null;
  }

  // Map interests
  const interests = Array.isArray(formData.interests)
    ? formData.interests.map((i) => (typeof i === 'string' ? i.trim() : '')).filter(Boolean)
    : [];

  // Map status: Only OPEN or CLOSED
  const rawStatus = (formData.backendStatus || formData.status || 'OPEN').toUpperCase();
  const status = rawStatus === 'CLOSED' ? 'CLOSED' : 'OPEN';

  const payload = {
    title,
    description,
    category,
    duration,
    requiredSkills,
    requiredRoles,
    teamSize: {
      min,
      max,
    },
    interests,
    status,
  };

  if (formData.image !== undefined) {
    payload.image = image;
  } else if (image) {
    payload.image = image;
  }

  return payload;
}

/* ========================================================================= */
/* AUTHENTICATION APIS (Chunk 12B & 12F)                                     */
/* ========================================================================= */

/**
 * Authenticate user with email and password via POST /api/auth/login
 * Returns access token, refresh token (for mobile clients), and user details.
 */
export async function loginApi(email, password) {
  if (!email || !password) {
    return {
      success: false,
      status: 400,
      error: 'Email and password are required',
      data: null,
    };
  }

  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    skipAuth: true,
    skipRefresh: true,
  });

  if (!result.success) {
    return result;
  }

  const payload = result.data || {};
  return {
    success: true,
    status: result.status,
    message: payload.message || 'Login successful',
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    user: payload.user,
    data: payload,
  };
}

/**
 * Register a new user via POST /api/auth/register
 * Dispatches a verification OTP to the specified email address.
 */
export async function registerApi(nameOrPayload, maybeEmail, maybePassword) {
  let name, email, password;
  if (typeof nameOrPayload === 'object' && nameOrPayload !== null) {
    name = nameOrPayload.name;
    email = nameOrPayload.email;
    password = nameOrPayload.password;
  } else {
    name = nameOrPayload;
    email = maybeEmail;
    password = maybePassword;
  }

  if (!name || !email || !password) {
    return {
      success: false,
      status: 400,
      error: 'Name, email, and password are required',
      data: null,
    };
  }

  const result = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    }),
    skipAuth: true,
    skipRefresh: true,
  });

  if (!result.success) {
    return result;
  }

  const payload = result.data || {};
  return {
    success: true,
    status: result.status,
    message: payload.message || 'Registration successful. Please check your email for the verification OTP.',
    data: payload.data || payload,
  };
}

/**
 * Verify account email using a 6-digit OTP via POST /api/auth/verify-email
 */
export async function verifyEmailApi(emailOrPayload, maybeOtp) {
  let email, otp;
  if (typeof emailOrPayload === 'object' && emailOrPayload !== null) {
    email = emailOrPayload.email;
    otp = emailOrPayload.otp;
  } else {
    email = emailOrPayload;
    otp = maybeOtp;
  }

  if (!email || !otp) {
    return {
      success: false,
      status: 400,
      error: 'Email and verification code are required',
      data: null,
    };
  }

  const result = await request('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      otp: otp.toString().trim(),
    }),
    skipAuth: true,
    skipRefresh: true,
  });

  if (!result.success) {
    return result;
  }

  const payload = result.data || {};
  return {
    success: true,
    status: result.status,
    message: payload.message || 'Email verified successfully! You can now log in to your account.',
    data: payload.data || payload,
  };
}

/**
 * Rotate refresh token and issue fresh access token via POST /api/auth/refresh
 * Supports mobile clients by transmitting refreshToken in request body and header.
 * Uses skipAuth and skipRefresh to prevent circular loops.
 */
export async function refreshTokenApi(refreshToken = null) {
  const tokenToUse = refreshToken || (await getEffectiveRefreshToken());
  const headers = {};
  if (tokenToUse) {
    headers['x-refresh-token'] = tokenToUse;
  }

  const options = {
    method: 'POST',
    headers,
    skipAuth: true,
    skipRefresh: true,
  };

  if (tokenToUse) {
    options.body = JSON.stringify({ refreshToken: tokenToUse });
  }

  const result = await request('/auth/refresh', options);

  if (!result.success) {
    return result;
  }

  const payload = result.data || {};
  return {
    success: true,
    status: result.status,
    message: payload.message || 'Token refreshed successfully.',
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    data: payload,
  };
}

/**
 * Invalidate user session on backend and clear cookies via POST /api/auth/logout
 * Supports mobile clients by passing refreshToken in request body and header.
 * Uses skipRefresh to avoid triggering token refresh during logout.
 */
export async function logoutApi(refreshToken = null) {
  const tokenToUse = refreshToken || (await getEffectiveRefreshToken());
  const headers = {};
  if (tokenToUse) {
    headers['x-refresh-token'] = tokenToUse;
  }

  const options = {
    method: 'POST',
    headers,
    skipRefresh: true,
  };

  if (tokenToUse) {
    options.body = JSON.stringify({ refreshToken: tokenToUse });
  }

  const result = await request('/auth/logout', options);

  if (!result.success) {
    return result;
  }

  const payload = result.data || {};
  return {
    success: true,
    status: result.status,
    message: payload.message || 'Logged out successfully.',
    data: payload,
  };
}

/**
 * Request password reset email via POST /api/auth/forgot-password
 * Returns generic anti-enumeration response from backend.
 */
export async function forgotPasswordApi(email) {
  if (!email) {
    return {
      success: false,
      status: 400,
      error: 'Email is required',
      data: null,
    };
  }

  const result = await request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
    skipAuth: true,
    skipRefresh: true,
  });

  if (!result.success) {
    return result;
  }

  const payload = result.data || {};
  return {
    success: true,
    status: result.status,
    message: payload.message || 'If an account exists for that email, a password reset link has been sent.',
    data: payload,
  };
}

/**
 * Reset password using single-use reset token via POST /api/auth/reset-password
 */
export async function resetPasswordApi(tokenOrPayload, maybePassword) {
  let token, password;
  if (typeof tokenOrPayload === 'object' && tokenOrPayload !== null) {
    token = tokenOrPayload.token;
    password = tokenOrPayload.password || tokenOrPayload.newPassword;
  } else {
    token = tokenOrPayload;
    password = maybePassword;
  }

  if (!token || !password) {
    return {
      success: false,
      status: 400,
      error: 'Reset token and new password are required',
      data: null,
    };
  }

  const result = await request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token: token.trim(), password, newPassword: password }),
    skipAuth: true,
    skipRefresh: true,
  });

  if (!result.success) {
    return result;
  }

  const payload = result.data || {};
  return {
    success: true,
    status: result.status,
    message: payload.message || 'Password reset successfully. Please log in again.',
    data: payload,
  };
}

/**
 * Retrieve authenticated user profile via GET /api/auth/me
 * Uses centralized token injection when token is omitted.
 */
export async function getMeApi(accessToken = null) {
  const headers = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const result = await request('/auth/me', {
    method: 'GET',
    headers,
  });

  if (!result.success) {
    return result;
  }

  const payload = result.data || {};
  return {
    success: true,
    status: result.status,
    user: payload.data || payload,
    data: payload.data || payload,
  };
}

/**
 * Update authenticated user profile via PUT /api/auth/me
 * Uses centralized token injection when token is omitted.
 */
export async function updateProfileApi(profileData, token = null) {
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const result = await request('/auth/me', {
    method: 'PUT',
    headers,
    body: JSON.stringify(profileData || {}),
  });

  if (!result.success) {
    return result;
  }

  const payload = result.data || {};
  return {
    success: true,
    status: result.status,
    user: payload.data || payload,
    data: payload.data || payload,
    message: payload.message || 'Profile updated successfully',
  };
}

/**
 * Normalizes backend Developer/User document to frontend Discovery/Profile UI shape
 */
export function normalizeDeveloper(rawDev, activeProject = null) {
  if (!rawDev) return null;

  const id = (rawDev._id || rawDev.id || '').toString();
  const name = rawDev.name || 'Developer';
  const role = rawDev.role || rawDev.preferredRole || 'Full Stack Developer';
  const preferredRole = rawDev.preferredRole || rawDev.role || 'Full Stack Developer';
  const avatar =
    rawDev.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  const skills = Array.isArray(rawDev.skills) ? rawDev.skills : [];
  const interests = Array.isArray(rawDev.interests) ? rawDev.interests : [];
  const bio = rawDev.bio || rawDev.introduction || 'Excited to collaborate on ambitious projects!';
  const introduction = rawDev.introduction || rawDev.bio || '';
  const experience = rawDev.experience || '2+ Years';
  const availability = rawDev.availability || 'Available';
  const location = rawDev.location || 'Remote OK';
  const github = rawDev.github || '';
  const linkedin = rawDev.linkedin || '';
  const portfolio = rawDev.portfolio || '';

  // Calculate dynamic matchScore if activeProject is provided, otherwise default or preserved score
  let matchScore = rawDev.matchScore || 85;
  if (activeProject && Array.isArray(skills) && skills.length > 0) {
    const requiredSkills = activeProject.requiredSkills || activeProject.techStack || [];
    let matchedCount = 0;
    skills.forEach((s) => {
      const sLower = String(s).toLowerCase();
      if (
        requiredSkills.some((rs) => {
          const rsName = typeof rs === 'string' ? rs : (rs.name || rs.label || '');
          const rsLower = rsName.toLowerCase();
          return rsLower.includes(sLower) || sLower.includes(rsLower);
        })
      ) {
        matchedCount++;
      }
    });
    matchScore = Math.min(99, Math.max(78, 80 + matchedCount * 6));
  }

  return {
    id,
    _id: id,
    name,
    role,
    preferredRole,
    avatar,
    skills,
    interests,
    bio,
    introduction,
    experience,
    availability,
    location,
    github,
    linkedin,
    portfolio,
    matchScore,
    lookingTo: rawDev.lookingTo || [
      { label: 'Join a project', selected: true },
      { label: 'Find co-founders', selected: false },
      { label: 'Contribute to open source', selected: true },
      { label: 'Just meet devs', selected: false },
    ],
    invitationStatus: rawDev.invitationStatus || 'None',
    invitationId: rawDev.invitationId || null,
    raw: rawDev,
  };
}

export default {
  API_BASE_URL,
  getApiBaseUrl,
  getSocketBaseUrl,
  request,
  setAuthTokensInMemory,
  setAuthToken,
  getAuthToken,
  getInMemoryAccessToken,
  getInMemoryRefreshToken,
  getEffectiveAccessToken,
  getEffectiveRefreshToken,
  onTokenRefreshed,
  onSessionRevoked,
  fetchMatchesApi,
  fetchChatConversations,
  fetchChatMessages,
  sendChatMessage,
  fetchInvitationsApi,
  acceptInvitationApi,
  rejectInvitationApi,
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  markAllNotificationsReadApi,
  normalizeMatch,
  normalizeInvitation,
  normalizeMessage,
  normalizeConversation,
  normalizeNotification,
  // Project & Skill additions
  fetchSkillsApi,
  fetchSkillCategoriesApi,
  fetchSkillByIdApi,
  createProjectApi,
  fetchMyProjectsApi,
  fetchProjectByIdApi,
  updateProjectApi,
  closeProjectApi,
  normalizeSkill,
  resolveSkillToId,
  mapSkillsToIds,
  mapSkillsFromBackend,
  normalizeProject,
  toBackendProjectPayload,
  // Auth additions (Chunk 12B & 12F)
  loginApi,
  registerApi,
  verifyEmailApi,
  refreshTokenApi,
  logoutApi,
  forgotPasswordApi,
  resetPasswordApi,
  getMeApi,
  updateProfileApi,
  normalizeDeveloper,
  isValidImageUrl,
};



