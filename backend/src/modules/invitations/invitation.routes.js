import { Router } from "express";
import {
  createInvitation,
  acceptInvitation,
  rejectInvitation,
  withdrawInvitation,
  getProjectInvitations,
  getProjectInvitationStats,
  getReceivedInvitations,
  getSentInvitations,
  getInvitationById,
} from "./invitation.controller.js";
import {
  createInvitationValidation,
  invitationIdParamValidation,
  projectIdParamValidation,
} from "./invitation.validation.js";
import { validate } from "../../middleware/validate.js";
import { optionalAuthenticate } from "../../middleware/auth.js";

const router = Router();

router.use(optionalAuthenticate);

// 1. Create and send invitation
router.post("/", validate(createInvitationValidation), createInvitation);

// 2. Get received invitations (Developer matching portal)
router.get("/received", getReceivedInvitations);

// 3. Get sent invitations (Lead sent history across projects)
router.get("/sent", getSentInvitations);

// 4. Get invitations for a specific project
router.get("/project/:projectId", validate(projectIdParamValidation), getProjectInvitations);

// 5. Get invitation statistics for a project
router.get("/project/:projectId/stats", validate(projectIdParamValidation), getProjectInvitationStats);

// 6. Get single invitation by ID
router.get("/:id", validate(invitationIdParamValidation), getInvitationById);

// 7. Accept invitation (Developer action) - Supports PATCH & POST
router.patch("/:id/accept", validate(invitationIdParamValidation), acceptInvitation);
router.post("/:id/accept", validate(invitationIdParamValidation), acceptInvitation);

// 8. Reject invitation (Developer action) - Supports PATCH & POST
router.patch("/:id/reject", validate(invitationIdParamValidation), rejectInvitation);
router.post("/:id/reject", validate(invitationIdParamValidation), rejectInvitation);

// 9. Withdraw invitation (Lead action) - Supports PATCH & POST
router.patch("/:id/withdraw", validate(invitationIdParamValidation), withdrawInvitation);
router.post("/:id/withdraw", validate(invitationIdParamValidation), withdrawInvitation);

export default router;
