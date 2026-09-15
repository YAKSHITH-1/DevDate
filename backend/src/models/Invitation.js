import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },

    developerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Developer ID is required"],
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender ID is required"],
    },

    message: {
      type: String,
      trim: true,
      maxlength: [500, "Invitation message cannot exceed 500 characters"],
      default: "",
    },

    status: {
      type: String,
      enum: {
        values: ["Pending", "Accepted", "Rejected", "Withdrawn"],
        message: "{VALUE} is not a valid invitation status",
      },
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query performance and status tracking
invitationSchema.index({ projectId: 1, developerId: 1, status: 1 });
invitationSchema.index({ developerId: 1, status: 1, createdAt: -1 });
invitationSchema.index({ senderId: 1, status: 1, createdAt: -1 });
invitationSchema.index({ projectId: 1, status: 1 });

export default mongoose.model("Invitation", invitationSchema);
