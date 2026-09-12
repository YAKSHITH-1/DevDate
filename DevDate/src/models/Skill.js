import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name is required"],
      unique: true,
      trim: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    categories: {
      type: [String],
      required: [true, "At least one category is required"],
      validate: {
        validator: (val) => Array.isArray(val) && val.length > 0,
        message: "Categories must contain at least one category",
      },
    },
  },
  {
    timestamps: true,
  }
);

skillSchema.index({ categories: 1 });
skillSchema.index({ aliases: 1 });

export default mongoose.model("Skill", skillSchema);
