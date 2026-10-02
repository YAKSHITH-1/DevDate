# DevDate

**DevDate is a developer collaboration and team-matching platform that helps developers discover teammates, create projects, find relevant skills, and collaborate in real time.**

The goal of DevDate is to make it easier for developers to find the right people to build projects with.

## Features

- **Developer Profiles** — Create profiles with technical skills and interests.
- **Developer Discovery** — Discover developers and potential collaborators.
- **Project Creation** — Create projects with descriptions, required skills, and team requirements.
- **100+ Skills** — Select from a predefined skill library with skill canonicalization.
- **Project Discovery** — Browse projects and explore collaboration opportunities.
- **Invitations** — Send, accept, and reject collaboration invitations.
- **Matching** — Accepted invitations create developer matches.
- **Real-Time Chat** — Chat with matched developers using Socket.IO.
- **Conversations** — View conversations and complete message history.
- **Notifications** — Receive and manage application notifications.
- **Real-Time Notifications** — Get notifications instantly without refreshing.
- **Unread Notification Count** — Track unread notifications directly from the application.
- **Pull to Refresh** — Refresh dynamic application data when needed.
- **Authentication** — JWT-based authentication with protected application flows.
- **Centralized State** — Manage authentication, matches, notifications, and socket state.
- **API Integration** — Dedicated API layer with normalized match, message, conversation, and notification data.
- **Automated Testing** — Backend integration and regression tests covering core functionality.

## Tech Stack

**Frontend**
- React Native
- Expo
- JavaScript
- Expo Router
- Zustand
- Socket.IO Client

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Socket.IO

## Application Flow

```text
Create Profile
      ↓
Discover Developers / Projects
      ↓
Create or Explore Projects
      ↓
Send Invitation
      ↓
Invitation Accepted
      ↓
Match Created
      ↓
Real-Time Chat
      ↓
Collaborate
```

## Project Structure

```text
DevDate
├── frontend
│   ├── screens
│   ├── components
│   ├── utils
│   ├── context
│   └── navigation
│
└── backend
    ├── controllers
    ├── models
    ├── routes
    ├── services
    ├── middleware
    └── tests
```

## Testing

DevDate includes automated backend integration and regression tests covering authentication, projects, invitations, matches, chat, notifications, and API functionality.

**Test status: 0 failures**

## Author

**Yakshith V**
**Shrikar V**

Portfolio: **https://yakshith.me**
