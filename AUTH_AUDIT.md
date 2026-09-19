# AUTH 12A — COMPLETE AUTH AUDIT & FLOW MAPPING

**Date:** September 17, 2026  
**Auditor:** Antigravity Agentic Pair Programmer  
**Target Application:** DevDate (React Native / Expo Mobile App & Node.js / Express / MongoDB Backend)  
**Status:** Audit & Flow Mapping Complete — No Code Rewrites Performed in 12A  

---

## 1. Current Authentication Architecture

DevDate's authentication architecture is split between a **comprehensive, production-grade backend implementation** and a **partially connected, mocked-out frontend implementation**.

```
+---------------------------------------------------------------------------------------------------+
|                                      FRONTEND (React Native / Expo)                               |
|                                                                                                   |
|   +-------------------------------------------------------------------------------------------+   |
|   |  LandingScreen.js (Mock UI Flow)                                                          |   |
|   |  • 'landing' cover view                                                                   |   |
|   |  • 'signup' view (client-side regex only)                                                 |   |
|   |  • 'login' view (client-side regex only)                                                  |   |
|   |  • 'otp' view (hardcoded initial digits ['8','4','2','0','7','1'], mock countdown)        |   |
|   |  • OtpSuccessModal.js (Celebration popup: "YOU'RE IN THE SQUAD!")                         |   |
|   +-------------------------------------------------------------------------------------------+   |
|                                      | calls local dummy auth methods                             |
|                                      v                                                            |
|   +-------------------------------------------------------------------------------------------+   |
|   |  AppContext.js (Memory State Only)                                                        |   |
|   |  • isAuthenticated: boolean (defaults to false)                                           |   |
|   |  • currentUser: CURRENT_USER_PROFILE (hardcoded mock in projectsData.js)                  |   |
|   |  • login(email, password) -> sets isAuthenticated(true), NO network call                  |   |
|   |  • register(...) -> updates local name/role, sets isAuthenticated(true), NO network call  |   |
|   |  • logout() -> sets isAuthenticated(false), disconnects socket, NO network call           |   |
|   |  • Token Storage: NONE (No AsyncStorage, no SecureStore, tokens are null)                 |   |
|   +-------------------------------------------------------------------------------------------+   |
|                                      |                                                            |
|                                      | Manual passing of (token, uid) where token is always null  |
|                                      v                                                            |
|   +-------------------------------------------------------------------------------------------+   |
|   |  api.js (Fetch Wrapper)                                                                   |   |
|   |  • BASE_URL: http://localhost:5000/api                                                    |   |
|   |  • NO auth API methods (no loginApi, no registerApi, no verifyApi, no refreshApi)         |   |
|   |  • NO automatic Authorization header attachment                                           |   |
|   |  • NO 401 response interceptor or token refresh loop                                      |   |
|   +-------------------------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------------------------+
                                       |
                                       | (DISCONNECTED: Frontend does NOT call backend auth endpoints)
                                       v
+---------------------------------------------------------------------------------------------------+
|                                      BACKEND (Node.js / Express / MongoDB)                        |
|                                                                                                   |
|   +-------------------------------------------------------------------------------------------+   |
|   |  Express App & Middleware (/api/auth)                                                     |   |
|   |  • Rate Limiting: 10 requests / 15 min per IP on /login & /forgot-password                |   |
|   |  • CORS: origin: true, credentials: true                                                  |   |
|   |  • Cookie Parser: reads req.cookies                                                       |   |
|   |  • Express Validator: input normalization & validation rules                              |   |
|   |  • JWT Auth Middleware: Bearer token verification + fallback x-user-id                    |   |
|   +-------------------------------------------------------------------------------------------+   |
|                                      |                                                            |
|   +-------------------------------------------------------------------------------------------+   |
|   |  Auth Module (/backend/src/modules/auth/)                                                 |   |
|   |  • POST /register        -> User (unverified) + EmailOTP (10m TTL) + Gmail OAuth2 OTP    |   |
|   |  • POST /verify-email    -> Validates 6-digit OTP, marks User.isVerified = true           |   |
|   |  • POST /login           -> Validates credentials, issues JWT Access Token (15m) +        |   |
|   |                             Refresh Token (7d) in HTTP-only cookie, creates Session       |   |
|   |  • POST /refresh         -> Reads cookie, validates Session, detects reuse, rotates tokens|   |
|   |  • POST /logout          -> Revokes Session in Mongo, clears HTTP-only cookie             |   |
|   |  • POST /logout-all      -> Revokes all user sessions in Mongo, clears cookie             |   |
|   |  • POST /forgot-password -> Generates 32-byte token, stores SHA-256 hash (15m TTL),       |   |
|   |                             dispatches reset email with token link                        |   |
|   |  • POST /reset-password  -> Validates token, hashes new password, revokes all sessions    |   |
|   |  • GET  /me              -> Returns authenticated user profile (strips passwordHash)      |   |
|   +-------------------------------------------------------------------------------------------+   |
|                                      |                                                            |
|   +-------------------------------------------------------------------------------------------+   |
|   |  MongoDB Collections: users, sessions, emailotps, passwordresets                          |   |
|   +-------------------------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Backend Auth Flow

The backend implementation in `backend/src/modules/auth/` is complete, fully modularized, and follows high security standards:

1. **Routing (`backend/src/modules/auth/auth.routes.js`)**:
   - `POST /api/auth/register`: Public, validated via `registerValidation`.
   - `POST /api/auth/verify-email`: Public, validated via `verifyEmailValidation`.
   - `POST /api/auth/login`: Public, rate limited via `loginLimiter`, validated via `loginValidation`.
   - `POST /api/auth/refresh`: Public, consumes `refreshToken` HTTP-only cookie.
   - `POST /api/auth/logout`: Public, revokes session identified by cookie.
   - `POST /api/auth/logout-all`: Protected via `authenticate` middleware, revokes all sessions for user.
   - `POST /api/auth/forgot-password`: Public, rate limited via `loginLimiter`, validated via `forgotPasswordValidation`.
   - `POST /api/auth/reset-password`: Public, validated via `resetPasswordValidation`.
   - `GET /api/auth/me`: Protected via `authenticate` middleware, retrieves authenticated user profile.

2. **Middleware & Protection**:
   - `authenticate` (`backend/src/middleware/auth.js`): Inspects `Authorization: Bearer <token>`. Verifies JWT signature using `JWT_SECRET`. Asserts `decoded.type === "access"`. Verifies user exists in database and `isVerified === true`. Rejects expired tokens with `401 Access token has expired. Please refresh your token.` Contains legacy fallback allowing `x-user-id` header if no token is present.
   - `loginLimiter` (`backend/src/middleware/rateLimiter.js`): Restricts requests to 10 attempts per 15 minutes per IP. Automatically disabled during `NODE_ENV === "test"`.

3. **Controller & Service Layer**:
   - Clean controller (`auth.controller.js`) separating HTTP status / cookies / serialization from domain logic.
   - Robust service (`auth.service.js`) encapsulating bcrypt hashing, crypto generation, database queries, and email dispatches.

---

## 3. Frontend Auth Flow

The frontend authentication implementation is located primarily across three files:
- `app/App.js`
- `app/context/AppContext.js`
- `app/screens/LandingScreen.js`

### Actual Execution Pathway in Frontend Today:
1. App launches into `App.js`. `useApp()` provides `isAuthenticated` (default: `false`).
2. `activeTab` initializes to `'landing'`.
3. `LandingScreen.js` mounts, showing `'landing'` cover view (`landing_cover_clean.png`).
4. Clicking **"GET STARTED"** triggers `handleOpenSignup` -> switches `currentView` to `'signup'`.
5. Clicking **"I ALREADY HAVE AN ACCOUNT"** triggers `handleOpenLogin` -> switches `currentView` to `'login'`.
6. Submitting Login or Signup performs client-side regex check, then immediately flips `currentView` to `'otp'`. **NO network call is dispatched.**
7. In `'otp'` view, 6 digit inputs are prefilled with mock digits `['8', '4', '2', '0', '7', '1']`. A live client-side countdown timer ticks down from 42s.
8. User taps **"VERIFY PASSCODE"** -> `handleVerifyOtp` immediately opens `OtpSuccessModal` (`showSuccessModal = true`). **NO network call is dispatched.**
9. In `OtpSuccessModal`, user taps **"ENTER SQUAD DISCORD"** or **"VIEW SQUAD PROFILE"**:
   - Calls `login()` or `register()` in `AppContext.js`.
   - `AppContext.login()` sets `isAuthenticated = true` in local state.
   - Calls `onGetStarted()`, which in `App.js` sets `activeTab = 'discover'`.
   - The user is now in the main app tab view (`HomeScreen.js`).

**Status:** The frontend auth is **100% mocked in memory**. It does not interact with the backend auth API.

---

## 4. Registration Flow

### Flow Comparison: Backend vs Frontend

| Step | Backend Implementation (`POST /api/auth/register`) | Frontend Implementation (`LandingScreen.js` + `AppContext.js`) |
| :--- | :--- | :--- |
| **Input Fields** | `name`, `email`, `password` | `name`, `email`, `password`, `selectedRole`, `agreeTerms` |
| **Validation** | Name: 2–50 chars; Email: normalized & valid; Password: min 8 chars, >=1 letter, >=1 number | Name: min 1 char; Email: includes '@'; Role: min 2 chars; Password: min 4 chars |
| **Duplicate Check** | Looks up email in MongoDB: If verified -> 409 Conflict. If unverified -> updates existing record & resets OTP | None |
| **Password Hashing**| `bcrypt.hash(password, 10)` | None (plain text ignored) |
| **Account Creation**| Creates `User` document with `isVerified: false` | Updates in-memory `currentUser` state |
| **OTP Generation** | `crypto.randomInt(100000, 1000000)` (cryptographic 6-digit) | None |
| **OTP Storage** | Bcrypt hashed in `EmailOTP` collection (10m TTL index) | None |
| **Email Dispatch** | Sends responsive HTML email via Nodemailer / Gmail OAuth2 | None |
| **Response** | `201 Created` with `{ userId, name, email, isVerified: false }` | Direct view change to `'otp'` |

### Audit Findings:
- **Backend Implemented:** YES. Tested and verified.
- **Frontend Connected:** NO. Frontend bypasses `POST /api/auth/register` completely.
- **Payload Discrepancy:** Frontend collects `role` on registration, but backend `register` schema only accepts `{ name, email, password }`. The `role` field is part of the `User` schema in backend (`role`, `preferredRole`), but not processed in `registerUser`.

---

## 5. Email Verification Flow

### Flow Comparison: Backend vs Frontend

| Step | Backend Implementation (`POST /api/auth/verify-email`) | Frontend Implementation (`LandingScreen.js` + `OtpSuccessModal.js`) |
| :--- | :--- | :--- |
| **Inputs** | `{ email, otp }` (6-digit numeric string) | `otpDigits` array `['8', '4', '2', '0', '7', '1']` |
| **Validation** | Email format checked; OTP must be exactly 6 digits numeric | None |
| **Verification** | Finds user by email; finds latest unexpired `EmailOTP` record; checks `bcrypt.compare(otp, hashedOTP)` | None |
| **Database Update**| Sets `user.isVerified = true`; deletes all OTP records for user | None |
| **Session / Token**| Does **NOT** issue access token or session (user must log in next) | Sets `isAuthenticated = true` directly |
| **Error Handling** | 404 (User not found), 400 (Already verified / Code expired / Invalid code) | None |
| **Resend OTP** | Can re-call `POST /api/auth/register` to generate fresh OTP | Client-only countdown timer (resets to 42s) |

### Can an unverified user log in?
- **Backend:** NO. `loginUser` in `auth.service.js` explicitly checks `if (!user.isVerified) throw new ApiError(403, "Please verify your email address before logging in.")`. `authenticate` middleware also checks `if (!user.isVerified) throw new ApiError(403, "Account email is not verified.")`.
- **Frontend:** YES. In frontend mock flow, no verification check exists; user can enter any email and reach the main app.

### Audit Findings:
- **Backend Implemented:** YES.
- **Frontend Connected:** NO. No network call to `POST /api/auth/verify-email`.
- **Contract Note:** After backend verification succeeds, the user does NOT receive a token from `/verify-email`. The backend expects the user to navigate to Login, or login automatically with saved credentials. Frontend currently displays a success modal and transitions directly into the authenticated app.

---

## 6. Login Flow

### Flow Comparison: Backend vs Frontend

| Step | Backend Implementation (`POST /api/auth/login`) | Frontend Implementation (`LandingScreen.js` + `AppContext.js`) |
| :--- | :--- | :--- |
| **Inputs** | `{ email, password }` | `loginEmail`, `loginPassword` |
| **Rate Limiter** | 10 attempts per 15 minutes per IP (`loginLimiter`) | None |
| **Authentication** | Validates email & password via bcrypt against `user.passwordHash` | Dummy check: email has '@', password >= 4 chars |
| **Verification Gate**| Rejects unverified accounts with `403 Forbidden` | None |
| **Session Creation**| Creates `Session` in MongoDB with device metadata, lastUsedAt, 7d TTL | None |
| **Tokens Issued** | `accessToken` in JSON response; `refreshToken` in HTTP-only cookie | None |
| **Response Format**| `{ success: true, message: "Login successful", accessToken, user: { id, name, email, isVerified } }` | `{ success: true }` local return |
| **Navigation** | N/A (Backend API) | Flips `activeTab` to `'discover'` |

### Audit Findings:
- **Backend Implemented:** YES.
- **Frontend Connected:** NO. Frontend Login screen does not call `POST /api/auth/login`. It transitions to the OTP screen, then directly marks `isAuthenticated = true`.
- **User State Loading:** Frontend sets `currentUser` to the static mock object `CURRENT_USER_PROFILE` from `app/data/projectsData.js` instead of the user object returned by the backend.

---

## 7. Token Flow

### Token Anatomy & Behavior

1. **Access Token:**
   - **Type:** JSON Web Token (JWT).
   - **Secret:** `JWT_SECRET`.
   - **Payload:** `{ userId: string, sessionId: string, type: "access" }`.
   - **Lifetime:** 15 minutes (`ACCESS_TOKEN_EXPIRY || "15m"`).
   - **Delivery:** Returned in JSON response body `{ accessToken: "..." }`.
   - **Usage:** Sent in HTTP header `Authorization: Bearer <accessToken>`.

2. **Refresh Token:**
   - **Type:** JSON Web Token (JWT).
   - **Secret:** `REFRESH_TOKEN_SECRET`.
   - **Payload:** `{ userId: string, sessionId: string, type: "refresh" }`.
   - **Lifetime:** 7 days (`REFRESH_TOKEN_EXPIRY || "7d"`).
   - **Delivery:** Set by server as HTTP-only cookie `res.cookie("refreshToken", refreshToken, { httpOnly: true, path: "/api/auth", sameSite: "lax", maxAge: 7*24*60*60*1000 })`.
   - **Usage:** Automatically sent by browsers to `/api/auth/*` endpoints.

3. **Database Session Association:**
   - The plain refresh token is **NEVER** stored in the database.
   - MongoDB stores only the SHA-256 hash (`refreshTokenHash = crypto.createHash("sha256").update(token).digest("hex")`) inside the `Session` document.
   - Comparison uses constant-time `crypto.timingSafeEqual`.

4. **Frontend Token Handling:**
   - Frontend currently receives **NO** tokens because it does not call login.
   - No token is saved in memory or persistent storage.
   - When calling backend API endpoints from `AppContext.js`, `currentUser?.token` is passed as `null`.

---

## 8. Refresh / Session Flow

### Backend Refresh Mechanism (`POST /api/auth/refresh`)
```
Client Request (with refreshToken cookie)
       │
       ▼
Extract req.cookies.refreshToken
       │
       ├─► Missing? ──► 401 "Refresh token required. Please log in."
       ▼
Verify JWT with REFRESH_TOKEN_SECRET
       │
       ├─► Invalid/Expired? ──► 401 "Invalid or expired refresh token."
       ▼
Find Session in MongoDB by decoded.sessionId
       │
       ├─► Not found or revoked? ──► Invalidate all user sessions ──► 401 "Session has been invalidated"
       ├─► Session expired (TTL)? ──► Delete session ──► 401 "Session has expired"
       ▼
Compare candidate token with stored SHA-256 hash
       │
       ├─► MISMATCH DETECTED (Reuse Attack!)
       │      │
       │      ▼
       │   Revoke and delete ALL sessions for user
       │   Return 401 "Security violation: Reused refresh token detected."
       ▼
MATCH CONFIRMED (Session Rotation)
       │
       ▼
Issue new Access Token (15m)
Issue new Refresh Token (7d)
Update Session.refreshTokenHash with new hash
Update Session.lastUsedAt & Session.expiresAt
Set new HTTP-only cookie
Return 200 { success: true, accessToken }
```

### Can React Native Mobile App Actually Use This?
**CRITICAL FINDING: NO.** The current refresh mechanism is **INCOMPATIBLE** with React Native mobile applications:

1. **HTTP-Only Cookies in React Native:** React Native's native network layer (Android OkHttp / iOS NSURLSession) does not automatically share or persist `httpOnly` web cookies in the same way desktop browsers do.
2. **Path Restriction:** The cookie is set with `path: "/api/auth"`, which limits cookie transmission strictly to `/api/auth` subpaths, preventing general API calls from sending it.
3. **No Cookie Support in `api.js`:** The frontend `request()` function in `app/utils/api.js` uses standard `fetch(url, options)`. It does not specify `credentials: 'include'`.
4. **Backend Refresh Endpoint Only Checks Cookies:** In `backend/src/modules/auth/auth.controller.js`:
   ```javascript
   export const refresh = asyncHandler(async (req, res) => {
     const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
     // ...
   });
   ```
   There is **zero fallback** to read `req.body.refreshToken` or `req.headers['x-refresh-token']`. Any request without a parsed cookie immediately throws `401 Refresh token required`.
5. **No Refresh Method on Frontend:** `app/utils/api.js` does not have a `refreshTokenApi()` function, nor does it intercept 401 responses to trigger a token refresh.

**Required Action in Auth 12C / 12D:**
- Support dual refresh: accept refresh token from `req.cookies[REFRESH_COOKIE_NAME]` (for web) **OR** `req.body.refreshToken` / `req.headers['x-refresh-token']` (for mobile).
- Return the refresh token in the response body when called by a mobile client so the mobile client can persist it in secure storage.

---

## 9. Logout Flow

### Backend Logout
1. **Single Session Logout (`POST /api/auth/logout`)**:
   - Reads `rawRefreshToken` from `req.cookies.refreshToken`.
   - Verifies token or computes hash.
   - Deletes matching `Session` record from MongoDB.
   - Calls `res.clearCookie("refreshToken")`.
   - Returns `200 { success: true, message: "Logged out successfully." }`.
2. **All Devices Logout (`POST /api/auth/logout-all`)**:
   - Protected endpoint (`authenticate` middleware required).
   - Updates all user sessions to `revoked: true`, then deletes all sessions for `userId`.
   - Clears cookie.
   - Returns `200 { success: true, message: "Logged out from all devices successfully." }`.

### Frontend Logout (`ProfileScreen.js` -> `App.js` -> `AppContext.js`)
- `ProfileScreen.js` has two logout buttons: line 380 (own profile) and line 495 (settings).
- Tapping logout invokes `onLogout()` -> `App.js` `handleLogout()`:
  ```javascript
  const handleLogout = () => {
    logout();
    setActiveTab('landing');
  };
  ```
- `AppContext.logout()` executes:
  ```javascript
  const logout = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    }
    setIsAuthenticated(false);
    setActiveChatId(null);
  };
  ```

### What Frontend Logout FAILS to do:
- Does **NOT** call `POST /api/auth/logout` on the backend (backend session remains active).
- Does **NOT** clear any stored tokens or credentials.
- Does **NOT** reset `currentUser` to null (remains `CURRENT_USER_PROFILE`).
- Does **NOT** clear `projects`, `activeProjectId`, `viewedProjectId`.
- Does **NOT** clear `matches` or `invitations`.
- Does **NOT** clear `chats`.
- Does **NOT** clear `notifications` or unread count.
- Does **NOT** clear `skippedDevsByProject` or `invitedDevsByProject`.

---

## 10. Forgot / Reset Password Flow

### Backend Implementation (`POST /api/auth/forgot-password` & `POST /api/auth/reset-password`)
- **Forgot Password:**
  - Validates email format.
  - Returns identical generic success message whether email exists or not (anti-enumeration security).
  - If user exists: invalidates old reset tokens, generates 32-byte cryptographically secure random token (64 hex characters), stores SHA-256 hash with 15m expiration in `PasswordReset` collection.
  - Sends email with reset URL: `${APP_URL}/reset-password?token=${rawToken}`.
- **Reset Password:**
  - Validates token presence and password complexity (>=8 chars, >=1 letter, >=1 number).
  - Finds `PasswordReset` by SHA-256 hash. Checks explicit expiration.
  - Updates `User.passwordHash` using bcrypt.
  - **Single-use enforcement:** Deletes all reset tokens for user.
  - **Global session revocation:** Revokes and deletes all active sessions across all devices for the user.
- **Test Status:** 10/10 automated tests passing in `tests/auth.test.js`.

### Frontend Implementation
- **Forgot Password Screen:** **DOES NOT EXIST.**
  - `LandingScreen.js` line 317 has:
    ```javascript
    <TouchableOpacity onPress={() => alert('Demo Key: treehacks2025')}>
      <Text style={styles.forgotKeyLink}>Forgot key?</Text>
    </TouchableOpacity>
    ```
- **Reset Password Screen:** **DOES NOT EXIST.**
- **API Client:** `app/utils/api.js` has no `forgotPasswordApi` or `resetPasswordApi` functions.

---

## 11. Navigation / Auth-State Flow

### Navigation Architecture (`app/App.js`)
The application does **not** use `@react-navigation/native-stack` for top-level screen switching. Instead, it uses custom tab-state switching via React state:

```javascript
const [activeTab, setActiveTab] = useState(isAuthenticated ? 'discover' : 'landing');
```

- **Screens Managed:**
  - `'landing'`: `<LandingScreen onGetStarted={() => setActiveTab('discover')} />`
  - `'discover'`: `<HomeScreen />`
  - `'projects'`: `<ProjectsScreen />`
  - `'matches'`: `<MatchesScreen />`
  - `'chats'`: `<ChatsScreen />`
  - `'profile'`: `<ProfileScreen />`
- **Bottom Navigation Bar:** `<BottomNav />` is rendered for all tabs **except** `'landing'`.
- **Auth Sync Effect:**
  ```javascript
  useEffect(() => {
    if (!isAuthenticated && activeTab !== 'landing') {
      setActiveTab('landing');
    }
  }, [isAuthenticated]);
  ```

### What happens if the user manually navigates to a protected screen while logged out?
1. On app start, `isAuthenticated` is `false`, so `activeTab` is forced to `'landing'`.
2. The UI does not expose navigation controls to switch away from `'landing'` without completing the OTP modal.
3. If `activeTab` were programmatically set to `'discover'` while `isAuthenticated === false`, the `useEffect` immediately resets `activeTab` back to `'landing'`.
4. However, if rendered, protected screens do not have per-screen authentication guards; they rely entirely on `App.js`'s top-level tab state.
5. On the backend API layer, any request without a valid token (or valid `x-user-id`) is rejected with `401 Unauthorized`.

---

## 12. API Authentication Flow

### Inspection of `app/utils/api.js`
1. **Base URL:**
   ```javascript
   export function getApiBaseUrl() {
     return (
       (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
       'http://localhost:5000/api'
     );
   }
   ```
2. **Generic Fetch Wrapper (`request`)**:
   ```javascript
   async function request(endpoint, options = {}) {
     const url = `${getApiBaseUrl()}${endpoint}`;
     const headers = {
       'Content-Type': 'application/json',
       ...(options.headers || {}),
     };
     // ...
     const res = await fetch(url, { ...options, headers });
     // ...
   }
   ```
   - **No automatic token injection:** `request()` does NOT read or attach any token.
   - **No cookies included:** `credentials: 'include'` is omitted.
   - **No 401 handling:** If `res.status === 401`, it simply returns `{ success: false, status: 401, error: ... }`.
   - **No refresh attempt:** No automatic retry or refresh logic.

3. **Per-Endpoint Token Handling**:
   Every domain API function in `api.js` manually accepts `token = null` and `userId = null`:
   ```javascript
   export async function fetchMatchesApi(userId, token = null) {
     const headers = {};
     if (token) headers['Authorization'] = `Bearer ${token}`;
     if (userId) headers['x-user-id'] = userId;
     // ...
   }
   ```
   This pattern is repeated across **all 18 API calls** in `api.js`:
   - `fetchMatchesApi`
   - `fetchInvitationsApi`
   - `createInvitationApi`
   - `swipeDeveloperApi`
   - `fetchDiscoveryDevelopersApi`
   - `acceptInvitationApi`
   - `rejectInvitationApi`
   - `fetchChatMessages`
   - `sendChatMessage`
   - `fetchNotifications`
   - `fetchUnreadNotificationCount`
   - `markNotificationRead`
   - `markAllNotificationsReadApi`
   - `createProjectApi`
   - `fetchMyProjectsApi`
   - `fetchProjectByIdApi`
   - `updateProjectApi`
   - `closeProjectApi`

4. **Current Reality in Runtime**:
   Because `AppContext.js` sets `const token = currentUser?.token || null;` and `currentUser` is the mock `CURRENT_USER_PROFILE` (which has no `token` property), **every single API call currently sends `token: null`**. The frontend currently relies entirely on `x-user-id: uid` fallback in the backend `authenticate` middleware.

---

## 13. Token Storage Behavior

### Persistent Storage Audit

| Storage Type | Inspected in Frontend Codebase | Status |
| :--- | :--- | :--- |
| **AsyncStorage** (`@react-native-async-storage/async-storage`) | Checked `app/package.json` and imports | **NOT INSTALLED / NOT USED** |
| **SecureStore** (`expo-secure-store`) | Checked `app/package.json` and imports | **NOT INSTALLED / NOT USED** |
| **localStorage** | Checked `app/` codebase | **NOT USED** |
| **Cookies** | Checked native mobile & fetch options | **NOT CAPTURED / NOT MANAGED** |
| **React State / Memory** | `AppContext.js` (`isAuthenticated`, `currentUser`) | **ONLY ACTIVE MECHANISM** |

### Does Authentication Survive App Restart?
**NO.**
- Upon closing and reopening the app, all React state resets.
- `isAuthenticated` reverts to `false`.
- `currentUser` reverts to `CURRENT_USER_PROFILE`.
- The user is returned to `LandingScreen.js`.
- Session persistence across restarts is **0% implemented** on mobile.

---

## 14. Security Mechanisms Currently Present

### Strengths in Current Backend:
1. **Password Security:** Bcrypt hashing with 10 salt rounds (`bcryptjs`). Plaintext passwords never stored.
2. **Serialized Document Scrubbing:** Mongoose `toJSON` transforms on `User`, `Session`, `EmailOTP`, and `PasswordReset` strip sensitive attributes (`passwordHash`, `refreshTokenHash`, `hashedOTP`, `tokenHash`, `__v`) before JSON serialization.
3. **Dual Token Design:** Short-lived access tokens (15m) paired with long-lived refresh tokens (7d).
4. **Token Isolation:** Access tokens and refresh tokens signed with separate cryptographic secrets (`JWT_SECRET` vs `REFRESH_TOKEN_SECRET`).
5. **Token Type Enforcement:** Middleware explicitly asserts `decoded.type === "access"`. Refresh endpoint asserts `decoded.type === "refresh"`.
6. **Refresh Token Reuse Detection:** Constant-time hash verification. If a previously rotated token is presented, all user sessions are immediately revoked to protect against session hijacking.
7. **Single-Use Enforcement:** OTPs and Password Reset tokens are permanently deleted immediately upon successful verification.
8. **Automated Database Cleanup:** MongoDB TTL indexes automatically purge expired documents from `EmailOTP` (10m), `PasswordReset` (15m), and `Session` (7d) collections.
9. **Brute Force Defense:** `express-rate-limit` limits login and forgot-password requests to 10 attempts per 15 minutes per IP.
10. **Email Enumeration Defense:** `POST /api/auth/forgot-password` returns an identical success message whether or not an account exists for the submitted email.
11. **Anti-XSS Defense:** Refresh tokens delivered in HTTP-only, secure (in production), SameSite-restricted cookies.

### Security Vulnerabilities / Gaps:
1. **Mobile Cookie Incompatibility:** The HTTP-only cookie-based refresh token cannot be read or stored by React Native without a dual-delivery mechanism.
2. **Header Fallback Bypass:** `backend/src/middleware/auth.js` line 19 allows requests with an `x-user-id` header to authenticate without any JWT token if `token` is missing. This was added as a development/test bridge, but represents an auth bypass if left open in production.
3. **No Frontend 401 Interception:** When access tokens expire, requests fail without transparent token refresh or redirection to login.
4. **Multi-User Data Leakage on Logout:** Frontend logout does not clear cached user data, projects, matches, chats, or notifications from React state.

---

## 15. What is Fully Working

### Backend (100% Verified):
- [x] User registration with email format validation and password complexity enforcement (`POST /api/auth/register`).
- [x] Cryptographic 6-digit OTP generation and bcrypt hash storage in MongoDB.
- [x] Responsive HTML email dispatch via Nodemailer & Gmail OAuth2 (`sendVerificationEmail`).
- [x] Email OTP verification (`POST /api/auth/verify-email`) marking account verified.
- [x] Verified user login with bcrypt password comparison (`POST /api/auth/login`).
- [x] Denial of unverified users on login (403 Forbidden).
- [x] Access token generation (15m JWT) and refresh token generation (7d JWT).
- [x] Session tracking in MongoDB with device metadata.
- [x] Refresh token rotation with reuse detection and automatic session revocation (`POST /api/auth/refresh`).
- [x] Single session logout (`POST /api/auth/logout`) and all-devices logout (`POST /api/auth/logout-all`).
- [x] Forgot password with anti-enumeration response and SHA-256 hashed reset token storage (`POST /api/auth/forgot-password`).
- [x] Reset password with single-use token consumption and global session revocation (`POST /api/auth/reset-password`).
- [x] Protected profile retrieval (`GET /api/auth/me`).
- [x] Brute-force rate limiting (`loginLimiter`).
- [x] 10/10 automated tests passing in `tests/auth.test.js`.

---

## 16. What is Partially Connected

- [!] **`authenticate` Middleware in Backend:**
  Working for JWT tokens, but currently contains a development bridge allowing `x-user-id` header when `Authorization: Bearer` is absent.
- [!] **`app/utils/api.js`:**
  All endpoints have parameter slots for `(token, userId)` and manually construct `Authorization: Bearer ${token}`, but have no centralized or automated token injection.
- [!] **`LandingScreen.js` Flow:**
  The visual UI for Landing, Login, Signup, and OTP entry exists and has Pop Art comic styling, but functions entirely with simulated local state and mock timer.
- [!] **Logout Trigger:**
  Logout buttons exist in `ProfileScreen.js` and successfully trigger navigation back to `'landing'`, but do not call the backend or clean up state.

---

## 17. What is Missing

### Frontend Missing Functionality:
1. **API Client Auth Methods (`app/utils/api.js`):**
   - `loginApi(email, password)`
   - `registerApi({ name, email, password })`
   - `verifyEmailApi({ email, otp })`
   - `refreshTokenApi(refreshToken)`
   - `logoutApi()`
   - `forgotPasswordApi(email)`
   - `resetPasswordApi(token, newPassword)`
   - `getMeApi(token)`
2. **Centralized Token & Auth Handling in `api.js`:**
   - Automatic attachment of `Authorization: Bearer <token>` to all protected requests.
   - Interception of `401 Unauthorized` responses.
   - Automatic token refresh queue & retry of failed requests.
3. **Mobile Token Storage:**
   - Integration of a secure persistent storage solution (e.g. `AsyncStorage` or `SecureStore`) to persist tokens across app restarts.
   - Session restoration logic on app launch (`restoreSession`).
4. **Backend-Connected Auth in `AppContext.js`:**
   - Real `login` calling backend API and storing access/refresh tokens.
   - Real `register` calling backend API and advancing to OTP verification.
   - Real `verifyEmail` calling backend API and advancing to authenticated state.
   - Real `logout` calling backend API, clearing tokens, and wiping all user-specific state.
5. **Forgot & Reset Password Screens:**
   - Forgot Password modal / view in `LandingScreen.js` (currently just an `alert`).
   - Reset Password screen or deep-link handler.
6. **Multi-User State Cleanup:**
   - Complete reset of projects, matches, invitations, chats, and notifications upon logout.
7. **Backend Dual-Refresh Support:**
   - Backend `POST /api/auth/refresh` currently reads **only** cookies. Must also accept refresh token in request body or header for React Native mobile compatibility.

---

## 18. Exact Recommended Order for Auth 12B Onward

To keep changes clean, modular, and adhering strictly to the Simplicity Rule, the recommended progression is:

### **AUTH 12B: Core Auth API Client & Backend Dual-Refresh Bridge**
- Add missing auth endpoints to `app/utils/api.js` (`loginApi`, `registerApi`, `verifyEmailApi`, `logoutApi`, `forgotPasswordApi`, `resetPasswordApi`, `getMeApi`).
- Update backend `POST /api/auth/refresh` and `POST /api/auth/logout` to support **both** HTTP-only cookies (web) and JSON body/header refresh tokens (mobile).
- Verify backend tests still pass 100%.

### **AUTH 12C: Token Storage & Session Restoration**
- Add lightweight persistent storage for tokens and user metadata.
- Implement `restoreSession()` on app startup in `AppContext.js`.
- Add automatic `Authorization: Bearer <token>` attachment and 401 token refresh queue in `app/utils/api.js`.

### **AUTH 12D: Connect Frontend Screens to Real Auth Flow**
- Connect `LandingScreen.js` Login form to `loginApi`.
- Connect Signup form to `registerApi`.
- Connect OTP screen to `verifyEmailApi`.
- Add Forgot Password modal to `LandingScreen.js` connected to `forgotPasswordApi`.
- Add Reset Password screen or modal connected to `resetPasswordApi`.

### **AUTH 12E: Multi-User Cleanup, Logout Invalidation & Security Hardening**
- Implement complete state wiping on logout in `AppContext.js` (projects, matches, invitations, chats, notifications).
- Ensure backend session is revoked in MongoDB on logout.
- Remove or restrict the development `x-user-id` auth header fallback in `backend/src/middleware/auth.js`.
- Run end-to-end multi-user login/logout regression tests.
