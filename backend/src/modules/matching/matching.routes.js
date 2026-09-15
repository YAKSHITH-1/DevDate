import { Router } from "express";
import {
  getPendingInvitations,
  approveInvitation,
  rejectInvitation,
} from "./matching.controller.js";
import { matchIdParamValidation } from "./matching.validation.js";
import { validate } from "../../middleware/validate.js";
import { optionalAuthenticate } from "../../middleware/auth.js";

const router = Router();

// Apply auth middleware
router.use(optionalAuthenticate);

// 1. Fetch pending invitations for authenticated developer
router.get("/invitations", getPendingInvitations);
router.get("/pending", getPendingInvitations);
router.get("/", getPendingInvitations);

// 2. Approve invitation (Accept match and unlock chat) - Supports PATCH & POST with both /accept and /approve
router.patch("/invitations/:id/accept", validate(matchIdParamValidation), approveInvitation);
router.post("/invitations/:id/accept", validate(matchIdParamValidation), approveInvitation);
router.patch("/invitations/:id/approve", validate(matchIdParamValidation), approveInvitation);
router.post("/invitations/:id/approve", validate(matchIdParamValidation), approveInvitation);
router.patch("/:id/accept", validate(matchIdParamValidation), approveInvitation);
router.post("/:id/accept", validate(matchIdParamValidation), approveInvitation);
router.patch("/:id/approve", validate(matchIdParamValidation), approveInvitation);
router.post("/:id/approve", validate(matchIdParamValidation), approveInvitation);

// 3. Reject invitation - Supports PATCH & POST
router.patch("/invitations/:id/reject", validate(matchIdParamValidation), rejectInvitation);
router.post("/invitations/:id/reject", validate(matchIdParamValidation), rejectInvitation);
router.patch("/:id/reject", validate(matchIdParamValidation), rejectInvitation);
router.post("/:id/reject", validate(matchIdParamValidation), rejectInvitation);

export default router;
