import express from "express";
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

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true, // Allow cookies to be sent across origins
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to DevDate API" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/matching", matchingRoutes);
app.use("/api/chat", chatRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;