import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const emailOTPSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    hashedOTP: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      // MongoDB TTL Index: Automatically removes documents once expiresAt timestamp is reached
      index: { expires: 0 },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compare candidate plain text OTP with stored bcrypt hash
emailOTPSchema.methods.compareOTP = async function (candidateOTP) {
  return bcrypt.compare(candidateOTP, this.hashedOTP);
};

// Security: Strip hashedOTP and __v when serialized to JSON
emailOTPSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.hashedOTP;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("EmailOTP", emailOTPSchema);
