import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import invitationService from "./invitation.service.js";
import { NODE_ENV } from "../../config/env.js";

const getUserId = (req) => {
  if (req.user && req.user._id) return req.user._id.toString();
  if (req.userId) return req.userId.toString();
  if ((process.env.NODE_ENV || NODE_ENV) !== "production") {
    if (req.headers["x-user-id"]) return req.headers["x-user-id"].toString();
    if (req.query.userId) return req.query.userId.toString();
    if (req.body.senderId) return req.body.senderId.toString();
    if (req.body.developerId && req.path.includes("received")) return req.body.developerId.toString();
  }
  return null;
};

export const createInvitation = asyncHandler(async (req, res) => {
  const isNotProd = (process.env.NODE_ENV || NODE_ENV) !== "production";
  const senderId = getUserId(req) || (isNotProd ? req.body.senderId : null);
  if (!senderId) {
    throw new ApiError(401, "Authentication required to send invitation");
  }

  const invitation = await invitationService.createInvitation(senderId, req.body);
  return res.status(201).json({
    success: true,
    message: "Invitation sent successfully",
    data: invitation,
  });
});

export const acceptInvitation = asyncHandler(async (req, res) => {
  const isNotProd = (process.env.NODE_ENV || NODE_ENV) !== "production";
  const developerId = getUserId(req) || (isNotProd ? req.body.developerId : null);
  if (!developerId) {
    throw new ApiError(401, "Authentication required to accept invitation");
  }

  const invitation = await invitationService.acceptInvitation(req.params.id, developerId);
  return res.status(200).json({
    success: true,
    message: "Invitation accepted successfully",
    data: invitation,
  });
});

export const rejectInvitation = asyncHandler(async (req, res) => {
  const isNotProd = (process.env.NODE_ENV || NODE_ENV) !== "production";
  const developerId = getUserId(req) || (isNotProd ? req.body.developerId : null);
  if (!developerId) {
    throw new ApiError(401, "Authentication required to reject invitation");
  }

  const invitation = await invitationService.rejectInvitation(req.params.id, developerId);
  return res.status(200).json({
    success: true,
    message: "Invitation rejected",
    data: invitation,
  });
});

export const withdrawInvitation = asyncHandler(async (req, res) => {
  const isNotProd = (process.env.NODE_ENV || NODE_ENV) !== "production";
  const senderId = getUserId(req) || (isNotProd ? req.body.senderId : null);
  if (!senderId) {
    throw new ApiError(401, "Authentication required to withdraw invitation");
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
  const isNotProd = (process.env.NODE_ENV || NODE_ENV) !== "production";
  const developerId = getUserId(req) || (isNotProd ? req.query.developerId : null);
  if (!developerId) {
    throw new ApiError(401, "Authentication required to view received invitations");
  }

  const invitations = await invitationService.getReceivedInvitations(developerId, req.query.status);
  return res.status(200).json({
    success: true,
    data: invitations,
  });
});

export const getSentInvitations = asyncHandler(async (req, res) => {
  const isNotProd = (process.env.NODE_ENV || NODE_ENV) !== "production";
  const senderId = getUserId(req) || (isNotProd ? req.query.senderId : null);
  if (!senderId) {
    throw new ApiError(401, "Authentication required to view sent invitations");
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
