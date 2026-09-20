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

  // Batch-fetch all existing canonical skills into an in-memory lookup map
  const allSkills = await Skill.find({}).lean();
  const skillLookup = new Map();
  for (const s of allSkills) {
    skillLookup.set(s.name.toLowerCase(), s._id);
    if (Array.isArray(s.aliases)) {
      for (const a of s.aliases) {
        if (a && typeof a === "string") {
          skillLookup.set(a.toLowerCase(), s._id);
        }
      }
    }
  }

  // Find projects needing migration and gather all unique missing legacy skills
  const projectsToMigrate = [];
  const missingSkillNamesMap = new Map();

  for (const rawProject of rawProjects) {
    const hasRequiredSkills = Array.isArray(rawProject.requiredSkills) && rawProject.requiredSkills.length > 0;
    const hasLegacySkills = Array.isArray(rawProject.skills) && rawProject.skills.length > 0;

    if (hasRequiredSkills && !hasLegacySkills) {
      alreadyUpToDate++;
      continue;
    }

    projectsToMigrate.push(rawProject);

    const legacySkills = rawProject.skills || [];
    for (const skillStr of legacySkills) {
      if (typeof skillStr !== "string" || !skillStr.trim()) continue;
      const trimmed = skillStr.trim();
      const lower = trimmed.toLowerCase();
      if (!skillLookup.has(lower) && !missingSkillNamesMap.has(lower)) {
        missingSkillNamesMap.set(lower, trimmed);
      }
    }
  }

  // Bulk-create any missing canonical skills
  if (missingSkillNamesMap.size > 0) {
    const missingList = Array.from(missingSkillNamesMap.values());
    console.log(`⚠️ Creating ${missingList.length} custom canonical skill entries in batch...`);
    const newSkills = await Skill.insertMany(
      missingList.map((name) => ({
        name,
        aliases: [],
        categories: ["Full Stack Development"],
      }))
    );
    for (const doc of newSkills) {
      skillLookup.set(doc.name.toLowerCase(), doc._id);
    }
  }

  // Prepare bulkWrite operations for projects to execute all updates in one roundtrip
  const bulkOps = [];
  for (const rawProject of projectsToMigrate) {
    const legacySkills = rawProject.skills || [];
    const matchedSkillIds = [];
    const seenIdStrings = new Set();

    for (const skillStr of legacySkills) {
      if (typeof skillStr !== "string" || !skillStr.trim()) continue;
      const trimmed = skillStr.trim();
      const skillId = skillLookup.get(trimmed.toLowerCase());
      if (skillId && !seenIdStrings.has(skillId.toString())) {
        seenIdStrings.add(skillId.toString());
        matchedSkillIds.push(skillId);
      }
    }

    bulkOps.push({
      updateOne: {
        filter: { _id: rawProject._id },
        update: {
          $set: {
            requiredSkills: matchedSkillIds.length > 0 ? matchedSkillIds : (rawProject.requiredSkills || []),
          },
          $unset: { skills: "" },
        },
      },
    });

    migratedCount++;
    console.log(` Migrated project '${rawProject.title}' (${rawProject._id}) with ${matchedSkillIds.length} requiredSkills.`);
  }

  if (bulkOps.length > 0) {
    await projectCollection.bulkWrite(bulkOps);
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
