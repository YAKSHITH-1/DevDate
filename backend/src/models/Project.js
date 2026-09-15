import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    requiredSkills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],

    interests: {
      type: [String],
      default: [],
    },

    requiredRoles: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      trim: true,
    },

    duration: {
      type: String,
    },

    teamSize: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
    },

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    image: {
      type: String,
    },

    status: {
      type: String,
      enum: ["OPEN", "CLOSED"],
      default: "OPEN",
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ status: 1, lastActivityAt: -1 });
projectSchema.index({ owner: 1, status: 1 });

export default mongoose.model("Project", projectSchema);