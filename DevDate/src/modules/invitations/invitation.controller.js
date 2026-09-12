import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import invitationService from "./invitation.service.js";

const getUserId = (req) => {
  if (req.user && req.user._id) return req.user._id.toString();
  if (req.headers["x-user-id"]) return req.headers["x-user-id"].toString();
  if (req.query.userId) return req.query.userId.toString();
  if (req.body.senderId) return req.body.senderId.toString();
  if (req.body.developerId && req.path.includes("received")) return req.body.developerId.toString();
  return null;
};

export const createInvitation = asyncHandler(async (req, res) => {
  const senderId = getUserId(req) || req.body.senderId;
  if (!senderId) {
    throw new ApiError(400, "Sender / Lead User ID is required");
  }

  const invitation = await invitationService.createInvitation(senderId, req.body);
  return res.status(201).json({
    success: true,
    message: "Invitation sent successfully",
    data: invitation,
  });
});

export const acceptInvitation = asyncHandler(async (req, res) => {
  const developerId = getUserId(req) || req.body.developerId;
  if (!developerId) {
    throw new ApiError(400, "Developer User ID is required");
  }

  const invitation = await invitationService.acceptInvitation(req.params.id, developerId);
  return res.status(200).json({
    success: true,
    message: "Invitation accepted successfully",
    data: invitation,
  });
});

export const rejectInvitation = asyncHandler(async (req, res) => {
  const developerId = getUserId(req) || req.body.developerId;
  if (!developerId) {
    throw new ApiError(400, "Developer User ID is required");
  }

  const invitation = await invitationService.rejectInvitation(req.params.id, developerId);
  return res.status(200).json({
    success: true,
    message: "Invitation rejected",
    data: invitation,
  });
});

export const withdrawInvitation = asyncHandler(async (req, res) => {
  const senderId = getUserId(req) || req.body.senderId;
  if (!senderId) {
    throw new ApiError(400, "Sender / Lead User ID is required");
  }

  const invitation = await invitationService.withdrawInvitation(req.params.id, senderId);
  return res.status(200).json({
    success: true,
    message: "Invitation withdrawn successfully",
    data: invitation,
  });
});

export const getProjectInvitations = asyncHandler(async (req, res) => {
  const invitations = await invitationService.getProjectInvitations(req.params.projectId);
  return res.status(200).json({
    success: true,
    data: invitations,
  });
});

export const getProjectInvitationStats = asyncHandler(async (req, res) => {
  const stats = await invitationService.getProjectInvitationStats(req.params.projectId);
  return res.status(200).json({
    success: true,
    data: stats,
  });
});

export const getReceivedInvitations = asyncHandler(async (req, res) => {
  const developerId = req.query.developerId || getUserId(req);
  if (!developerId) {
    throw new ApiError(400, "Developer User ID is required");
  }

  const invitations = await invitationService.getReceivedInvitations(developerId, req.query.status);
  return res.status(200).json({
    success: true,
    data: invitations,
  });
});

export const getSentInvitations = asyncHandler(async (req, res) => {
  const senderId = req.query.senderId || getUserId(req);
  if (!senderId) {
    throw new ApiError(400, "Sender User ID is required");
  }

  const invitations = await invitationService.getSentInvitations(senderId, req.query.status);
  return res.status(200).json({
    success: true,
    data: invitations,
  });
});

export const getInvitationById = asyncHandler(async (req, res) => {
  const invitation = await invitationService.getInvitationById(req.params.id);
  return res.status(200).json({
    success: true,
    data: invitation,
  });
});

export default {
  createInvitation,
  acceptInvitation,
  rejectInvitation,
  withdrawInvitation,
  getProjectInvitations,
  getProjectInvitationStats,
  getReceivedInvitations,
  getSentInvitations,
  getInvitationById,
};
