import mongoose from "mongoose";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import { MONGO_URI } from "../config/env.js";
import { seedSkills } from "./seedSkills.js";

const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const migrateProjectSkills = async () => {
  console.log("🔄 Starting Project Skills Migration...");

  // Ensure skills are seeded first
  const skillCount = await Skill.countDocuments();
  if (skillCount === 0) {
    console.log("No skills found in database. Running seed first...");
    await seedSkills();
  }

  // Find all projects using raw collection to access legacy fields
  const projectCollection = mongoose.connection.collection("projects");
  const rawProjects = await projectCollection.find({}).toArray();

  let migratedCount = 0;
  let alreadyUpToDate = 0;

  for (const rawProject of rawProjects) {
    // If project already has requiredSkills as ObjectId array, skip unless empty with legacy skills
    const hasRequiredSkills = Array.isArray(rawProject.requiredSkills) && rawProject.requiredSkills.length > 0;
    const hasLegacySkills = Array.isArray(rawProject.skills) && rawProject.skills.length > 0;

    if (hasRequiredSkills && !hasLegacySkills) {
      alreadyUpToDate++;
      continue;
    }

    const legacySkills = rawProject.skills || [];
    const matchedSkillIds = [];

    for (const skillStr of legacySkills) {
      if (typeof skillStr !== "string" || !skillStr.trim()) continue;

      const trimmed = skillStr.trim();
      const regex = new RegExp(`^${escapeRegex(trimmed)}$`, "i");

      let skillDoc = await Skill.findOne({
        $or: [{ name: regex }, { aliases: regex }],
      });

      if (!skillDoc) {
        // Create canonical skill if not found
        console.log(`⚠️ Skill '${trimmed}' not found in canonical DB. Creating custom skill entry...`);
        skillDoc = await Skill.create({
          name: trimmed,
          aliases: [],
          categories: ["Full Stack Development"],
        });
      }

      if (skillDoc && !matchedSkillIds.some((id) => id.equals(skillDoc._id))) {
        matchedSkillIds.push(skillDoc._id);
      }
    }

    // Update project with requiredSkills and remove legacy skills
    await projectCollection.updateOne(
      { _id: rawProject._id },
      {
        $set: {
          requiredSkills: matchedSkillIds.length > 0 ? matchedSkillIds : (rawProject.requiredSkills || []),
        },
        $unset: { skills: "" },
      }
    );

    migratedCount++;
    console.log(`✅ Migrated project '${rawProject.title}' (${rawProject._id}) with ${matchedSkillIds.length} requiredSkills.`);
  }

  console.log(`\n🎉 Migration Completed! Migrated: ${migratedCount}, Already up-to-date: ${alreadyUpToDate}`);
};

// Auto-run if executed directly via CLI
if (process.argv[1] && process.argv[1].endsWith("migrateProjectSkills.js")) {
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      console.log("Connected to MongoDB for migration.");
      await migrateProjectSkills();
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Migration failed with error:", err);
      process.exit(1);
    });
}

export default migrateProjectSkills;
