import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  INITIAL_DEVELOPERS,
  INITIAL_PROJECTS,
  INITIAL_INVITATIONS,
  INITIAL_MATCHES,
  INITIAL_CHATS,
  CURRENT_USER_PROFILE,
} from '../data/projectsData';
import { getSkillLabels } from '../data/skillsDatabase';

const AppContext = createContext();

export function AppProvider({ children }) {
  // 1. AUTH STATE
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(CURRENT_USER_PROFILE);
  const [authError, setAuthError] = useState(null);

  // 2. PROJECTS STATE
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState('p4'); // Default: StudySync
  const [viewedProjectId, setViewedProjectId] = useState('p4'); // Currently viewed in ProjectsScreen

  // 3. DISCOVERY STATE
  // Track skipped and invited developer IDs per project: { [projectId]: ['d1', 'd2'] }
  const [skippedDevsByProject, setSkippedDevsByProject] = useState({});
  const [invitedDevsByProject, setInvitedDevsByProject] = useState({
    p1: ['d5'],
    p3: ['d4'],
    p2: ['d3'],
  });

  // 4. INVITATIONS & MATCHES STATE
  const [invitations, setInvitations] = useState(INITIAL_INVITATIONS);
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [pendingMatchCelebration, setPendingMatchCelebration] = useState(null);

  // 5. CHATS STATE (Project-specific conversations keyed by `${projectId}_${developerId}`)
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState(null);

  // Selected developer when viewing third-party profile from Discover / Matches
  const [selectedDeveloperForProfile, setSelectedDeveloperForProfile] = useState(null);

  // 6. NOTIFICATIONS STATE
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      type: 'INVITATION',
      title: 'New Collaboration Invite!',
      message: 'Rohan Mehta invited you to collaborate on Campus Connect.',
      time: '2h ago',
      read: false,
    },
    {
      id: 'notif-2',
      type: 'MATCH',
      title: "It's a Match! 🎉",
      message: 'You and Maya Lin matched on StudySync!',
      time: '1d ago',
      read: false,
    },
    {
      id: 'notif-3',
      type: 'MESSAGE',
      title: 'New Message from Sneha',
      message: 'Sent an attachment: design-tokens.fig',
      time: '9:12 AM',
      read: false,
    },
  ]);

  // 7. SETTINGS STATE
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // --- AUTH ACTIONS ---
  const login = (email, password) => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }
    setIsAuthenticated(true);
    setAuthError(null);
    return { success: true };
  };

  const register = ({ name, email, role, password }) => {
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Please enter your full name' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (!role || role.trim().length < 2) {
      return { success: false, error: 'Please specify your developer role' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters' };
    }

    setCurrentUser((prev) => ({
      ...prev,
      name: name.trim(),
      role: role.trim(),
    }));
    setIsAuthenticated(true);
    setAuthError(null);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveChatId(null);
  };

  // --- PROJECT ACTIONS ---
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === activeProjectId) || projects[0] || null;
  }, [projects, activeProjectId]);

  const viewedProject = useMemo(() => {
    return projects.find((p) => p.id === viewedProjectId) || activeProject || null;
  }, [projects, viewedProjectId, activeProject]);

  const createProject = (projectData) => {
    const newId = `p-${Date.now()}`;
    const newProj = {
      id: newId,
      title: projectData.title || 'New Project',
      category: projectData.category || 'Web App',
      description: projectData.description || 'Exciting collaborative developer project.',
      techStack: projectData.techStack && projectData.techStack.length > 0
        ? projectData.techStack
        : ['react', 'nodejs'],
      membersCount: 1,
      maxMembers: parseInt(projectData.maxMembers, 10) || 4,
      members: [
        {
          id: 'me',
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
      ],
      wantedRoles: projectData.wantedRoles && projectData.wantedRoles.length > 0
        ? projectData.wantedRoles
        : ['Frontend Developer', 'Backend Developer'],
      experienceLevel: projectData.experienceLevel || 'Intermediate',
      status: 'Recruiting',
      icon: projectData.icon || '🚀',
      banner: projectData.banner || null,
      duration: projectData.duration || 'Ongoing',
      interests: projectData.interests || [],
    };

    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newId);
    setViewedProjectId(newId);

    // Add notification
    addNotification({
      type: 'PROJECT',
      title: 'Project Created! 🚀',
      message: `"${newProj.title}" is now active for developer discovery.`,
    });

    return newProj;
  };

  const updateProject = (id, patch) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
    );
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

  const closeProject = (id) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'CLOSED' } : p
      )
    );
    addNotification({
      type: 'PROJECT',
      title: 'Project Closed 🔒',
      message: `Project has been closed and is no longer recruiting.`,
    });
  };

  // --- DISCOVERY & MATCHING ACTIONS ---
  // Returns developers who have NOT been skipped or invited for the active project
  const availableDevelopersForActiveProject = useMemo(() => {
    const skipped = skippedDevsByProject[activeProjectId] || [];
    const invited = invitedDevsByProject[activeProjectId] || [];
    const excludedIds = new Set([...skipped, ...invited]);

    return INITIAL_DEVELOPERS.filter((d) => !excludedIds.has(d.id)).map((d) => {
      // Calculate dynamic match percentage based on active project's tech stack
      let matchedSkills = 0;
      const projSkills = getSkillLabels(activeProject?.techStack || []);
      d.skills.forEach((s) => {
        if (projSkills.some((ps) => ps.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ps.toLowerCase()))) {
          matchedSkills++;
        }
      });
      const calculatedScore = Math.min(99, Math.max(78, 80 + matchedSkills * 6));
      return {
        ...d,
        matchScore: calculatedScore,
      };
    });
  }, [activeProjectId, skippedDevsByProject, invitedDevsByProject, activeProject]);

  const skipDeveloper = (devId) => {
    setSkippedDevsByProject((prev) => ({
      ...prev,
      [activeProjectId]: [...(prev[activeProjectId] || []), devId],
    }));
  };

  const unskipDeveloper = (devId) => {
    setSkippedDevsByProject((prev) => ({
      ...prev,
      [activeProjectId]: (prev[activeProjectId] || []).filter((id) => id !== devId),
    }));
  };

  const uninviteDeveloper = (devId) => {
    setInvitedDevsByProject((prev) => ({
      ...prev,
      [activeProjectId]: (prev[activeProjectId] || []).filter((id) => id !== devId),
    }));
    setInvitations((prev) =>
      prev.filter(
        (inv) => !(inv.developerId === devId && inv.projectId === activeProjectId)
      )
    );
  };

  const resetDiscoveryForProject = (projectId) => {
    const targetId = projectId || activeProjectId;
    setSkippedDevsByProject((prev) => ({
      ...prev,
      [targetId]: [],
    }));
  };

  const inviteDeveloper = (dev, isSuper = false) => {
    // Record invited ID for active project so dev won't re-appear
    setInvitedDevsByProject((prev) => ({
      ...prev,
      [activeProjectId]: [...(prev[activeProjectId] || []), dev.id],
    }));

    // Create an invitation record tied to the active project
    const newInvitation = {
      id: `inv-${Date.now()}`,
      developerId: dev.id,
      developerName: dev.name,
      developerRole: dev.role,
      developerAvatar: dev.avatar,
      projectId: activeProjectId,
      projectName: activeProject ? activeProject.title : 'StudySync',
      timeAgo: 'Just now',
      matchScore: dev.matchScore || 95,
      isSuper,
      status: 'PENDING',
    };

    setInvitations((prev) => [newInvitation, ...prev]);

    // Add notification
    addNotification({
      type: 'INVITATION',
      title: isSuper ? '★ Super Invite Sent! ★' : 'Invite Sent! ♥',
      message: `Invited ${dev.name} to join ${newInvitation.projectName}.`,
    });
  };

  // --- INVITATIONS & MATCHES ---
  const acceptInvitation = (invitation) => {
    // Remove from invitations
    setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));

    // Create Match record associated with the project
    const newMatch = {
      id: `match-${Date.now()}`,
      developerId: invitation.developerId,
      developerName: invitation.developerName,
      developerRole: invitation.developerRole,
      developerAvatar: invitation.developerAvatar,
      projectId: invitation.projectId || activeProjectId,
      projectName: invitation.projectName || (activeProject ? activeProject.title : 'Project'),
      matchScore: invitation.matchScore || 96,
      breakdown: { skill: 52, interest: 26, role: 18 },
      recentMessage: `Matched for ${invitation.projectName}! Start the discussion.`,
      status: 'ACCEPTED',
      createdAt: 'Just now',
    };

    setMatches((prev) => [newMatch, ...prev]);

    // Automatically ensure project-specific chat thread exists
    const chatId = `c_${newMatch.projectId}_${newMatch.developerId}`;
    setChats((prev) => {
      const exists = prev.some((c) => c.id === chatId);
      if (!exists) {
        const newChat = {
          id: chatId,
          projectId: newMatch.projectId,
          projectName: newMatch.projectName,
          developerId: newMatch.developerId,
          developerName: newMatch.developerName,
          developerRole: newMatch.developerRole,
          developerAvatar: newMatch.developerAvatar,
          status: 'Online',
          lastMessage: `You matched for ${newMatch.projectName}! Say hi 👋`,
          time: 'Just now',
          unreadCount: 1,
          messages: [
            {
              id: `msg-${Date.now()}`,
              sender: newMatch.developerName,
              text: `Hey! I'm super excited to collaborate on ${newMatch.projectName}! 🚀`,
              time: 'Just now',
              isMe: false,
            },
          ],
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
      title: "It's a Match! 🎉",
      message: `You and ${newMatch.developerName} are now connected on ${newMatch.projectName}!`,
    });

    return newMatch;
  };

  const rejectInvitation = (invitationId, devName = 'Developer') => {
    setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
  };

  // --- CHATS (PROJECT-SPECIFIC) ---
  const getOrCreateChatForMatch = (match) => {
    const targetChatId = `c_${match.projectId}_${match.developerId}`;
    const existing = chats.find((c) => c.id === targetChatId);

    if (existing) {
      setActiveChatId(targetChatId);
      return existing;
    }

    // Create new project-specific conversation
    const newChat = {
      id: targetChatId,
      projectId: match.projectId,
      projectName: match.projectName,
      developerId: match.developerId,
      developerName: match.developerName,
      developerRole: match.developerRole,
      developerAvatar: match.developerAvatar,
      status: 'Online',
      lastMessage: `Discussion for ${match.projectName}`,
      time: 'Just now',
      unreadCount: 0,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: match.developerName,
          text: `Hey! Excited to build ${match.projectName} together! Let's talk architecture.`,
          time: 'Just now',
          isMe: false,
        },
      ],
    };

    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(targetChatId);
    return newChat;
  };

  const sendMessage = (chatId, text, isMe = true, sender = 'You') => {
    if (!text || !text.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}-${Math.random()}`,
      sender,
      text: text.trim(),
      time: 'Just now',
      isMe,
    };

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            lastMessage: text.trim(),
            time: 'Just now',
            messages: [...chat.messages, newMsg],
          };
        }
        return chat;
      })
    );

    // If sent by the user, trigger a realistic developer response after 1.2s
    if (isMe) {
      setTimeout(() => {
        setChats((prev) => {
          const targetChat = prev.find((c) => c.id === chatId);
          if (!targetChat) return prev;
          const devName = targetChat.developerName || 'Partner';
          const replies = [
            `Sounds like a solid plan! I will review the architecture and start on our first milestone for ${targetChat.projectName}. 🚀`,
            `Totally agree! I can handle the API endpoints and state management. When should we sync up?`,
            `Let's build! I love this direction. I'm cloning the repo now. 💻`,
            `Awesome, ready to roll! Let me know where I can dive in first. ⚡`,
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          const replyMsg = {
            id: `msg-${Date.now()}-${Math.random()}`,
            sender: devName,
            text: randomReply,
            time: 'Just now',
            isMe: false,
          };
          return prev.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  lastMessage: randomReply,
                  time: 'Just now',
                  messages: [...c.messages, replyMsg],
                }
              : c
          );
        });
      }, 1200);
    }
  };

  const markChatAsRead = (chatId) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
    );
  };

  // --- NOTIFICATIONS ---
  const addNotification = ({ type, title, message }) => {
    const newN = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      time: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newN, ...prev]);
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // --- PROFILE ---
  const updateProfile = (patch) => {
    setCurrentUser((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        // Auth
        isAuthenticated,
        currentUser,
        authError,
        login,
        register,
        logout,

        // Projects
        projects,
        activeProjectId,
        activeProject,
        viewedProjectId,
        viewedProject,
        setActiveProjectId,
        setViewedProjectId,
        createProject,
        updateProject,
        deleteProject,
        closeProject,

        // Discovery
        availableDevelopersForActiveProject,
        skipDeveloper,
        unskipDeveloper,
        uninviteDeveloper,
        inviteDeveloper,
        resetDiscoveryForProject,

        // Invitations & Matches
        invitations,
        matches,
        acceptInvitation,
        rejectInvitation,
        pendingMatchCelebration,
        setPendingMatchCelebration,

        // Chats
        chats,
        activeChatId,
        setActiveChatId,
        getOrCreateChatForMatch,
        sendMessage,
        markChatAsRead,

        // Notifications & Settings
        notifications,
        unreadNotificationsCount,
        addNotification,
        markAllNotificationsRead,
        pushNotificationsEnabled,
        setPushNotificationsEnabled,
        soundEnabled,
        setSoundEnabled,

        // Profile
        updateProfile,
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
