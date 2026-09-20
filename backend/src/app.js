import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes.js";
import projectRoutes from "./modules/projects/project.routes.js";
import skillRoutes from "./modules/skills/skill.routes.js";
import discoveryRoutes from "./modules/discovery/discovery.routes.js";
import invitationRoutes from "./modules/invitations/invitation.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import matchingRoutes from "./modules/matching/matching.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import errorHandler from "./middleware/errorHandler.js";

import path from "path";
import { fileURLToPath } from "url";
import { publicLimiter, userActionLimiter } from "./middleware/rateLimiter.js";
import { corsOptions } from "./config/cors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust reverse proxy (e.g. Render, Railway, Nginx, Ngrok) for accurate client IP resolution
app.set("trust proxy", 1);

// HTTP Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
        connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Production-hardened CORS
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Lightweight health check endpoints for external keep-alive / uptime monitoring (zero auth, minimal payload)
app.get(["/health", "/api/health"], (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Public landing & reset password views (protected by moderate public rate limiter)
app.get("/", publicLimiter, (req, res) => {
  res.json({ message: "Welcome to DevDate API" });
});

app.get("/reset-password", publicLimiter, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/reset-password.html"));
});

// Routes
// 1. Authentication endpoints (Strict per-IP and per-account with exponential backoff)
app.use("/api/auth", authRoutes);

// 2. Public read endpoints (Moderate public IP-based rate limiting)
app.use("/api/skills", publicLimiter, skillRoutes);

// 3. User action & collaboration endpoints (Looser user-based rate limiting)
app.use("/api/projects", userActionLimiter, projectRoutes);
app.use("/api/discovery", userActionLimiter, discoveryRoutes);
app.use("/api/invitations", userActionLimiter, invitationRoutes);
app.use("/api/notifications", userActionLimiter, notificationRoutes);
app.use("/api/matching", userActionLimiter, matchingRoutes);
app.use("/api/chat", userActionLimiter, chatRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;