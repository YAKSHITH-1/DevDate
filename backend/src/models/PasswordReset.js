import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required for a password reset request"],
      index: true,
    },
    tokenHash: {
      type: String,
      required: [true, "Token hash is required"],
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required"],
      // MongoDB TTL Index: Automatically cleans up expired reset tokens
      index: { expires: 0 },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Security: Strip tokenHash and __v when converted to JSON
passwordResetSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.tokenHash;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("PasswordReset", passwordResetSchema);
