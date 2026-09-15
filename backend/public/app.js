/**
 * DevDate — Discover & Developer Invitation Module Frontend Logic
 */

const API_BASE = "/api";

// Application State
const state = {
  currentRole: "lead", // "lead" or developer ObjectId
  currentUser: null,
  leadUser: null,
  allDevelopers: [],
  leadProjects: [],
  selectedProjectForStatus: "",
  selectedDevForInvite: null,
  selectedDevForProfile: null,
  notifications: [],
  unreadNotifCount: 0,
  conversations: [],
  activeConversation: null,
  messages: [],
  socket: null,
  chatBadge: 0,
};

// DOM Element References
const elements = {
  // Navigation
  navTabs: document.querySelectorAll(".nav-tab"),
  tabPanes: document.querySelectorAll(".tab-pane"),
  activeUserSelect: document.getElementById("active-user-select"),
  notifBtn: document.getElementById("notif-btn"),
  notifBadge: document.getElementById("notif-badge"),
  notifDropdown: document.getElementById("notif-dropdown"),
  notifList: document.getElementById("notif-list"),
  markAllReadBtn: document.getElementById("mark-all-read-btn"),
  matchingBadge: document.getElementById("matching-badge"),

  // Discover Tab
  devSearchInput: document.getElementById("dev-search-input"),
  clearSearchBtn: document.getElementById("clear-search-btn"),
  filterSkill: document.getElementById("filter-skill"),
  filterRole: document.getElementById("filter-role"),
  filterAvail: document.getElementById("filter-avail"),
  leadProjectFilter: document.getElementById("lead-project-filter"),
  resetFiltersBtn: document.getElementById("reset-filters-btn"),
  developersGrid: document.getElementById("developers-grid"),
  totalDevsCount: document.getElementById("total-devs-count"),

  // Projects Tab
  projectsGrid: document.getElementById("projects-grid"),
  projectInvsView: document.getElementById("project-invitations-view"),
  selectedProjTitle: document.getElementById("selected-project-title"),
  selectedProjSubtitle: document.getElementById("selected-project-subtitle"),
  closeProjectInvsBtn: document.getElementById("close-project-invs-btn"),
  projectInvsTbody: document.getElementById("project-invitations-tbody"),

  // Matching Tab
  matchingList: document.getElementById("matching-invitations-list"),
  matchingUserName: document.getElementById("matching-user-name"),
  matchingRoleHint: document.getElementById("matching-role-hint"),

  // History Tab
  historyContextLabel: document.getElementById("history-context-label"),
  historyStatusFilter: document.getElementById("history-status-filter"),
  historyList: document.getElementById("history-list"),

  // Invite Modal
  inviteModal: document.getElementById("invite-modal"),
  closeInviteModalBtn: document.getElementById("close-invite-modal-btn"),
  cancelInviteBtn: document.getElementById("cancel-invite-btn"),
  confirmSendInviteBtn: document.getElementById("confirm-send-invite-btn"),
  modalDevAvatar: document.getElementById("modal-dev-avatar"),
  modalDevName: document.getElementById("modal-dev-name"),
  modalDevRole: document.getElementById("modal-dev-role"),
  modalDevAvail: document.getElementById("modal-dev-avail"),
  modalProjectSelect: document.getElementById("modal-project-select"),
  modalInviteMessage: document.getElementById("modal-invite-message"),
  charCounter: document.getElementById("char-counter"),
  modalErrorAlert: document.getElementById("modal-error-alert"),

  // Profile Modal
  profileModal: document.getElementById("profile-modal"),
  closeProfileModalBtn: document.getElementById("close-profile-modal-btn"),
  closeProfileBtn: document.getElementById("close-profile-btn"),
  profileInviteBtn: document.getElementById("profile-invite-btn"),
  modalProfileBody: document.getElementById("modal-profile-body"),

  // Toast Container
  toastContainer: document.getElementById("toast-container"),

  // Chat Tab
  tabBtnChat: document.getElementById("tab-btn-chat"),
  chatBadge: document.getElementById("chat-badge"),
  socketConnectionBadge: document.getElementById("socket-connection-badge"),
  conversationList: document.getElementById("conversation-list"),
  conversationsCount: document.getElementById("conversations-count"),
  chatEmptyState: document.getElementById("chat-empty-state"),
  chatActiveView: document.getElementById("chat-active-view"),
  chatPartnerAvatar: document.getElementById("chat-partner-avatar"),
  chatPartnerName: document.getElementById("chat-partner-name"),
  chatPartnerRole: document.getElementById("chat-partner-role"),
  chatProjectTag: document.getElementById("chat-project-tag"),
  messagesContainer: document.getElementById("messages-container"),
  typingIndicator: document.getElementById("typing-indicator"),
  typingText: document.getElementById("typing-text"),
  chatInputForm: document.getElementById("chat-input-form"),
  chatMessageInput: document.getElementById("chat-message-input"),
  chatSendBtn: document.getElementById("chat-send-btn"),
};

// ==========================================================================
// TOAST NOTIFICATION HELPER
// ==========================================================================
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "⚠️";
  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(12px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ==========================================================================
// API CLIENT WRAPPER (Sends x-user-id header based on active role)
// ==========================================================================
async function apiRequest(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  // Attach active role ID
  const activeUserId = state.currentRole === "lead" 
    ? (state.leadUser?._id || "") 
    : state.currentRole;

  if (activeUserId) {
    headers["x-user-id"] = activeUserId;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.message || (data.errors && data.errors[0]?.message) || "API Request Failed";
    throw new Error(errorMsg);
  }

  return data;
}

// ==========================================================================
// INITIALIZATION
// ==========================================================================
async function initApp() {
  setupEventListeners();
  await loadInitialData();
  initSocketClient();
  await refreshCurrentTab();
  await refreshNotifications();
}

async function loadInitialData() {
  try {
    // 1. Load developers from Discovery API
    const devsRes = await apiRequest("/discovery/developers?limit=100");
    state.allDevelopers = devsRes.data || [];
    elements.totalDevsCount.textContent = state.allDevelopers.length;

    // 2. Locate or identify the lead user and sample projects
    // For our app, Alex Chen (Project Lead) is the lead
    const leadMatch = state.allDevelopers.find((d) => d.email === "lead.alex@devdate.test");
    if (leadMatch) {
      state.leadUser = leadMatch;
    } else {
      // Create fallback lead object if needed
      state.leadUser = {
        _id: "6aa52047123e2b20408cd0ac",
        name: "Alex Chen (Project Lead)",
        email: "lead.alex@devdate.test",
        role: "Project Lead",
      };
    }

    state.currentUser = state.leadUser;

    // 3. Populate Active Role Selector
    populateRoleSelector();

    // 4. Load Lead's projects
    await loadLeadProjects();
  } catch (err) {
    console.error("Initialization error:", err);
    showToast(`Error initializing app: ${err.message}`, "error");
  }
}

function populateRoleSelector() {
  elements.activeUserSelect.innerHTML = "";

  // Lead Option
  const leadOpt = document.createElement("option");
  leadOpt.value = "lead";
  leadOpt.textContent = `👑 Lead: ${state.leadUser?.name || "Alex Chen"}`;
  elements.activeUserSelect.appendChild(leadOpt);

  // Developer Options
  state.allDevelopers.forEach((dev) => {
    if (state.leadUser && dev._id === state.leadUser._id) return;
    const opt = document.createElement("option");
    opt.value = dev._id;
    opt.textContent = `💻 Dev: ${dev.name} (${dev.preferredRole || dev.role || "Developer"})`;
    elements.activeUserSelect.appendChild(opt);
  });
}

async function loadLeadProjects() {
  try {
    // Lead's projects are loaded from projects API
    const res = await fetch(`${API_BASE}/projects?limit=50`);
    if (res.ok) {
      const data = await res.json();
      state.leadProjects = data.data || [];
    } else {
      // Fallback: search for projects created by lead
      state.leadProjects = [];
    }

    // Populate Project Selectors in filter and modal
    populateProjectDropdowns();
  } catch (err) {
    console.warn("Could not fetch projects list:", err);
  }
}

function populateProjectDropdowns() {
  // 1. Filter bar project selector
  elements.leadProjectFilter.innerHTML = `<option value="">(Select Project for Live Status)</option>`;
  elements.modalProjectSelect.innerHTML = "";

  state.leadProjects.forEach((proj) => {
    const opt1 = document.createElement("option");
    opt1.value = proj._id;
    opt1.textContent = proj.title;
    elements.leadProjectFilter.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = proj._id;
    opt2.textContent = proj.title;
    elements.modalProjectSelect.appendChild(opt2);
  });
}

// ==========================================================================
// EVENT LISTENERS
// ==========================================================================
function setupEventListeners() {
  // Tab Switching
  elements.navTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      elements.navTabs.forEach((t) => t.classList.remove("active"));
      elements.tabPanes.forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      const targetId = `tab-${tab.dataset.tab}`;
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");

      refreshCurrentTab();
    });
  });

  // Role Switching
  elements.activeUserSelect.addEventListener("change", async (e) => {
    state.currentRole = e.target.value;
    if (state.currentRole === "lead") {
      state.currentUser = state.leadUser;
      showToast("Switched to Project Lead (Alex Chen)", "success");
    } else {
      const dev = state.allDevelopers.find((d) => d._id === state.currentRole);
      state.currentUser = dev || { _id: state.currentRole, name: "Developer" };
      showToast(`Switched to Developer (${state.currentUser.name})`, "success");
    }

    // Update Matching tab title
    if (elements.matchingUserName) {
      elements.matchingUserName.textContent = state.currentUser.name;
    }

    // Reconnect socket with new user context
    initSocketClient();

    await refreshCurrentTab();
    await refreshNotifications();
  });

  // Discover Search & Filters
  let searchDebounceTimer;
  elements.devSearchInput.addEventListener("input", (e) => {
    elements.clearSearchBtn.classList.toggle("show", !!e.target.value);
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(loadDiscover, 300);
  });

  elements.clearSearchBtn.addEventListener("click", () => {
    elements.devSearchInput.value = "";
    elements.clearSearchBtn.classList.remove("show");
    loadDiscover();
  });

  elements.filterSkill.addEventListener("change", loadDiscover);
  elements.filterRole.addEventListener("change", loadDiscover);
  elements.filterAvail.addEventListener("change", loadDiscover);

  elements.leadProjectFilter.addEventListener("change", (e) => {
    state.selectedProjectForStatus = e.target.value;
    loadDiscover();
  });

  elements.resetFiltersBtn.addEventListener("click", () => {
    elements.devSearchInput.value = "";
    elements.clearSearchBtn.classList.remove("show");
    elements.filterSkill.value = "";
    elements.filterRole.value = "";
    elements.filterAvail.value = "";
    elements.leadProjectFilter.value = "";
    state.selectedProjectForStatus = "";
    loadDiscover();
  });

  // Notifications Popover
  elements.notifBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    elements.notifDropdown.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!elements.notifDropdown.contains(e.target) && e.target !== elements.notifBtn) {
      elements.notifDropdown.classList.remove("show");
    }
  });

  elements.markAllReadBtn.addEventListener("click", async () => {
    try {
      await apiRequest("/notifications/read-all", { method: "PATCH" });
      showToast("All notifications marked as read", "success");
      await refreshNotifications();
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // Modal: Invite
  elements.closeInviteModalBtn.addEventListener("click", closeInviteModal);
  elements.cancelInviteBtn.addEventListener("click", closeInviteModal);
  elements.modalInviteMessage.addEventListener("input", (e) => {
    elements.charCounter.textContent = e.target.value.length;
  });
  elements.confirmSendInviteBtn.addEventListener("click", handleSendInvitation);

  // Modal: Profile
  elements.closeProfileModalBtn.addEventListener("click", closeProfileModal);
  elements.closeProfileBtn.addEventListener("click", closeProfileModal);
  elements.profileInviteBtn.addEventListener("click", () => {
    closeProfileModal();
    if (state.selectedDevForProfile) {
      openInviteModal(state.selectedDevForProfile);
    }
  });

  // Close Project Invitations Detail Section
  elements.closeProjectInvsBtn.addEventListener("click", () => {
    elements.projectInvsView.style.display = "none";
  });

  // History Filter
  elements.historyStatusFilter.addEventListener("change", loadHistory);

  // Chat Input & Typing
  if (elements.chatInputForm) {
    elements.chatInputForm.addEventListener("submit", handleSendChatMessage);
  }

  if (elements.chatMessageInput) {
    let typingDebounce;
    elements.chatMessageInput.addEventListener("input", () => {
      if (state.socket && state.activeConversation) {
        state.socket.emit("typing", { matchId: state.activeConversation.matchId });
        clearTimeout(typingDebounce);
        typingDebounce = setTimeout(() => {
          if (state.socket && state.activeConversation) {
            state.socket.emit("stop_typing", { matchId: state.activeConversation.matchId });
          }
        }, 1500);
      }
    });
  }
}

// ==========================================================================
// REFRESH CURRENT TAB
// ==========================================================================
async function refreshCurrentTab() {
  const activeTabBtn = document.querySelector(".nav-tab.active");
  const tabName = activeTabBtn ? activeTabBtn.dataset.tab : "discover";

  if (tabName === "discover") {
    await loadDiscover();
  } else if (tabName === "projects") {
    await loadProjects();
  } else if (tabName === "matching") {
    await loadMatching();
  } else if (tabName === "chat") {
    await loadConversations();
  } else if (tabName === "history") {
    await loadHistory();
  }
}

// ==========================================================================
// 1. DISCOVER TAB LOGIC
// ==========================================================================
async function loadDiscover() {
  elements.developersGrid.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Filtering developers...</p>
    </div>
  `;

  try {
    const params = new URLSearchParams();
    const searchVal = elements.devSearchInput.value.trim();
    const skillVal = elements.filterSkill.value;
    const roleVal = elements.filterRole.value;
    const availVal = elements.filterAvail.value;
    const projVal = elements.leadProjectFilter.value;

    if (searchVal) params.append("search", searchVal);
    if (skillVal) params.append("skills", skillVal);
    if (roleVal) params.append("role", roleVal);
    if (availVal) params.append("availability", availVal);
    if (projVal) params.append("projectId", projVal);

    params.append("limit", "100");

    const res = await apiRequest(`/discovery/developers?${params.toString()}`);
    const devs = res.data || [];

    renderDevelopersGrid(devs);
  } catch (err) {
    elements.developersGrid.innerHTML = `
      <div class="empty-state">
        <p>⚠️ Failed to load developers: ${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

function renderDevelopersGrid(devs) {
  elements.developersGrid.innerHTML = "";
  elements.totalDevsCount.textContent = devs.length;

  if (devs.length === 0) {
    elements.developersGrid.innerHTML = `
      <div class="empty-state">
        <p>🔍 No developers match your search or filter criteria.</p>
        <button class="btn-secondary btn-sm" onclick="document.getElementById('reset-filters-btn').click()">Reset Filters</button>
      </div>
    `;
    return;
  }

  devs.forEach((dev) => {
    // Exclude current lead from discover cards if viewing as lead
    if (state.leadUser && dev._id === state.leadUser._id) return;

    const card = document.createElement("div");
    card.className = "dev-card glassmorphism";
    card.id = `dev-card-${dev._id}`;

    const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
    const avatarUrl = dev.avatar || defaultAvatar;

    const skillsHtml = (dev.skills || [])
      .slice(0, 4)
      .map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`)
      .join("");

    const status = dev.invitationStatus || "None";
    let inviteBtnHtml = "";

    if (status === "Pending") {
      inviteBtnHtml = `<span class="status-badge pending">⏳ Pending</span>`;
    } else if (status === "Accepted") {
      inviteBtnHtml = `<span class="status-badge accepted">✅ Accepted</span>`;
    } else if (status === "Rejected") {
      inviteBtnHtml = `<span class="status-badge rejected">❌ Rejected</span>`;
    } else {
      inviteBtnHtml = `
        <button class="btn-primary btn-sm invite-dev-btn" data-id="${dev._id}">
          <span class="btn-icon">✉️</span> Invite
        </button>
      `;
    }

    card.innerHTML = `
      <div>
        <div class="dev-header">
          <img src="${avatarUrl}" alt="${escapeHtml(dev.name)}" class="dev-avatar" onerror="this.src='${defaultAvatar}'">
          <div class="dev-main-info">
            <h3 class="dev-name">${escapeHtml(dev.name)}</h3>
            <p class="dev-role">${escapeHtml(dev.preferredRole || dev.role || "Developer")}</p>
          </div>
        </div>

        <div class="dev-meta-pills">
          <span class="pill pill-exp">💼 ${escapeHtml(dev.experience || "Experienced")}</span>
          <span class="pill pill-avail">⏱️ ${escapeHtml(dev.availability || "Available")}</span>
        </div>

        <p class="dev-intro">${escapeHtml(dev.introduction || dev.bio || "No introduction provided yet.")}</p>

        <div class="dev-skills">
          ${skillsHtml}
        </div>
      </div>

      <div class="dev-card-footer">
        <button class="btn-secondary btn-sm view-profile-btn" data-id="${dev._id}">View Profile</button>
        ${inviteBtnHtml}
      </div>
    `;

    // Attach button listeners
    const viewBtn = card.querySelector(".view-profile-btn");
    if (viewBtn) {
      viewBtn.addEventListener("click", () => openProfileModal(dev));
    }

    const inviteBtn = card.querySelector(".invite-dev-btn");
    if (inviteBtn) {
      inviteBtn.addEventListener("click", () => openInviteModal(dev));
    }

    elements.developersGrid.appendChild(card);
  });
}

// ==========================================================================
// 2. LEAD'S PROJECT HUB LOGIC
// ==========================================================================
async function loadProjects() {
  elements.projectsGrid.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading project stats & invitations...</p>
    </div>
  `;

  try {
    await loadLeadProjects();

    if (state.leadProjects.length === 0) {
      elements.projectsGrid.innerHTML = `
        <div class="empty-state">
          <p>No projects found. Seed or create projects to start inviting developers.</p>
        </div>
      `;
      return;
    }

    elements.projectsGrid.innerHTML = "";

    for (const proj of state.leadProjects) {
      // Fetch stats for each project
      let stats = { total: 0, pending: 0, accepted: 0, rejected: 0 };
      try {
        const statsRes = await apiRequest(`/invitations/project/${proj._id}/stats`);
        stats = statsRes.data || stats;
      } catch (e) {
        console.warn(`Stats fetch failed for project ${proj._id}:`, e);
      }

      const card = document.createElement("div");
      card.className = "project-card glassmorphism";
      card.id = `project-card-${proj._id}`;

      card.innerHTML = `
        <div>
          <div class="project-header">
            <span class="project-category">${escapeHtml(proj.category || "General")}</span>
            <h3 class="project-title">${escapeHtml(proj.title)}</h3>
            <p class="project-desc">${escapeHtml(proj.description || "")}</p>
          </div>

          <div class="project-stats-box">
            <div class="stats-title">Collaboration Invitations</div>
            <div class="stats-grid">
              <div>
                <div class="stat-item-num total">${stats.total}</div>
                <div class="stat-item-label">Total Sent</div>
              </div>
              <div>
                <div class="stat-item-num pending">${stats.pending}</div>
                <div class="stat-item-label">Pending</div>
              </div>
              <div>
                <div class="stat-item-num accepted">${stats.accepted}</div>
                <div class="stat-item-label">Accepted</div>
              </div>
              <div>
                <div class="stat-item-num rejected">${stats.rejected}</div>
                <div class="stat-item-label">Rejected</div>
              </div>
            </div>
          </div>
        </div>

        <button class="btn-primary btn-sm view-proj-invs-btn" data-id="${proj._id}" data-title="${escapeHtml(proj.title)}">
          📋 Manage Invitations (${stats.total})
        </button>
      `;

      const manageBtn = card.querySelector(".view-proj-invs-btn");
      manageBtn.addEventListener("click", () => {
        openProjectInvitations(proj._id, proj.title);
      });

      elements.projectsGrid.appendChild(card);
    }
  } catch (err) {
    elements.projectsGrid.innerHTML = `
      <div class="empty-state">
        <p>⚠️ Error loading projects: ${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

async function openProjectInvitations(projectId, projectTitle) {
  elements.selectedProjTitle.textContent = `Invitations: ${projectTitle}`;
  elements.selectedProjSubtitle.textContent = `Review and withdraw developer collaboration invitations for "${projectTitle}"`;
  elements.projectInvsView.style.display = "block";
  elements.projectInvsView.scrollIntoView({ behavior: "smooth" });

  elements.projectInvsTbody.innerHTML = `
    <tr>
      <td colspan="6" style="text-align: center; padding: 2rem;">
        <div class="spinner"></div> Loading invitations...
      </td>
    </tr>
  `;

  try {
    const res = await apiRequest(`/invitations/project/${projectId}`);
    const invitations = res.data || [];

    if (invitations.length === 0) {
      elements.projectInvsTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
            No invitations sent for this project yet. Use the <strong>Discover</strong> tab to find and invite developers!
          </td>
        </tr>
      `;
      return;
    }

    elements.projectInvsTbody.innerHTML = "";

    invitations.forEach((inv) => {
      const dev = inv.developerId || {};
      const dateStr = new Date(inv.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const statusClass = inv.status.toLowerCase();
      let actionHtml = "—";

      if (inv.status === "Pending") {
        actionHtml = `
          <button class="btn-danger btn-sm withdraw-invite-btn" data-id="${inv._id}">
            Withdraw
          </button>
        `;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          <div style="font-weight: 600; color: #fff;">${escapeHtml(dev.name || "Developer")}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(dev.email || "")}</div>
        </td>
        <td><span class="pill pill-exp">${escapeHtml(dev.preferredRole || dev.role || "Developer")}</span></td>
        <td>${dateStr}</td>
        <td style="max-width: 250px; font-size: 0.85rem; color: var(--text-secondary);">${escapeHtml(inv.message || "—")}</td>
        <td><span class="status-badge ${statusClass}">${inv.status}</span></td>
        <td>${actionHtml}</td>
      `;

      const withdrawBtn = tr.querySelector(".withdraw-invite-btn");
      if (withdrawBtn) {
        withdrawBtn.addEventListener("click", async () => {
          if (confirm(`Withdraw invitation sent to ${dev.name}?`)) {
            try {
              await apiRequest(`/invitations/${inv._id}/withdraw`, { method: "PATCH" });
              showToast(`Invitation to ${dev.name} withdrawn`, "success");
              await openProjectInvitations(projectId, projectTitle);
              await loadProjects(); // refresh stats
            } catch (err) {
              showToast(err.message, "error");
            }
          }
        });
      }

      elements.projectInvsTbody.appendChild(tr);
    });
  } catch (err) {
    elements.projectInvsTbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: #ef4444; padding: 2rem;">
          ⚠️ Error loading invitations: ${escapeHtml(err.message)}
        </td>
      </tr>
    `;
  }
}

// ==========================================================================
// 3. DEVELOPER MATCHING TAB (RECEIVED INVITATIONS)
// ==========================================================================
async function loadMatching() {
  elements.matchingList.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading received invitations...</p>
    </div>
  `;

  // Check if viewing as developer
  if (state.currentRole === "lead") {
    elements.matchingList.innerHTML = `
      <div class="empty-state">
        <p>👑 You are currently in <strong>Project Lead</strong> mode.</p>
        <p style="margin-top: 0.5rem; font-size: 0.88rem; color: var(--text-muted);">
          Switch the <strong>Active Role</strong> in the top-right navbar to a developer (e.g., Sarah Connor, Elena Rostova) to test accepting/rejecting invitations!
        </p>
      </div>
    `;
    return;
  }

  try {
    const res = await apiRequest(`/invitations/received?developerId=${state.currentRole}`);
    const invitations = res.data || [];

    // Update matching badge
    const pendingCount = invitations.filter((i) => i.status === "Pending").length;
    elements.matchingBadge.textContent = pendingCount;
    elements.matchingBadge.style.display = pendingCount > 0 ? "inline-block" : "none";

    renderMatchingList(invitations);
  } catch (err) {
    elements.matchingList.innerHTML = `
      <div class="empty-state">
        <p>⚠️ Error loading received invitations: ${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

function renderMatchingList(invitations) {
  elements.matchingList.innerHTML = "";

  if (invitations.length === 0) {
    elements.matchingList.innerHTML = `
      <div class="empty-state">
        <p>📭 No project invitations received yet.</p>
        <p style="margin-top: 0.5rem; font-size: 0.88rem; color: var(--text-muted);">
          Switch to <strong>Project Lead</strong> role and send an invitation from the <strong>Discover</strong> tab to see it appear here.
        </p>
      </div>
    `;
    return;
  }

  invitations.forEach((inv) => {
    const proj = inv.projectId || {};
    const lead = inv.senderId || (proj.owner || {});
    const statusClass = inv.status.toLowerCase();

    const card = document.createElement("div");
    card.className = "matching-card glassmorphism";
    card.id = `matching-card-${inv._id}`;

    let actionsHtml = "";
    if (inv.status === "Pending") {
      actionsHtml = `
        <div class="matching-actions">
          <button class="btn-success btn-sm accept-inv-btn" data-id="${inv._id}">
            ✅ Accept
          </button>
          <button class="btn-danger btn-sm reject-inv-btn" data-id="${inv._id}">
            ❌ Reject
          </button>
        </div>
      `;
    } else {
      actionsHtml = `<span class="status-badge ${statusClass}">${inv.status}</span>`;
    }

    card.innerHTML = `
      <div class="matching-project-info">
        <span class="project-category">${escapeHtml(proj.category || "Web Project")}</span>
        <h3 class="matching-project-title">${escapeHtml(proj.title || "Project")}</h3>
        
        <div class="matching-lead-info">
          <img src="${lead.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" class="matching-lead-avatar" alt="Lead">
          <span>Invited by <strong>${escapeHtml(lead.name || "Alex Chen")}</strong></span>
        </div>

        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
          ${escapeHtml(proj.description || "")}
        </p>

        ${inv.message ? `<div class="matching-msg-box"><strong>Message:</strong> "${escapeHtml(inv.message)}"</div>` : ""}
      </div>

      <div class="matching-action-container">
        ${actionsHtml}
      </div>
    `;

    // Action button listeners
    const acceptBtn = card.querySelector(".accept-inv-btn");
    if (acceptBtn) {
      acceptBtn.addEventListener("click", async () => {
        try {
          await apiRequest(`/invitations/${inv._id}/accept`, { method: "PATCH" });
          showToast(`Accepted invitation for "${proj.title}"! You are now a project member.`, "success");
          await loadMatching();
          await refreshNotifications();
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    }

    const rejectBtn = card.querySelector(".reject-inv-btn");
    if (rejectBtn) {
      rejectBtn.addEventListener("click", async () => {
        try {
          await apiRequest(`/invitations/${inv._id}/reject`, { method: "PATCH" });
          showToast(`Declined invitation for "${proj.title}"`, "warning");
          await loadMatching();
          await refreshNotifications();
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    }

    elements.matchingList.appendChild(card);
  });
}

// ==========================================================================
// 4. PROFILE INVITATION HISTORY LOGIC
// ==========================================================================
async function loadHistory() {
  elements.historyList.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading history records...</p>
    </div>
  `;

  const isLead = state.currentRole === "lead";
  elements.historyContextLabel.textContent = isLead 
    ? "Invitations Sent (Lead View)" 
    : `Invitations Received (${state.currentUser?.name || "Developer"})`;

  try {
    const statusFilter = elements.historyStatusFilter.value;
    const endpoint = isLead 
      ? `/invitations/sent?senderId=${state.leadUser?._id || ""}${statusFilter ? `&status=${statusFilter}` : ""}`
      : `/invitations/received?developerId=${state.currentRole}${statusFilter ? `&status=${statusFilter}` : ""}`;

    const res = await apiRequest(endpoint);
    const records = res.data || [];

    renderHistoryList(records, isLead);
  } catch (err) {
    elements.historyList.innerHTML = `
      <div class="empty-state">
        <p>⚠️ Error loading history: ${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

function renderHistoryList(records, isLead) {
  elements.historyList.innerHTML = "";

  if (records.length === 0) {
    elements.historyList.innerHTML = `
      <div class="empty-state">
        <p>No invitation history found for the current filter.</p>
      </div>
    `;
    return;
  }

  records.forEach((inv) => {
    const proj = inv.projectId || {};
    const dev = inv.developerId || {};
    const lead = inv.senderId || {};
    const statusClass = inv.status.toLowerCase();
    const dateStr = new Date(inv.createdAt).toLocaleString();

    const item = document.createElement("div");
    item.className = "history-item";

    const titleText = isLead
      ? `Invited <strong>${escapeHtml(dev.name || "Developer")}</strong> to <strong>${escapeHtml(proj.title || "Project")}</strong>`
      : `Received invitation from <strong>${escapeHtml(lead.name || "Lead")}</strong> for <strong>${escapeHtml(proj.title || "Project")}</strong>`;

    item.innerHTML = `
      <div>
        <div class="history-main-text">${titleText}</div>
        <div class="history-date">📅 ${dateStr} ${inv.message ? `• "${escapeHtml(inv.message)}"` : ""}</div>
      </div>
      <div>
        <span class="status-badge ${statusClass}">${inv.status}</span>
      </div>
    `;

    elements.historyList.appendChild(item);
  });
}

// ==========================================================================
// 5. INVITATION MODAL LOGIC
// ==========================================================================
function openInviteModal(dev) {
  state.selectedDevForInvite = dev;

  elements.modalDevAvatar.src = dev.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
  elements.modalDevName.textContent = dev.name;
  elements.modalDevRole.textContent = dev.preferredRole || dev.role || "Developer";
  elements.modalDevAvail.textContent = dev.availability || "Available";

  elements.modalInviteMessage.value = "";
  elements.charCounter.textContent = "0";
  elements.modalErrorAlert.style.display = "none";
  elements.modalErrorAlert.textContent = "";

  // Pre-select the currently filtered project if available
  if (state.selectedProjectForStatus) {
    elements.modalProjectSelect.value = state.selectedProjectForStatus;
  }

  elements.inviteModal.style.display = "flex";
}

function closeInviteModal() {
  elements.inviteModal.style.display = "none";
  state.selectedDevForInvite = null;
}

async function handleSendInvitation() {
  if (!state.selectedDevForInvite) return;

  const projectId = elements.modalProjectSelect.value;
  if (!projectId) {
    elements.modalErrorAlert.textContent = "Please select a project to invite the developer to.";
    elements.modalErrorAlert.style.display = "block";
    return;
  }

  const message = elements.modalInviteMessage.value.trim();

  elements.confirmSendInviteBtn.disabled = true;
  elements.confirmSendInviteBtn.innerHTML = `<span class="spinner" style="width: 14px; height: 14px; margin: 0;"></span> Sending...`;

  try {
    const payload = {
      projectId,
      developerId: state.selectedDevForInvite._id,
      message,
    };

    await apiRequest("/invitations", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    showToast(`Invitation sent to ${state.selectedDevForInvite.name}!`, "success");
    closeInviteModal();

    // Refresh Discover to update developer card to "Pending"
    await loadDiscover();
    await refreshNotifications();
  } catch (err) {
    elements.modalErrorAlert.textContent = err.message;
    elements.modalErrorAlert.style.display = "block";
    showToast(err.message, "error");
  } finally {
    elements.confirmSendInviteBtn.disabled = false;
    elements.confirmSendInviteBtn.innerHTML = `<span class="btn-icon">🚀</span> Send Invitation`;
  }
}

// ==========================================================================
// 6. DEVELOPER PROFILE MODAL LOGIC
// ==========================================================================
function openProfileModal(dev) {
  state.selectedDevForProfile = dev;

  const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
  const avatarUrl = dev.avatar || defaultAvatar;

  const skillsHtml = (dev.skills || [])
    .map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`)
    .join(" ");

  elements.modalProfileBody.innerHTML = `
    <div style="display: flex; gap: 1.25rem; align-items: center; margin-bottom: 1.5rem;">
      <img src="${avatarUrl}" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-primary);" alt="${escapeHtml(dev.name)}">
      <div>
        <h3 style="font-size: 1.4rem; font-weight: 700;">${escapeHtml(dev.name)}</h3>
        <p style="color: #a5b4fc; font-weight: 600;">${escapeHtml(dev.preferredRole || dev.role || "Developer")}</p>
        <p style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(dev.email)}</p>
      </div>
    </div>

    <div style="display: flex; gap: 0.5rem; margin-bottom: 1.25rem; flex-wrap: wrap;">
      <span class="pill pill-exp">💼 Experience: ${escapeHtml(dev.experience || "Not specified")}</span>
      <span class="pill pill-avail">⏱️ Availability: ${escapeHtml(dev.availability || "Not specified")}</span>
    </div>

    <div style="margin-bottom: 1.25rem;">
      <h4 style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">About / Introduction</h4>
      <p style="font-size: 0.92rem; line-height: 1.5; color: var(--text-secondary); background: rgba(0,0,0,0.2); padding: 0.75rem; border-radius: var(--radius-sm);">
        ${escapeHtml(dev.introduction || dev.bio || "No introduction provided.")}
      </p>
    </div>

    <div style="margin-bottom: 1.25rem;">
      <h4 style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">Technical Skills</h4>
      <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
        ${skillsHtml}
      </div>
    </div>

    <div>
      <h4 style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.4rem;">Links & Portfolios</h4>
      <div style="display: flex; gap: 1rem; font-size: 0.85rem;">
        ${dev.github ? `<a href="${dev.github}" target="_blank" style="color: #818cf8; text-decoration: none;">GitHub ↗</a>` : ""}
        ${dev.linkedin ? `<a href="${dev.linkedin}" target="_blank" style="color: #818cf8; text-decoration: none;">LinkedIn ↗</a>` : ""}
        ${dev.portfolio ? `<a href="${dev.portfolio}" target="_blank" style="color: #818cf8; text-decoration: none;">Portfolio ↗</a>` : ""}
      </div>
    </div>
  `;

  elements.profileModal.style.display = "flex";
}

function closeProfileModal() {
  elements.profileModal.style.display = "none";
  state.selectedDevForProfile = null;
}

// ==========================================================================
// 7. NOTIFICATIONS SYSTEM
// ==========================================================================
async function refreshNotifications() {
  try {
    const activeUserId = state.currentRole === "lead" 
      ? (state.leadUser?._id || "") 
      : state.currentRole;

    if (!activeUserId) return;

    // Fetch unread count
    const countRes = await apiRequest("/notifications/unread-count");
    const unread = countRes.data?.unreadCount || 0;
    state.unreadNotifCount = unread;

    if (unread > 0) {
      elements.notifBadge.textContent = unread;
      elements.notifBadge.style.display = "block";
    } else {
      elements.notifBadge.style.display = "none";
    }

    // Fetch full notification list
    const notifsRes = await apiRequest("/notifications?limit=20");
    state.notifications = notifsRes.data || [];

    renderNotifications(state.notifications);
  } catch (err) {
    console.warn("Notifications refresh error:", err);
  }
}

function renderNotifications(notifs) {
  elements.notifList.innerHTML = "";

  if (notifs.length === 0) {
    elements.notifList.innerHTML = `<div class="empty-notif">No notifications</div>`;
    return;
  }

  notifs.forEach((notif) => {
    const isUnread = !notif.readAt;
    const timeAgo = formatTimeAgo(new Date(notif.createdAt));

    const item = document.createElement("div");
    item.className = `notif-item ${isUnread ? "unread" : ""}`;
    item.innerHTML = `
      <div class="notif-msg">${escapeHtml(notif.message)}</div>
      <div class="notif-time">${timeAgo}</div>
    `;

    item.addEventListener("click", async () => {
      if (isUnread) {
        try {
          await apiRequest(`/notifications/${notif._id}/read`, { method: "PATCH" });
          item.classList.remove("unread");
          await refreshNotifications();
        } catch (e) {
          console.warn("Error marking notification as read:", e);
        }
      }
    });

    elements.notifList.appendChild(item);
  });
}

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

// ==========================================================================
// 5. CHAT TAB & SOCKET.IO REAL-TIME LOGIC
// ==========================================================================

function initSocketClient() {
  if (typeof io === "undefined") {
    console.warn("Socket.IO client library not loaded.");
    return;
  }

  const activeUserId = state.currentRole === "lead"
    ? (state.leadUser?._id || "")
    : state.currentRole;

  if (!activeUserId) return;

  if (state.socket) {
    state.socket.disconnect();
    state.socket = null;
  }

  state.socket = io({
    auth: { userId: activeUserId },
    query: { userId: activeUserId },
    transports: ["websocket", "polling"],
  });

  state.socket.on("connect", () => {
    if (elements.socketConnectionBadge) {
      elements.socketConnectionBadge.textContent = "⚡ Real-time Connected";
      elements.socketConnectionBadge.className = "stat-chip status-connected";
    }

    // If there is an active conversation, re-join its room
    if (state.activeConversation) {
      state.socket.emit("join_conversation", { matchId: state.activeConversation.matchId });
    }
  });

  state.socket.on("disconnect", () => {
    if (elements.socketConnectionBadge) {
      elements.socketConnectionBadge.textContent = "🔌 Reconnecting...";
      elements.socketConnectionBadge.className = "stat-chip";
    }
  });

  state.socket.on("new_message", (message) => {
    handleIncomingSocketMessage(message);
  });

  state.socket.on("user_typing", (data) => {
    if (state.activeConversation && data.matchId === state.activeConversation.matchId) {
      if (elements.typingIndicator && elements.typingText) {
        elements.typingText.textContent = `${data.name || "Partner"} is typing...`;
        elements.typingIndicator.style.display = "flex";
      }
    }
  });

  state.socket.on("user_stop_typing", (data) => {
    if (state.activeConversation && data.matchId === state.activeConversation.matchId) {
      if (elements.typingIndicator) {
        elements.typingIndicator.style.display = "none";
      }
    }
  });
}

function handleIncomingSocketMessage(message) {
  const currentUserId = state.currentRole === "lead"
    ? (state.leadUser?._id || "")
    : state.currentRole;

  // 1. If currently viewing this conversation, append message to chat view
  if (state.activeConversation && state.activeConversation.matchId === message.match.toString()) {
    appendMessageToContainer(message, currentUserId);
    scrollToLatestMessage();
  } else {
    // Increment unread chat badge
    state.chatBadge = (state.chatBadge || 0) + 1;
    if (elements.chatBadge) {
      elements.chatBadge.textContent = state.chatBadge;
      elements.chatBadge.style.display = "inline-block";
    }

    const senderName = message.sender?.name || "Collaborator";
    showToast(`New message from ${senderName}: "${message.message.substring(0, 30)}..."`, "success");
  }

  // 2. Update conversation preview in sidebar
  const conv = state.conversations.find((c) => c.matchId === message.match.toString());
  if (conv) {
    conv.lastMessage = {
      message: message.message,
      createdAt: message.createdAt,
      sender: message.sender,
    };
    conv.updatedAt = message.createdAt;
    renderConversationsList(state.conversations);
  } else {
    // If conversation not in list yet, reload
    loadConversations();
  }
}

async function loadConversations() {
  if (!elements.conversationList) return;

  elements.conversationList.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading conversations...</p>
    </div>
  `;

  try {
    const res = await apiRequest("/chat/conversations");
    state.conversations = res.data || [];

    if (elements.conversationsCount) {
      elements.conversationsCount.textContent = state.conversations.length;
    }

    renderConversationsList(state.conversations);

    // If an active conversation was already open, reload its messages
    if (state.activeConversation) {
      const stillExists = state.conversations.find(
        (c) => c.matchId === state.activeConversation.matchId
      );
      if (stillExists) {
        await selectConversation(state.activeConversation.matchId);
      } else {
        closeChatWindow();
      }
    }
  } catch (err) {
    elements.conversationList.innerHTML = `
      <div class="empty-state">
        <p>⚠️ Failed to load chat conversations: ${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

function renderConversationsList(conversations) {
  elements.conversationList.innerHTML = "";

  if (conversations.length === 0) {
    elements.conversationList.innerHTML = `
      <div class="empty-state">
        <p>No active chat conversations yet.</p>
        <p class="text-muted" style="font-size: 0.8rem; margin-top: 0.5rem;">
          Chat unlocks automatically when an invitation match is <strong>Accepted</strong>.
        </p>
      </div>
    `;
    return;
  }

  conversations.forEach((conv) => {
    const item = document.createElement("div");
    const isActive = state.activeConversation && state.activeConversation.matchId === conv.matchId;
    item.className = `conversation-item ${isActive ? "active" : ""}`;
    item.id = `conv-item-${conv.matchId}`;

    const other = conv.otherParticipant || {};
    const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";
    const avatar = other.avatar || defaultAvatar;
    const timeStr = conv.lastMessage?.createdAt
      ? formatTimeAgo(new Date(conv.lastMessage.createdAt))
      : formatTimeAgo(new Date(conv.createdAt));

    const lastMsgPreview = conv.lastMessage?.message
      ? escapeHtml(conv.lastMessage.message)
      : "<em>No messages yet. Start collaborating!</em>";

    item.innerHTML = `
      <div class="conv-avatar-wrap">
        <img src="${avatar}" alt="${escapeHtml(other.name || "User")}" class="conv-avatar">
        <span class="conv-online-dot"></span>
      </div>
      <div class="conv-info">
        <div class="conv-row-top">
          <span class="conv-name">${escapeHtml(other.name || "Collaborator")}</span>
          <span class="conv-time">${timeStr}</span>
        </div>
        <div class="conv-row-project">📁 ${escapeHtml(conv.projectName || "Project")}</div>
        <div class="conv-last-msg">${lastMsgPreview}</div>
      </div>
    `;

    item.addEventListener("click", () => selectConversation(conv.matchId));
    elements.conversationList.appendChild(item);
  });
}

async function selectConversation(matchId) {
  const conv = state.conversations.find((c) => c.matchId === matchId);
  if (!conv) return;

  state.activeConversation = conv;

  // Highlight active conversation item in sidebar
  document.querySelectorAll(".conversation-item").forEach((el) => el.classList.remove("active"));
  const activeEl = document.getElementById(`conv-item-${matchId}`);
  if (activeEl) activeEl.classList.add("active");

  // Show active chat window and hide empty state
  if (elements.chatEmptyState) elements.chatEmptyState.style.display = "none";
  if (elements.chatActiveView) elements.chatActiveView.style.display = "flex";

  // Populate Header
  const other = conv.otherParticipant || {};
  const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";
  if (elements.chatPartnerAvatar) elements.chatPartnerAvatar.src = other.avatar || defaultAvatar;
  if (elements.chatPartnerName) elements.chatPartnerName.textContent = other.name || "Partner";
  if (elements.chatPartnerRole) elements.chatPartnerRole.textContent = other.preferredRole || other.role || "Developer";
  if (elements.chatProjectTag) elements.chatProjectTag.textContent = `📁 ${conv.projectName || "Project"}`;

  // Join Socket Room
  if (state.socket && state.socket.connected) {
    state.socket.emit("join_conversation", { matchId });
  }

  // Load Message History
  elements.messagesContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading messages...</p>
    </div>
  `;

  try {
    const res = await apiRequest(`/chat/conversations/${matchId}/messages`);
    state.messages = res.data?.messages || [];
    renderMessages(state.messages);
    scrollToLatestMessage();

    // Focus input box
    if (elements.chatMessageInput) {
      elements.chatMessageInput.focus();
    }
  } catch (err) {
    elements.messagesContainer.innerHTML = `
      <div class="empty-state">
        <p>⚠️ Failed to load message history: ${escapeHtml(err.message)}</p>
      </div>
    `;
  }
}

function renderMessages(messages) {
  elements.messagesContainer.innerHTML = "";

  const currentUserId = state.currentRole === "lead"
    ? (state.leadUser?._id || "")
    : state.currentRole;

  if (messages.length === 0) {
    elements.messagesContainer.innerHTML = `
      <div class="empty-state" style="margin: auto;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">👋</div>
        <p>No messages in this collaboration yet.</p>
        <p style="font-size: 0.8rem; color: var(--text-muted);">Say hello and kick off your project!</p>
      </div>
    `;
    return;
  }

  messages.forEach((msg) => {
    appendMessageToContainer(msg, currentUserId);
  });
}

function appendMessageToContainer(msg, currentUserId) {
  // If empty state placeholder is present, clear it
  const emptyState = elements.messagesContainer.querySelector(".empty-state");
  if (emptyState) emptyState.remove();

  const senderId = msg.sender?._id?.toString() || msg.sender?.toString() || "";
  const isMe = senderId === currentUserId?.toString();

  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${isMe ? "sent" : "received"}`;
  bubble.id = `msg-${msg._id}`;

  const senderName = isMe ? "You" : (msg.sender?.name || "Partner");
  const timeFormatted = new Date(msg.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  bubble.innerHTML = `
    <div class="message-sender-title">${escapeHtml(senderName)}</div>
    <div class="message-text">${escapeHtml(msg.message)}</div>
    <div class="message-time">${timeFormatted}</div>
  `;

  elements.messagesContainer.appendChild(bubble);
}

function scrollToLatestMessage() {
  if (elements.messagesContainer) {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
  }
}

function closeChatWindow() {
  state.activeConversation = null;
  state.messages = [];
  if (elements.chatEmptyState) elements.chatEmptyState.style.display = "flex";
  if (elements.chatActiveView) elements.chatActiveView.style.display = "none";
}

async function handleSendChatMessage(e) {
  e.preventDefault();
  if (!state.activeConversation) return;

  const input = elements.chatMessageInput;
  const messageText = input.value.trim();
  if (!messageText) return;

  const matchId = state.activeConversation.matchId;

  // Clear input immediately for responsive feel
  input.value = "";

  // Stop typing indicator
  if (state.socket) {
    state.socket.emit("stop_typing", { matchId });
  }

  try {
    // If Socket.IO is connected, emit real-time send_message
    if (state.socket && state.socket.connected) {
      state.socket.emit("send_message", { matchId, message: messageText }, (response) => {
        if (!response || !response.success) {
          // If socket callback reported error, fallback or alert
          console.warn("Socket send_message response failed:", response?.message);
        }
      });
    } else {
      // Fallback to REST endpoint
      const res = await apiRequest(`/chat/conversations/${matchId}/messages`, {
        method: "POST",
        body: JSON.stringify({ message: messageText }),
      });
      if (res.success && res.data) {
        const currentUserId = state.currentRole === "lead"
          ? (state.leadUser?._id || "")
          : state.currentRole;
        appendMessageToContainer(res.data, currentUserId);
        scrollToLatestMessage();
      }
    }
  } catch (err) {
    showToast(`Failed to send message: ${err.message}`, "error");
  }
}

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", initApp);

