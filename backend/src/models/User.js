import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
      index: true,
    },

    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
    },

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },

    introduction: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      trim: true,
    },

    preferredRole: {
      type: String,
      trim: true,
    },

    experience: {
      type: String,
      trim: true,
    },

    availability: {
      type: String,
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    interests: {
      type: [String],
      default: [],
    },

    github: {
      type: String,
      trim: true,
    },

    linkedin: {
      type: String,
      trim: true,
    },

    portfolio: {
      type: String,
      trim: true,
    },

    avatar: {
      type: String,
    },

    location: {
      type: String,
      trim: true,
    },

    lookingTo: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compare candidate plain text password with stored bcrypt hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Security: Strip passwordHash and __v when converting user documents to JSON
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model("User", userSchema);