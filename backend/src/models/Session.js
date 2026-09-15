import mongoose from "mongoose";
import crypto from "crypto";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required for a session"],
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: [true, "Refresh token hash is required"],
      index: true,
    },
    revoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "Session expiration date is required"],
      // MongoDB TTL Index: Automatically cleans up expired sessions
      index: { expires: 0 },
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    deviceInfo: {
      userAgent: {
        type: String,
        default: "",
      },
      ipAddress: {
        type: String,
        default: "",
      },
      deviceType: {
        type: String,
        default: "unknown",
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

// Constant-time comparison of incoming plain refresh token against stored SHA-256 hash
sessionSchema.methods.compareRefreshToken = function (candidateToken) {
  if (!candidateToken || !this.refreshTokenHash) return false;
  try {
    const candidateHash = crypto
      .createHash("sha256")
      .update(candidateToken)
      .digest("hex");
    
    const storedBuf = Buffer.from(this.refreshTokenHash, "hex");
    const candidateBuf = Buffer.from(candidateHash, "hex");

    if (storedBuf.length !== candidateBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(storedBuf, candidateBuf);
  } catch {
    return false;
  }
};

// Security: Strip refreshTokenHash and __v when serialized to JSON
sessionSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.refreshTokenHash;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("Session", sessionSchema);
