import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import {
  INITIAL_DEVELOPERS,
  INITIAL_PROJECTS,
  INITIAL_INVITATIONS,
  INITIAL_MATCHES,
  INITIAL_CHATS,
  CURRENT_USER_PROFILE,
} from '../data/projectsData';
import { getSkillLabels } from '../data/skillsDatabase';
import {
  getSocketBaseUrl,
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
  markAllNotificationsReadApi,
  normalizeMatch,
  normalizeInvitation,
  normalizeMessage,
  normalizeConversation,
  normalizeNotification,
  fetchSkillsApi,
  normalizeSkill,
  normalizeProject,
  toBackendProjectPayload,
  mapSkillsToIds,
  resolveSkillToId,
  createProjectApi,
  fetchMyProjectsApi,
  fetchProjectByIdApi,
  updateProjectApi,
  getMeApi,
  updateProfileApi,
  normalizeDeveloper,
  fetchDiscoveryDevelopersApi,
  refreshTokenApi,
  loginApi,
  registerApi,
  verifyEmailApi,
  logoutApi,
  setAuthToken,
  getAuthToken,
  getEffectiveRefreshToken,
  onTokenRefreshed,
  onSessionRevoked,
} from '../utils/api';
import {
  saveAuthTokens,
  getAuthTokens,
  clearAuthTokens,
} from '../utils/authStorage';

const AppContext = createContext();

export function AppProvider({ children }) {
  // 1. AUTH STATE (Chunk 12C - Secure Mobile Session Persistence)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Session version and race-condition guards (Chunk 12G)
  const isLoggingOutRef = useRef(false);
  const sessionVersion = useRef(0);
  const isAuthenticatedRef = useRef(false);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

  // 2. PROJECTS STATE (Backend MongoDB is source of truth)
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [viewedProjectId, setViewedProjectId] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  // 2b. CANONICAL SKILLS STATE (Chunk 11A)
  const [canonicalSkills, setCanonicalSkills] = useState([]);
  const [canonicalSkillsLoading, setCanonicalSkillsLoading] = useState(false);
  const [canonicalSkillsError, setCanonicalSkillsError] = useState(null);

  const loadCanonicalSkills = async () => {
    setCanonicalSkillsLoading(true);
    setCanonicalSkillsError(null);
    try {
      const res = await fetchSkillsApi();
      if (res.success && Array.isArray(res.data)) {
        const normalized = res.data.map(normalizeSkill).filter(Boolean);
        setCanonicalSkills(normalized);
        return { success: true, data: normalized };
      } else {
        const msg = res.error || 'Failed to load canonical skills';
        setCanonicalSkillsError(msg);
        return { success: false, error: msg };
      }
    } catch (err) {
      setCanonicalSkillsError(err.message || 'Error loading canonical skills');
      return { success: false, error: err.message };
    } finally {
      setCanonicalSkillsLoading(false);
    }
  };

  const getCanonicalSkill = (idOrName) => {
    if (!idOrName) return null;
    const search = idOrName.toString().toLowerCase().trim();
    return (
      canonicalSkills.find(
        (s) =>
          s.id.toLowerCase() === search ||
          s.name.toLowerCase() === search ||
          (Array.isArray(s.aliases) && s.aliases.some((a) => a.toLowerCase() === search))
      ) || null
    );
  };

  // 3. DISCOVERY STATE (Real MongoDB Backend Developers)
  const [discoveryDevelopers, setDiscoveryDevelopers] = useState([]);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryError, setDiscoveryError] = useState(null);

  // Track skipped and invited developer IDs per project: { [projectId]: ['d1', 'd2'] }
  const [skippedDevsByProject, setSkippedDevsByProject] = useState({});
  const [invitedDevsByProject, setInvitedDevsByProject] = useState({});

  // 4. INVITATIONS & MATCHES STATE
  const [invitations, setInvitations] = useState([]);
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState(null);
  const [pendingMatchCelebration, setPendingMatchCelebration] = useState(null);

  // 5. CHATS STATE (Real conversations keyed by MongoDB Match._id)
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [chatError, setChatError] = useState(null);

  // Socket.IO realtime connection & typing state
  const socketRef = useRef(null);
  const activeChatIdRef = useRef(activeChatId);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typingStatusByMatch, setTypingStatusByMatch] = useState({});

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Selected developer when viewing third-party profile from Discover / Matches
  const [selectedDeveloperForProfile, setSelectedDeveloperForProfile] = useState(null);

  // 6. NOTIFICATIONS STATE
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // 7. SETTINGS STATE
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- AUTH ACTIONS & SESSION RESTORATION (Chunk 12C, 12F & 12G) ---
  const restoreSession = async () => {
    const currentVersion = sessionVersion.current;
    setAuthLoading(true);
    setAuthError(null);
    try {
      // 1. Read tokens from SecureStore
      const { accessToken: storedAccess, refreshToken: storedRefresh } = await getAuthTokens();

      if (sessionVersion.current !== currentVersion) return { success: false, reason: 'aborted' };

      // Synchronize in-memory tokens in api.js immediately
      if (storedAccess || storedRefresh) {
        setAuthToken(storedAccess, storedRefresh);
      }

      // 2. If neither token exists, remain unauthenticated
      if (!storedAccess && !storedRefresh) {
        if (sessionVersion.current !== currentVersion) return { success: false, reason: 'aborted' };
        setAuthToken(null, null);
        setIsAuthenticated(false);
        setAccessToken(null);
        setRefreshToken(null);
        setCurrentUser(null);
        return { success: false, reason: 'no_tokens' };
      }

      // 3. If access token exists, verify with getMeApi
      if (storedAccess) {
        const meRes = await getMeApi(storedAccess);
        if (sessionVersion.current !== currentVersion) return { success: false, reason: 'aborted' };

        if (meRes.success && meRes.user) {
          const effectiveAccess = getAuthToken() || storedAccess;
          const userObj = { ...meRes.user, token: effectiveAccess };
          setCurrentUser(userObj);
          setAccessToken(effectiveAccess);
          setRefreshToken(storedRefresh || null);
          setIsAuthenticated(true);
          loadDiscoveryDevelopers();
          return { success: true, user: userObj };
        }
      }

      // 4. Access token missing or rejected - try refresh token fallback
      if (storedRefresh) {
        const refreshRes = await refreshTokenApi(storedRefresh);
        if (sessionVersion.current !== currentVersion) return { success: false, reason: 'aborted' };

        if (refreshRes.success && refreshRes.accessToken) {
          const newAccess = refreshRes.accessToken;
          const newRefresh = refreshRes.refreshToken || storedRefresh;

          // Save rotated tokens to SecureStore & in-memory cache immediately
          await saveAuthTokens(newAccess, newRefresh);
          setAuthToken(newAccess, newRefresh);
          setAccessToken(newAccess);
          setRefreshToken(newRefresh);

          // Restore authoritative user profile
          const meRes = await getMeApi(newAccess);
          if (sessionVersion.current !== currentVersion) return { success: false, reason: 'aborted' };

          if (meRes.success && meRes.user) {
            const userObj = { ...meRes.user, token: newAccess };
            setCurrentUser(userObj);
            setIsAuthenticated(true);
            loadDiscoveryDevelopers();
            return { success: true, user: userObj };
          }
        } else if (refreshRes.status === 401 || refreshRes.status === 400 || refreshRes.status === 403) {
          // Explicit rejection: refresh token revoked, expired, or invalid
          await clearAuthTokens();
          setAuthToken(null, null);
          setAccessToken(null);
          setRefreshToken(null);
          setCurrentUser(null);
          setIsAuthenticated(false);
          return { success: false, reason: 'refresh_rejected' };
        } else {
          // Temporary network failure: do not clear stored tokens
          setIsAuthenticated(false);
          return { success: false, reason: 'network_failure' };
        }
      }

      // 5. If access token failed and no refresh token exists, clear tokens
      await clearAuthTokens();
      setAuthToken(null, null);
      setAccessToken(null);
      setRefreshToken(null);
      setCurrentUser(null);
      setIsAuthenticated(false);
      return { success: false, reason: 'invalid_session' };
    } catch (err) {
      if (sessionVersion.current !== currentVersion) return { success: false, reason: 'aborted' };
      setIsAuthenticated(false);
      return { success: false, error: err.message };
    } finally {
      if (sessionVersion.current === currentVersion) {
        setAuthLoading(false);
      }
    }
  };

  // Restore session once on initial app startup
  const hasRestoredSession = useRef(false);
  useEffect(() => {
    if (!hasRestoredSession.current) {
      hasRestoredSession.current = true;
      restoreSession();
    }
  }, []);

  // Listen for automatic token refreshes or session revocations from api.js (Chunk 12F & 12G)
  useEffect(() => {
    const unsubRefresh = onTokenRefreshed((newAccess, newRefresh) => {
      // Guard against stale refresh after logout
      if (!isAuthenticatedRef.current || isLoggingOutRef.current) {
        return;
      }
      setAccessToken(newAccess);
      if (newRefresh) {
        setRefreshToken(newRefresh);
      }
    });

    const unsubRevoke = () => {
      logout();
    };
    const unsubSession = onSessionRevoked(unsubRevoke);

    return () => {
      unsubRefresh();
      unsubSession();
    };
  }, []);

  const login = async (email, password) => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }
    setAuthError(null);
    try {
      const res = await loginApi(email, password);
      if (res.success && res.accessToken) {
        const { accessToken: newAccess, refreshToken: newRefresh, user } = res;
        await saveAuthTokens(newAccess, newRefresh);
        setAuthToken(newAccess, newRefresh);
        setAccessToken(newAccess);
        setRefreshToken(newRefresh);
        let userObj = { ...(user || {}), token: newAccess };
        try {
          const meRes = await getMeApi(newAccess);
          if (meRes.success && meRes.user) {
            userObj = { ...meRes.user, token: newAccess };
          }
        } catch {}
        setCurrentUser(userObj);
        setIsAuthenticated(true);
        setAuthError(null);
        loadDiscoveryDevelopers();
        return { success: true, user: userObj };
      } else {
        const msg = res.error || 'Login failed';
        setAuthError(msg);
        return { success: false, error: msg, status: res.status };
      }
    } catch (err) {
      const msg = err.message || 'Login request error';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async ({ name, email, role, password }) => {
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 characters)' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }
    setAuthError(null);
    try {
      const res = await registerApi({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      if (res.success) {
        // Successful registration requires email OTP verification; does not authenticate automatically
        return { success: true, data: res.data, message: res.message };
      } else {
        const msg = res.error || 'Registration failed';
        setAuthError(msg);
        return { success: false, error: msg, status: res.status };
      }
    } catch (err) {
      const msg = err.message || 'Registration request error';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const verifyEmail = async (email, otp) => {
    if (!email || !otp) {
      return { success: false, error: 'Email and verification code are required' };
    }
    setAuthError(null);
    try {
      const res = await verifyEmailApi(email, otp);
      if (res.success) {
        return { success: true, data: res.data, message: res.message };
      } else {
        const msg = res.error || 'Verification failed';
        setAuthError(msg);
        return { success: false, error: msg, status: res.status };
      }
    } catch (err) {
      const msg = err.message || 'Verification request error';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    // 23. Double logout protection
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    // 18 & 19. Invalidate current session operations (restoreSession, refresh, async loaders)
    sessionVersion.current += 1;

    try {
      // 3. Real backend logout: capture current refresh token and call logoutApi
      const storedTokens = await getAuthTokens();
      const currentRefresh = refreshToken || getEffectiveRefreshToken() || storedTokens.refreshToken;

      if (currentRefresh) {
        try {
          await Promise.race([
            logoutApi(currentRefresh),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Logout timeout')), 3000)),
          ]);
        } catch {
          // Backend or network logout failure: safe fallback, local logout must still succeed
        }
      }
    } catch {
      // Safe fallback
    }

    // 10 & 11. Socket.IO and active chat cleanup
    try {
      if (socketRef.current) {
        if (activeChatIdRef.current) {
          try {
            socketRef.current.emit('leave_conversation', { matchId: activeChatIdRef.current });
          } catch {}
        }
        if (typeof socketRef.current.removeAllListeners === 'function') {
          socketRef.current.removeAllListeners();
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    } catch {}
    setSocketConnected(false);

    // 5. Clear SecureStore
    try {
      await clearAuthTokens();
    } catch {}

    // 6. Clear in-memory tokens
    setAuthToken(null, null);

    // 6. Clear in-memory auth state
    setAccessToken(null);
    setRefreshToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAuthError(null);

    // 7. Clear user-specific application state
    setProjects([]);
    setActiveProjectId(null);
    setViewedProjectId(null);
    setProjectsLoading(false);
    setProjectsError(null);

    setMatches([]);
    setMatchesLoading(false);
    setMatchesError(null);
    setPendingMatchCelebration(null);

    setInvitations([]);

    setChats([]);
    setActiveChatId(null);
    setMessagesLoading(false);
    setChatError(null);

    setNotifications([]);
    setUnreadNotificationsCount(0);
    setNotificationsLoading(false);

    setSelectedDeveloperForProfile(null);
    setSkippedDevsByProject({});
    setInvitedDevsByProject({});
    setTypingStatusByMatch({});
    setDiscoveryDevelopers([]);
    setDiscoveryLoading(false);
    setDiscoveryError(null);

    isLoggingOutRef.current = false;
  };

  // --- PROJECT ACTIONS ---
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0] || null;
  }, [projects, activeProjectId]);

  const viewedProject = useMemo(() => {
    return projects.find((p) => p.id === viewedProjectId) || activeProject || null;
  }, [projects, viewedProjectId, activeProject]);

  const loadProjects = async () => {
    const currentVer = sessionVersion.current;
    if (!isAuthenticatedRef.current || isLoggingOutRef.current) {
      return { success: false, reason: 'unauthenticated' };
    }
    const token = currentUser?.token || accessToken || null;
    const uid = currentUser?._id || currentUser?.id;

    setProjectsLoading(true);
    setProjectsError(null);

    try {
      const res = await fetchMyProjectsApi(token, uid);
      if (sessionVersion.current !== currentVer || !isAuthenticatedRef.current || isLoggingOutRef.current) {
        return { success: false, reason: 'aborted' };
      }
      if (res.success && Array.isArray(res.data)) {
        const normalized = res.data.map((p) => normalizeProject(p, canonicalSkills)).filter(Boolean);
        setProjects(normalized);
        if (normalized.length > 0) {
          if (!activeProjectId || !normalized.some((p) => p.id === activeProjectId)) {
            setActiveProjectId(normalized[0].id);
          }
          if (!viewedProjectId || !normalized.some((p) => p.id === viewedProjectId)) {
            setViewedProjectId(normalized[0].id);
          }
        } else {
          setActiveProjectId(null);
          setViewedProjectId(null);
        }
        return { success: true, data: normalized };
      } else {
        const msg = res.error || 'Failed to load projects';
        setProjectsError(msg);
        return { success: false, error: msg };
      }
    } catch (err) {
      if (sessionVersion.current !== currentVer || !isAuthenticatedRef.current || isLoggingOutRef.current) {
        return { success: false, reason: 'aborted' };
      }
      setProjectsError(err.message || 'Error loading projects');
      return { success: false, error: err.message };
    } finally {
      if (sessionVersion.current === currentVer) {
        setProjectsLoading(false);
      }
    }
  };

  const createProject = async (projectData) => {
    const token = currentUser?.token || null;
    const uid = currentUser?._id || currentUser?.id;

    try {
      // 1. Convert form data to canonical backend payload using Chunk 11A converter
      const payload = toBackendProjectPayload(projectData, canonicalSkills);

      // 2. Submit to backend API: POST /api/projects
      const res = await createProjectApi(payload, token, uid);

      if (res.success && res.data) {
        // 3. Normalize backend project using Chunk 11A normalizer
        const normalized = normalizeProject(res.data, canonicalSkills);

        // 4. Update active project state (prepend real project, do not duplicate)
        setProjects((prev) => {
          const filtered = prev.filter((p) => p.id !== normalized.id);
          return [normalized, ...filtered];
        });

        setActiveProjectId(normalized.id);
        setViewedProjectId(normalized.id);

        addNotification({
          type: 'PROJECT',
          title: 'Project Created!',
          message: `"${normalized.title}" is now active for developer discovery.`,
        });

        return { success: true, project: normalized };
      } else {
        const errMsg = res.error || 'Failed to create project on server';
        return { success: false, error: errMsg };
      }
    } catch (err) {
      return { success: false, error: err.message || 'Error creating project' };
    }
  };

  const fetchProjectById = async (projectId) => {
    if (!projectId || !/^[0-9a-fA-F]{24}$/.test(projectId.toString())) {
      return { success: false, error: 'Invalid MongoDB project ID' };
    }

    const token = currentUser?.token || null;
    const uid = currentUser?._id || currentUser?.id;

    try {
      const res = await fetchProjectByIdApi(projectId, token, uid);
      if (res.success && res.data) {
        const normalized = normalizeProject(res.data, canonicalSkills);
        setProjects((prev) => {
          const index = prev.findIndex((p) => p.id === normalized.id);
          if (index !== -1) {
            const copy = [...prev];
            copy[index] = normalized;
            return copy;
          }
          return [normalized, ...prev];
        });
        return { success: true, project: normalized };
      } else {
        return { success: false, error: res.error || 'Failed to fetch project' };
      }
    } catch (err) {
      return { success: false, error: err.message || 'Error fetching project' };
    }
  };

  const updateProject = async (id, projectFormData) => {
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id.toString())) {
      return { success: false, error: 'Invalid MongoDB project ID' };
    }

    const token = currentUser?.token || null;
    const uid = currentUser?._id || currentUser?.id;

    try {
      const payload = toBackendProjectPayload(projectFormData, canonicalSkills);
      const res = await updateProjectApi(id, payload, token, uid);

      if (res.success && res.data) {
        const normalized = normalizeProject(res.data, canonicalSkills);

        setProjects((prev) =>
          prev.map((p) => (p.id === normalized.id ? normalized : p))
        );

        return { success: true, project: normalized };
      } else {
        const errMsg = res.error || 'Failed to update project on server';
        return { success: false, error: errMsg };
      }
    } catch (err) {
      return { success: false, error: err.message || 'Error updating project' };
    }
  };


  const deleteProject = (id) => {
    setProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (activeProjectId === id && filtered.length > 0) {
        setActiveProjectId(filtered[0].id);
      }
      if (viewedProjectId === id && filtered.length > 0) {
        setViewedProjectId(filtered[0].id);
      }
      return filtered;
    });
  };

  const closeProject = async (projectId) => {
    if (!projectId || !/^[0-9a-fA-F]{24}$/.test(projectId.toString())) {
      return { success: false, error: 'Invalid MongoDB project ID' };
    }

    const token = currentUser?.token || null;
    const uid = currentUser?._id || currentUser?.id;

    try {
      const res = await closeProjectApi(projectId, token, uid);
      if (res.success && res.data) {
        const normalized = normalizeProject(res.data, canonicalSkills);

        setProjects((prev) =>
          prev.map((p) => (p.id === normalized.id ? normalized : p))
        );

        addNotification({
          type: 'PROJECT',
          title: 'Project Closed',
          message: `"${normalized.title}" has been closed and is no longer recruiting.`,
        });

        return { success: true, project: normalized };
      } else {
        const errMsg = res.error || 'Failed to close project on server';
        return { success: false, error: errMsg };
      }
    } catch (err) {
      return { success: false, error: err.message || 'Error closing project' };
    }
  };


  // Load developers from backend GET /api/discovery/developers
  const loadDiscoveryDevelopers = async (filterOptions = {}) => {
    setDiscoveryLoading(true);
    setDiscoveryError(null);
    try {
      const effectiveProjectId =
        filterOptions.projectId !== undefined ? filterOptions.projectId : activeProjectId;
      const validProjectId =
        effectiveProjectId && /^[0-9a-fA-F]{24}$/.test(effectiveProjectId.toString())
          ? effectiveProjectId.toString()
          : null;

      const token = currentUser?.token || accessToken || null;
      const uid = currentUser?._id || currentUser?.id || null;

      const res = await fetchDiscoveryDevelopersApi(
        {
          projectId: validProjectId,
          search: filterOptions.search || '',
          skills: filterOptions.skills || '',
          role: filterOptions.role && filterOptions.role !== 'ALL' ? filterOptions.role : '',
          availability:
            filterOptions.availability && filterOptions.availability !== 'ALL'
              ? filterOptions.availability
              : '',
        },
        token,
        uid
      );

      const rawDevs = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.developers)
        ? res.data.developers
        : Array.isArray(res.data?.data)
        ? res.data.data
        : null;

      if (res.success && rawDevs) {
        const normalized = rawDevs
          .map((d) => normalizeDeveloper(d, activeProject))
          .filter(Boolean);
        setDiscoveryDevelopers(normalized);
        return { success: true, developers: normalized };
      } else {
        const msg = res.error || 'Failed to load discovery developers';
        setDiscoveryError(msg);
        return { success: false, error: msg };
      }
    } catch (err) {
      const msg = err.message || 'Error loading developers';
      setDiscoveryError(msg);
      return { success: false, error: msg };
    } finally {
      setDiscoveryLoading(false);
    }
  };

  // Re-fetch discovery whenever active project changes
  useEffect(() => {
    if (isAuthenticatedRef.current) {
      loadDiscoveryDevelopers();
    }
  }, [activeProjectId]);

  // --- DISCOVERY & MATCHING ACTIONS ---
  // Returns developers who have NOT been skipped or invited for the active project
  const availableDevelopersForActiveProject = useMemo(() => {
    const targetId = activeProjectId || activeProject?.id || 'default';
    const skipped = skippedDevsByProject[targetId] || [];
    const invited = invitedDevsByProject[targetId] || [];
    const excludedIds = new Set([...skipped, ...invited]);

    const pool = Array.isArray(discoveryDevelopers) ? discoveryDevelopers : [];

    return pool
      .filter((d) => d && !excludedIds.has(d.id))
      .map((d) => {
        let matchedSkills = 0;
        const projSkills = getSkillLabels(activeProject?.techStack || activeProject?.requiredSkills || []);
        const devSkills = Array.isArray(d.skills) ? d.skills : [];
        devSkills.forEach((s) => {
          if (
            projSkills.some(
              (ps) =>
                ps.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ps.toLowerCase())
            )
          ) {
            matchedSkills++;
          }
        });
        const calculatedScore = Math.min(99, Math.max(78, 80 + matchedSkills * 6));
        return {
          ...d,
          matchScore: d.matchScore || calculatedScore,
        };
      });
  }, [activeProjectId, activeProject, skippedDevsByProject, invitedDevsByProject, discoveryDevelopers]);

  const skipDeveloper = (devOrId, projId = null) => {
    const devId = typeof devOrId === 'object' && devOrId !== null ? (devOrId.id || devOrId._id) : devOrId;
    if (!devId) return;
    const targetId = projId || activeProjectId || activeProject?.id || 'default';
    setSkippedDevsByProject((prev) => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []).filter((id) => id !== devId), devId],
    }));
  };

  const unskipDeveloper = (devOrId, projId = null) => {
    const devId = typeof devOrId === 'object' && devOrId !== null ? (devOrId.id || devOrId._id) : devOrId;
    if (!devId) return;
    const targetId = projId || activeProjectId || activeProject?.id || 'default';
    setSkippedDevsByProject((prev) => ({
      ...prev,
      [targetId]: (prev[targetId] || []).filter((id) => id !== devId),
    }));
  };

  const uninviteDeveloper = (devOrId, projId = null) => {
    const devId = typeof devOrId === 'object' && devOrId !== null ? (devOrId.id || devOrId._id) : devOrId;
    if (!devId) return;
    const targetId = projId || activeProjectId || activeProject?.id || 'default';
    setInvitedDevsByProject((prev) => ({
      ...prev,
      [targetId]: (prev[targetId] || []).filter((id) => id !== devId),
    }));
    setInvitations((prev) =>
      prev.filter(
        (inv) => !(inv.developerId === devId && (inv.projectId === targetId || inv.projectId === activeProjectId))
      )
    );
  };

  const resetDiscoveryForProject = (projectId = null) => {
    const targetId = projectId || activeProjectId || activeProject?.id || 'default';
    setSkippedDevsByProject((prev) => ({
      ...prev,
      [targetId]: [],
    }));
    setInvitedDevsByProject((prev) => ({
      ...prev,
      [targetId]: [],
    }));
  };

  const inviteDeveloper = (devOrId, isSuper = false, projId = null) => {
    const devObj =
      typeof devOrId === 'object' && devOrId !== null
        ? devOrId
        : (discoveryDevelopers.find((d) => d.id === devOrId) || { id: devOrId, name: 'Developer', role: 'Full Stack' });
    const devId = devObj.id || devOrId;
    if (!devId) return;

    const targetId = projId || activeProjectId || activeProject?.id || 'default';

    // Record invited ID for active project so dev won't re-appear
    setInvitedDevsByProject((prev) => ({
      ...prev,
      [targetId]: [...(prev[targetId] || []).filter((id) => id !== devId), devId],
    }));

    // Create an invitation record tied to the active project
    const newInvitation = {
      id: `inv-${Date.now()}`,
      developerId: devId,
      developerName: devObj.name || 'Developer',
      developerRole: devObj.role || 'Full Stack Developer',
      developerAvatar: devObj.avatar || '',
      projectId: targetId,
      projectName: activeProject ? activeProject.title : 'StudySync',
      timeAgo: 'Just now',
      matchScore: devObj.matchScore || 95,
      isSuper,
      status: 'PENDING',
    };

    setInvitations((prev) => [newInvitation, ...prev]);

    // Add notification
    addNotification({
      type: 'INVITATION',
      title: isSuper ? 'Super Invite Sent!' : 'Invite Sent!',
      message: `Invited ${devObj.name || 'Developer'} to join ${newInvitation.projectName}.`,
    });
  };

  // --- SYNC WITH BACKEND MATCHES, CONVERSATIONS & INVITATIONS ---
  const refreshMatchesAndInvitations = async (explicitUserId = null) => {
    const currentVer = sessionVersion.current;
    if (!isAuthenticatedRef.current || isLoggingOutRef.current) return;
    const uid = explicitUserId || currentUser?._id || currentUser?.id;
    if (!uid) return;
    setMatchesLoading(true);
    setMatchesError(null);

    try {
      // 1. Fetch conversations/matches
      const matchRes = await fetchChatConversations(uid);
      if (sessionVersion.current !== currentVer || !isAuthenticatedRef.current || isLoggingOutRef.current) {
        return;
      }
      if (matchRes.success && Array.isArray(matchRes.data)) {
        const normalizedMatches = matchRes.data.map((m) => normalizeMatch(m, uid)).filter(Boolean);
        const normalizedChats = matchRes.data.map((m) => normalizeConversation(m, uid)).filter(Boolean);

        setMatches(normalizedMatches);

        setChats((prevChats) => {
          return normalizedChats.map((newChat) => {
            const existing = prevChats.find(
              (c) => c.id === newChat.id || c.matchId === newChat.matchId
            );
            if (existing && existing.messages && existing.messages.length > 0) {
              return {
                ...newChat,
                messages: existing.messages,
                lastMessage: existing.lastMessage || newChat.lastMessage,
                time: existing.time || newChat.time,
              };
            }
            return newChat;
          });
        });
      } else if (matchRes.success && Array.isArray(matchRes.data) && matchRes.data.length === 0) {
        setMatches([]);
        setChats([]);
      }

      // 2. Fetch received invitations
      const invRes = await fetchInvitationsApi(uid);
      if (sessionVersion.current !== currentVer || !isAuthenticatedRef.current || isLoggingOutRef.current) {
        return;
      }
      if (invRes.success && Array.isArray(invRes.data)) {
        const normalizedInvs = invRes.data.map(normalizeInvitation).filter(Boolean);
        setInvitations(normalizedInvs);
      }
    } catch (err) {
      console.warn('Could not sync matches with backend, keeping local state:', err.message);
    } finally {
      if (sessionVersion.current === currentVer) {
        setMatchesLoading(false);
      }
    }
  };

  // Fetch real notifications and unread count from backend
  const loadNotifications = async () => {
    const currentVer = sessionVersion.current;
    if (!isAuthenticatedRef.current || isLoggingOutRef.current) return;
    const uid = currentUser?._id || currentUser?.id;
    if (!uid) return;
    const token = currentUser?.token || null;
    setNotificationsLoading(true);

    try {
      // 1. Fetch notifications list
      const notifRes = await fetchNotifications(uid, token);
      if (sessionVersion.current !== currentVer || !isAuthenticatedRef.current || isLoggingOutRef.current) {
        return;
      }
      if (notifRes.success && Array.isArray(notifRes.data)) {
        const normalized = notifRes.data
          .map((n) => normalizeNotification(n, uid))
          .filter(Boolean);
        setNotifications(normalized);
      }

      // 2. Fetch unread count
      const countRes = await fetchUnreadNotificationCount(uid, token);
      if (sessionVersion.current !== currentVer || !isAuthenticatedRef.current || isLoggingOutRef.current) {
        return;
      }
      if (countRes.success && countRes.data && countRes.data.unreadCount !== undefined) {
        setUnreadNotificationsCount(countRes.data.unreadCount);
      } else if (notifRes.success && Array.isArray(notifRes.data)) {
        setUnreadNotificationsCount(notifRes.data.filter((n) => !n.readAt).length);
      }
    } catch (err) {
      console.warn('Failed to load notifications from backend:', err.message);
    } finally {
      if (sessionVersion.current === currentVer) {
        setNotificationsLoading(false);
      }
    }
  };

  // Sync on mount & when currentUser changes
  useEffect(() => {
    loadCanonicalSkills();
    if (isAuthenticated && currentUser) {
      loadProjects();
      refreshMatchesAndInvitations();
      loadNotifications();
    }
  }, [currentUser, isAuthenticated]);

  // --- INVITATIONS & MATCHES ---
  const acceptInvitation = async (invitation) => {
    const invId = invitation.id || invitation.invitationId;
    const uid = currentUser?._id || currentUser?.id || invitation.developerId;

    try {
      // Call backend API (creates Match document with status ACCEPTED)
      const res = await acceptInvitationApi(invId, uid);
      if (!res.success) {
        return {
          success: false,
          error: res.error || 'Failed to accept invitation. Project may be closed or full.',
        };
      }

      // Remove accepted invitation from local state
      setInvitations((prev) => prev.filter((i) => (i.id || i.invitationId) !== invId));

      // Refetch matches from backend to get the newly created real Match document
      let realMatchData = null;
      const matchRes = await fetchMatchesApi(uid);
      if (matchRes.success && Array.isArray(matchRes.data)) {
        const normalized = matchRes.data.map((m) => normalizeMatch(m, uid)).filter(Boolean);
        if (normalized.length > 0) {
          setMatches(normalized);
          realMatchData = normalized.find(
            (m) =>
              m.projectId === (invitation.projectId || activeProjectId) ||
              m.developerId === invitation.developerId ||
              (res.data?._id && m.id === res.data._id)
          );
        }
      }

      // Use the real backend Match document
      const newMatch =
        realMatchData || {
          id: (res.data?._id || `match-${Date.now()}`).toString(),
          matchId: (res.data?._id || `match-${Date.now()}`).toString(),
          developerId: invitation.developerId,
          developerName: invitation.developerName,
          developerRole: invitation.developerRole,
          developerAvatar: invitation.developerAvatar,
          projectId: invitation.projectId || activeProjectId,
          projectName: invitation.projectName || (activeProject ? activeProject.title : 'Project'),
          matchScore: invitation.matchScore || 96,
          breakdown: { skill: 52, interest: 26, role: 18 },
          recentMessage: `Matched for ${invitation.projectName || 'project'}! Start the discussion.`,
          status: 'ACCEPTED',
          createdAt: 'Just now',
        };

      if (!realMatchData) {
        setMatches((prev) => [newMatch, ...prev]);
      }

      // Automatically ensure chat thread exists keyed by real Match ID
      const chatId = (newMatch.id || newMatch.matchId).toString();
      setChats((prev) => {
        const exists = prev.some((c) => c.id === chatId || c.matchId === chatId);
        if (!exists) {
          const newChat = {
            id: chatId,
            matchId: chatId,
            projectId: newMatch.projectId,
            projectName: newMatch.projectName,
            developerId: newMatch.developerId,
            developerName: newMatch.developerName,
            developerRole: newMatch.developerRole,
            developerAvatar: newMatch.developerAvatar,
            status: 'Online',
            lastMessage: `You matched for ${newMatch.projectName}! Start chatting.`,
            time: 'Just now',
            unreadCount: 0,
            messages: [],
          };
          return [newChat, ...prev];
        }
        return prev;
      });

      // Trigger "It's a Match!" celebration modal
      setPendingMatchCelebration(newMatch);

      // Add Notification
      addNotification({
        type: 'MATCH',
        title: "It's a Match!",
        message: `You and ${newMatch.developerName} are now connected on ${newMatch.projectName}!`,
      });

      return { success: true, match: newMatch, ...newMatch };
    } catch (err) {
      return { success: false, error: err.message || 'Error processing acceptance' };
    }
  };

  const rejectInvitation = async (invitationId, devName = 'Developer') => {
    setInvitations((prev) => prev.filter((i) => (i.id || i.invitationId) !== invitationId));
    try {
      const uid = currentUser?._id || currentUser?.id;
      await rejectInvitationApi(invitationId, uid);
    } catch (err) {
      console.warn('Backend reject call failed:', err.message);
    }
  };

  // --- CHATS (PROJECT-SPECIFIC, KEYED BY REAL MATCH ID) ---
  const getOrCreateChatForMatch = (match) => {
    // Contract: Chat ID is the real MongoDB Match._id
    const targetChatId = (match.id || match.matchId || match._id).toString();
    const existing = chats.find((c) => c.id === targetChatId || c.matchId === targetChatId);

    if (existing) {
      setActiveChatId(targetChatId);
      return existing;
    }

    // Create new conversation keyed by Match ID
    const newChat = {
      id: targetChatId,
      matchId: targetChatId,
      projectId: (match.projectId || '').toString(),
      projectName: match.projectName || 'Project',
      developerId: (match.developerId || '').toString(),
      developerName: match.developerName || 'Collaborator',
      developerRole: match.developerRole || 'Developer',
      developerAvatar: match.developerAvatar || '',
      status: 'Online',
      lastMessage: match.recentMessage || `Discussion for ${match.projectName || 'project'}`,
      time: 'Just now',
      unreadCount: 0,
      messages: [],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(targetChatId);
    return newChat;
  };

  const loadConversationMessages = async (matchId) => {
    const currentVer = sessionVersion.current;
    if (!isAuthenticatedRef.current || isLoggingOutRef.current) {
      return { success: false, reason: 'unauthenticated' };
    }
    if (!matchId) return { success: false, error: 'No matchId provided' };
    const targetMatchId = matchId.toString();
    const uid = currentUser?._id || currentUser?.id;
    setMessagesLoading(true);
    setChatError(null);

    try {
      const res = await fetchChatMessages(targetMatchId, uid);
      if (sessionVersion.current !== currentVer || !isAuthenticatedRef.current || isLoggingOutRef.current) {
        return { success: false, reason: 'aborted' };
      }
      if (res.success && res.data) {
        const rawList = Array.isArray(res.data)
          ? res.data
          : (res.data.messages || []);
        const normalized = rawList.map((m) => normalizeMessage(m, uid)).filter(Boolean);

        setChats((prev) => {
          const exists = prev.some((c) => c.id === targetMatchId || c.matchId === targetMatchId);
          if (exists) {
            return prev.map((c) => {
              if (c.id === targetMatchId || c.matchId === targetMatchId) {
                const last = normalized[normalized.length - 1];
                return {
                  ...c,
                  messages: normalized,
                  lastMessage: last ? last.text : c.lastMessage,
                  time: last ? last.time : c.time,
                };
              }
              return c;
            });
          }
          return prev;
        });

        return { success: true, messages: normalized };
      } else {
        const errMsg = res.error || 'Failed to load conversation messages';
        setChatError(errMsg);
        return { success: false, error: errMsg };
      }
    } catch (err) {
      if (sessionVersion.current !== currentVer || !isAuthenticatedRef.current || isLoggingOutRef.current) {
        return { success: false, reason: 'aborted' };
      }
      setChatError(err.message || 'Error loading messages');
      return { success: false, error: err.message };
    } finally {
      if (sessionVersion.current === currentVer) {
        setMessagesLoading(false);
      }
    }
  };

  // --- SOCKET.IO CONNECTION & LIFECYCLE ---
  useEffect(() => {
    const uid = currentUser?._id || currentUser?.id;
    const token = currentUser?.token || null;

    if (!uid) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocketConnected(false);
      }
      return;
    }

    // Avoid duplicate connections
    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    const socketUrl = getSocketBaseUrl();
    const socket = io(socketUrl, {
      auth: { token, userId: uid },
      query: { token, userId: uid },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setSocketConnected(true);
      // Re-join active conversation room if one is open upon connect/reconnect
      if (activeChatIdRef.current) {
        socket.emit('join_conversation', { matchId: activeChatIdRef.current });
      }
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('connect_error', () => {
      setSocketConnected(false);
    });

    // Realtime Incoming Message from Socket.IO
    socket.on('new_message', (rawMsg) => {
      if (!rawMsg) return;
      const targetMatchId = (rawMsg.match?._id || rawMsg.match || '').toString();
      if (!targetMatchId) return;

      const currentUid = currentUser?._id || currentUser?.id;
      const normalized = normalizeMessage(rawMsg, currentUid);
      if (!normalized) return;

      setChats((prevChats) => {
        const exists = prevChats.some(
          (c) => c.id === targetMatchId || c.matchId === targetMatchId
        );

        if (exists) {
          return prevChats.map((chat) => {
            if (chat.id === targetMatchId || chat.matchId === targetMatchId) {
              const alreadyExists = (chat.messages || []).some(
                (m) => (m.id || '').toString() === normalized.id.toString()
              );
              if (alreadyExists) return chat;

              return {
                ...chat,
                lastMessage: normalized.text,
                time: normalized.time,
                messages: [...(chat.messages || []), normalized],
              };
            }
            return chat;
          });
        }
        return prevChats;
      });
    });

    // Realtime Incoming Notification from Socket.IO
    socket.on('new_notification', (rawNotif) => {
      if (!rawNotif) return;
      const currentUid = currentUser?._id || currentUser?.id;
      const normalized = normalizeNotification(rawNotif, currentUid);
      if (!normalized) return;

      setNotifications((prev) => {
        // Deduplication using Notification._id
        const alreadyExists = prev.some(
          (n) => (n.id || '').toString() === normalized.id.toString()
        );
        if (alreadyExists) return prev;

        return [normalized, ...prev];
      });

      setUnreadNotificationsCount((prev) => prev + 1);
    });

    // Typing indicators
    socket.on('user_typing', (data) => {
      const { matchId, userId, name } = data || {};
      const currentUid = currentUser?._id || currentUser?.id;
      if (matchId && userId && userId.toString() !== currentUid?.toString()) {
        setTypingStatusByMatch((prev) => ({
          ...prev,
          [matchId.toString()]: { isTyping: true, name: name || 'Partner' },
        }));
      }
    });

    socket.on('user_stop_typing', (data) => {
      const { matchId, userId } = data || {};
      const currentUid = currentUser?._id || currentUser?.id;
      if (matchId && userId && userId.toString() !== currentUid?.toString()) {
        setTypingStatusByMatch((prev) => ({
          ...prev,
          [matchId.toString()]: null,
        }));
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [currentUser?._id, currentUser?.id, isAuthenticated]);

  const joinMatchRoom = (matchId) => {
    if (!matchId) return;
    const targetMatchId = matchId.toString();
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('join_conversation', { matchId: targetMatchId });
    }
  };

  const leaveMatchRoom = (matchId) => {
    if (!matchId) return;
    const targetMatchId = matchId.toString();
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('leave_conversation', { matchId: targetMatchId });
    }
    setTypingStatusByMatch((prev) => ({
      ...prev,
      [targetMatchId]: null,
    }));
  };

  const sendTyping = (matchId) => {
    if (!matchId) return;
    const targetMatchId = matchId.toString();
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing', { matchId: targetMatchId });
    }
  };

  const sendStopTyping = (matchId) => {
    if (!matchId) return;
    const targetMatchId = matchId.toString();
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('stop_typing', { matchId: targetMatchId });
    }
  };

  const sendMessage = async (chatId, text) => {
    if (!text || !text.trim()) {
      return { success: false, error: 'Message cannot be empty' };
    }

    const uid = currentUser?._id || currentUser?.id;
    const targetChatId = (chatId || activeChatId || '').toString();

    if (!targetChatId) {
      return { success: false, error: 'Invalid conversation identifier' };
    }

    const trimmedText = text.trim();

    // 1. If Socket.IO is connected, send via Socket.IO
    if (socketRef.current && socketRef.current.connected) {
      try {
        const socketResult = await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            resolve({ timeout: true });
          }, 5000);

          socketRef.current.emit(
            'send_message',
            { matchId: targetChatId, message: trimmedText },
            (response) => {
              clearTimeout(timeout);
              resolve(response || { success: false, message: 'No response from server' });
            }
          );
        });

        if (socketResult && socketResult.success && socketResult.data) {
          const persistedMsg = normalizeMessage(socketResult.data, uid);

          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id === targetChatId || chat.matchId === targetChatId) {
                const alreadyExists = (chat.messages || []).some(
                  (m) => (m.id || '').toString() === persistedMsg.id.toString()
                );
                if (alreadyExists) return chat;

                return {
                  ...chat,
                  lastMessage: persistedMsg.text,
                  time: persistedMsg.time,
                  messages: [...(chat.messages || []), persistedMsg],
                };
              }
              return chat;
            })
          );

          return { success: true, message: persistedMsg };
        }

        // If socket returned an explicit error (e.g. Forbidden or Bad Request), don't duplicate to REST
        if (socketResult && socketResult.success === false && !socketResult.timeout) {
          return { success: false, error: socketResult.message || 'Failed to send message' };
        }

        // Socket timed out without server confirmation: proceed to REST fallback
      } catch (err) {
        console.warn('Socket emit exception, proceeding to REST fallback:', err.message);
      }
    }

    // 2. Fallback to REST API if Socket is disconnected or timed out
    try {
      const res = await sendChatMessage(targetChatId, trimmedText, uid);
      if (res.success && res.data) {
        const persistedMsg = normalizeMessage(res.data, uid);

        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === targetChatId || chat.matchId === targetChatId) {
              const alreadyExists = (chat.messages || []).some(
                (m) => (m.id || '').toString() === persistedMsg.id.toString()
              );
              if (alreadyExists) return chat;

              return {
                ...chat,
                lastMessage: persistedMsg.text,
                time: persistedMsg.time,
                messages: [...(chat.messages || []), persistedMsg],
              };
            }
            return chat;
          })
        );

        return { success: true, message: persistedMsg };
      } else {
        return { success: false, error: res.error || 'Failed to send message' };
      }
    } catch (err) {
      return { success: false, error: err.message || 'Network error sending message' };
    }
  };

  const markChatAsRead = (chatId) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
    );
  };

  // --- NOTIFICATIONS ---
  const markNotificationAsRead = async (notificationId) => {
    if (!notificationId) return;
    const targetId = notificationId.toString();
    const uid = currentUser?._id || currentUser?.id;
    const token = currentUser?.token || null;

    let wasUnread = false;
    setNotifications((prev) =>
      prev.map((n) => {
        if ((n.id || '').toString() === targetId) {
          if (!n.read) wasUnread = true;
          return { ...n, read: true, readAt: new Date().toISOString() };
        }
        return n;
      })
    );

    if (wasUnread) {
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    }

    try {
      if (uid) {
        await markNotificationRead(targetId, uid, token);
      }
    } catch (err) {
      console.warn('Failed to mark notification read on backend:', err.message);
    }
  };

  const markAllNotificationsRead = async () => {
    const uid = currentUser?._id || currentUser?.id;
    const token = currentUser?.token || null;

    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
    );
    setUnreadNotificationsCount(0);

    try {
      if (uid) {
        await markAllNotificationsReadApi(uid, token);
      }
    } catch (err) {
      console.warn('Failed to mark all notifications read on backend:', err.message);
    }
  };

  const addNotification = ({ type, title, message }) => {
    const newN = {
      id: `notif-${Date.now()}`,
      type: type || 'NOTIFICATION',
      title: title || 'Notification',
      message: message || '',
      time: 'Just now',
      read: false,
      readAt: null,
    };
    setNotifications((prev) => [newN, ...prev]);
    setUnreadNotificationsCount((prev) => prev + 1);
  };

  // --- PROFILE ---
  const updateProfile = async (patch) => {
    try {
      const res = await updateProfileApi(patch);
      if (res.success && res.user) {
        const effectiveAccess = getAuthToken() || accessToken;
        const updatedUser = { ...res.user, token: effectiveAccess };
        setCurrentUser(updatedUser);
        loadDiscoveryDevelopers();
        return { success: true, user: updatedUser, data: updatedUser };
      } else {
        const msg = res.error || 'Failed to update profile';
        return { success: false, error: msg };
      }
    } catch (err) {
      return { success: false, error: err.message || 'Profile update error' };
    }
  };

  const loadProfile = async () => {
    try {
      const res = await getMeApi();
      if (res.success && res.user) {
        const effectiveAccess = getAuthToken() || accessToken;
        const updatedUser = { ...res.user, token: effectiveAccess };
        setCurrentUser(updatedUser);
        return { success: true, user: updatedUser };
      }
    } catch {}
    return { success: false };
  };

  return (
    <AppContext.Provider
      value={{
        // Auth (Chunk 12C)
        isAuthenticated,
        currentUser,
        accessToken,
        refreshToken,
        authLoading,
        sessionLoading: authLoading,
        authError,
        restoreSession,
        login,
        register,
        verifyEmail,
        logout,

        // Projects
        projects,
        projectsLoading,
        projectsError,
        loadProjects,
        refreshProjects: loadProjects,
        activeProjectId,
        activeProject,
        viewedProjectId,
        viewedProject,
        setActiveProjectId,
        setViewedProjectId,
        createProject,
        updateProject,
        fetchProjectById,
        deleteProject,
        closeProject,

        // Projects & Skills Contract (Chunk 11A)
        canonicalSkills,
        canonicalSkillsLoading,
        canonicalSkillsError,
        loadCanonicalSkills,
        getCanonicalSkill,
        normalizeProject: (p) => normalizeProject(p, canonicalSkills),
        toBackendProjectPayload: (data) => toBackendProjectPayload(data, canonicalSkills),
        mapSkillsToIds: (skills) => mapSkillsToIds(skills, canonicalSkills),
        resolveSkillToId: (skill) => resolveSkillToId(skill, canonicalSkills),

        // Discovery
        discoveryDevelopers,
        discoveryLoading,
        discoveryError,
        loadDiscoveryDevelopers,
        refreshDiscovery: loadDiscoveryDevelopers,
        availableDevelopersForActiveProject,
        skipDeveloper,
        unskipDeveloper,
        uninviteDeveloper,
        inviteDeveloper,
        resetDiscoveryForProject,

        // Invitations & Matches
        invitations,
        matches,
        matchesLoading,
        matchesError,
        refreshMatchesAndInvitations,
        acceptInvitation,
        rejectInvitation,
        pendingMatchCelebration,
        setPendingMatchCelebration,

        // Chats
        chats,
        activeChatId,
        setActiveChatId,
        getOrCreateChatForMatch,
        loadConversationMessages,
        messagesLoading,
        chatError,
        sendMessage,
        markChatAsRead,
        socketConnected,
        joinMatchRoom,
        leaveMatchRoom,
        sendTyping,
        sendStopTyping,
        typingStatusByMatch,

        // Notifications & Settings
        notifications,
        unreadNotificationsCount,
        notificationsLoading,
        loadNotifications,
        refreshNotifications: loadNotifications,
        markNotificationAsRead,
        markAllNotificationsRead,
        addNotification,
        pushNotificationsEnabled,
        setPushNotificationsEnabled,
        soundEnabled,
        setSoundEnabled,

        // Profile
        updateProfile,
        loadProfile,
        refreshProfile: loadProfile,
        selectedDeveloperForProfile,
        setSelectedDeveloperForProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
