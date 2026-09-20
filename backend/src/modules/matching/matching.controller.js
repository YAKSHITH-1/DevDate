import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import matchingService from "./matching.service.js";
import { NODE_ENV } from "../../config/env.js";

const getUserId = (req) => {
  if (req.user && req.user._id) return req.user._id.toString();
  if (req.userId) return req.userId.toString();
  if ((process.env.NODE_ENV || NODE_ENV) !== "production") {
    if (req.headers["x-user-id"]) return req.headers["x-user-id"].toString();
    if (req.query.userId) return req.query.userId.toString();
  }
  return null;
};

/**
 * @desc    Get pending invitations for the authenticated developer
 * @route   GET /api/matching/invitations
 * @access  Private (Authenticated)
 */
export const getPendingInvitations = asyncHandler(async (req, res) => {
  const developerId = getUserId(req);
  if (!developerId) {
    throw new ApiError(401, "Developer authentication required");
  }

  const invitations = await matchingService.getPendingInvitations(developerId);

  return res.status(200).json({
    success: true,
    count: invitations.length,
    data: invitations,
  });
});

/**
 * @desc    Approve an invitation (Accept match and unlock chat)
 * @route   PATCH /api/matching/invitations/:id/accept
 * @access  Private (Authenticated Developer)
 */
export const approveInvitation = asyncHandler(async (req, res) => {
  const developerId = getUserId(req);
  if (!developerId) {
    throw new ApiError(401, "Developer authentication required");
  }

  const invitation = await matchingService.approveInvitation(req.params.id, developerId);

  return res.status(200).json({
    success: true,
    message: "Invitation accepted successfully. Chat is now unlocked.",
    data: invitation,
  });
});

/**
 * @desc    Reject an invitation
 * @route   PATCH /api/matching/invitations/:id/reject
 * @access  Private (Authenticated Developer)
 */
export const rejectInvitation = asyncHandler(async (req, res) => {
  const developerId = getUserId(req);
  if (!developerId) {
    throw new ApiError(401, "Developer authentication required");
  }

  const invitation = await matchingService.rejectInvitation(req.params.id, developerId);

  return res.status(200).json({
    success: true,
    message: "Invitation rejected successfully",
    data: invitation,
  });
});

export default {
  getPendingInvitations,
  approveInvitation,
  rejectInvitation,
};
