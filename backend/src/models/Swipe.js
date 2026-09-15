import mongoose from "mongoose";

const swipeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    action: {
      type: String,
      enum: ["PASS", "INTERESTED"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

swipeSchema.index(
  { user: 1, project: 1 },
  { unique: true }
);

export default mongoose.model("Swipe", swipeSchema);