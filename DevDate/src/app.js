import express from "express";
import cors from "cors";
import projectRoutes from "./modules/projects/project.routes.js";
import skillRoutes from "./modules/skills/skill.routes.js";
import discoveryRoutes from "./modules/discovery/discovery.routes.js";
import invitationRoutes from "./modules/invitations/invitation.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to DevDate API" });
});

// Routes
app.use("/api/skills", skillRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/notifications", notificationRoutes);


// Global Error Handler
app.use(errorHandler);

export default app;