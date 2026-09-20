import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { MONGO_URI } from "../config/env.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Skill from "../models/Skill.js";
import Invitation from "../models/Invitation.js";
import Notification from "../models/Notification.js";
import { seedSkills } from "./seedSkills.js";

export const seedDevelopersAndProjects = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGO_URI);
      console.log("Connected to MongoDB for developer & project seeding.");
    }

    // 1. Ensure Skills are seeded first
    await seedSkills();

    // Map skill names to ObjectIds
    const allSkills = await Skill.find({});
    const skillMap = new Map();
    allSkills.forEach((s) => skillMap.set(s.name.toLowerCase(), s._id));

    const getSkillIds = (names) => {
      return names
        .map((n) => skillMap.get(n.toLowerCase()))
        .filter(Boolean);
    };

    const seedPassword = process.env.SEED_DEFAULT_PASSWORD || "password123";
    const defaultPassword = await bcrypt.hash(seedPassword, 10);

    // 2. Seed / Upsert Test Project Lead
    const leadData = {
      name: "Alex Chen (Project Lead)",
      email: "lead.alex@devdate.test",
      passwordHash: defaultPassword,
      role: "Project Lead / Senior Architect",
      preferredRole: "Project Lead",
      experience: "6+ years leading engineering teams",
      availability: "Full-time",
      bio: "Engineering Lead focused on building high-impact collaborative open source & edtech tools.",
      introduction: "Passionate about finding talented developers and pairing them with exciting projects.",
      skills: ["React", "Node.js", "System Design", "MongoDB", "Architecture"],
      interests: ["AI", "EdTech", "Open Source", "Scalability"],
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      github: "https://github.com/alexchen-devdate",
      linkedin: "https://linkedin.com/in/alexchen-devdate",
    };

    let leadUser = await User.findOne({ email: leadData.email });
    if (!leadUser) {
      leadUser = await User.create(leadData);
      console.log(`✅ Created test project lead: ${leadUser.name} (${leadUser._id})`);
    } else {
      Object.assign(leadUser, leadData);
      await leadUser.save();
      console.log(`✅ Synced test project lead: ${leadUser.name} (${leadUser._id})`);
    }

    // 3. Seed / Upsert Sample Developers
    const sampleDevelopers = [
      {
        name: "Sarah Connor",
        email: "sarah.connor@devdate.test",
        passwordHash: defaultPassword,
        role: "Frontend Developer",
        preferredRole: "Frontend Developer",
        experience: "4 years building responsive web apps",
        availability: "Immediate (Full-time)",
        skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Redux"],
        interests: ["Design Systems", "Web Performance", "Accessibility"],
        bio: "Frontend specialist passionate about intuitive UX, fluid animations, and crisp interfaces.",
        introduction: "I love crafting modern web apps with React, Next.js, and TypeScript. Ready for fast-paced collaboration.",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        github: "https://github.com/sarah-dev",
        linkedin: "https://linkedin.com/in/sarah-connor",
        portfolio: "https://sarahconnor.dev",
      },
      {
        name: "Elena Rostova",
        email: "elena.rostova@devdate.test",
        passwordHash: defaultPassword,
        role: "Backend Developer",
        preferredRole: "Backend Developer",
        experience: "3.5 years in scalable microservices",
        availability: "Full-time (Available now)",
        skills: ["Node.js", "Express.js", "MongoDB", "PostgreSQL", "Docker", "Redis"],
        interests: ["API Design", "Distributed Systems", "Cloud Security"],
        bio: "Backend engineer focused on high-throughput REST & GraphQL APIs, caching, and robust database models.",
        introduction: "Experienced with Node.js, Express, MongoDB, and Redis. Keen to build reliable backends.",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        github: "https://github.com/elena-backend",
        linkedin: "https://linkedin.com/in/elena-rostova",
        portfolio: "https://elenarostova.dev",
      },
      {
        name: "Marcus Vance",
        email: "marcus.vance@devdate.test",
        passwordHash: defaultPassword,
        role: "Full Stack Developer",
        preferredRole: "Full Stack Developer",
        experience: "5 years building end-to-end products",
        availability: "Part-time (20 hrs/week)",
        skills: ["React", "Node.js", "Python", "FastAPI", "MongoDB", "AWS"],
        interests: ["AI Integrations", "Fullstack Tooling", "DevOps"],
        bio: "Generalist engineer comfortable across the stack, from React components to cloud deployment.",
        introduction: "Versatile full stack developer ready to tackle complex challenges with React and Python/Node.",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        github: "https://github.com/marcusvance",
        linkedin: "https://linkedin.com/in/marcus-vance",
        portfolio: "https://marcusvance.io",
      },
      {
        name: "Aoi Tanaka",
        email: "aoi.tanaka@devdate.test",
        passwordHash: defaultPassword,
        role: "Mobile Developer & UI/UX",
        preferredRole: "Mobile Developer",
        experience: "3 years in cross-platform mobile apps",
        availability: "Part-time (15 hrs/week)",
        skills: ["React Native", "Flutter", "Figma", "TypeScript", "Firebase"],
        interests: ["Mobile UX", "Cross-Platform", "Animations"],
        bio: "Mobile app developer with a sharp eye for UI details and delightful mobile micro-interactions.",
        introduction: "Building smooth, cross-platform mobile experiences with React Native, Flutter, and Figma.",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
        github: "https://github.com/aoitanaka",
        linkedin: "https://linkedin.com/in/aoi-tanaka",
        portfolio: "https://aoitanaka.design",
      },
      {
        name: "Liam O'Connor",
        email: "liam.oconnor@devdate.test",
        passwordHash: defaultPassword,
        role: "DevOps & Cloud Engineer",
        preferredRole: "DevOps Engineer",
        experience: "4.5 years managing AWS & K8s pipelines",
        availability: "Flexible (10-20 hrs/week)",
        skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform"],
        interests: ["Cloud Infrastructure", "Automation", "Monitoring"],
        bio: "Infrastructure enthusiast dedicated to continuous integration, zero-downtime deployments, and cloud scalability.",
        introduction: "Passionate about streamlining build pipelines and containerized cloud platforms.",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        github: "https://github.com/liam-infra",
        linkedin: "https://linkedin.com/in/liam-oconnor",
      },
      {
        name: "Priya Sharma",
        email: "priya.sharma@devdate.test",
        passwordHash: defaultPassword,
        role: "AI & Machine Learning Engineer",
        preferredRole: "AI Engineer",
        experience: "3 years in applied LLMs & computer vision",
        availability: "Immediate (Full-time)",
        skills: ["Python", "PyTorch", "TensorFlow", "Pandas", "Scikit-Learn", "FastAPI"],
        interests: ["Generative AI", "NLP", "Machine Learning"],
        bio: "Data scientist and ML engineer turning complex machine learning research into practical production tools.",
        introduction: "Specialized in fine-tuning models, building RAG pipelines, and deploying fast ML APIs.",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        github: "https://github.com/priyasharma-ai",
        linkedin: "https://linkedin.com/in/priyasharma-ai",
        portfolio: "https://priyasharma.ai",
      },
      {
        name: "David Kim",
        email: "david.kim@devdate.test",
        passwordHash: defaultPassword,
        role: "Blockchain & Web3 Engineer",
        preferredRole: "Blockchain Developer",
        experience: "2.5 years in Smart Contracts & DeFi",
        availability: "Part-time (15 hrs/week)",
        skills: ["Solidity", "Ethereum", "Web3.js", "TypeScript", "React"],
        interests: ["DeFi", "Decentralized Identity", "Zero-Knowledge"],
        bio: "Smart contract developer focused on secure decentralized protocols and Web3 dApps.",
        introduction: "Writing auditable smart contracts and connecting them with modern React frontends.",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
        github: "https://github.com/davidkim-web3",
        linkedin: "https://linkedin.com/in/david-kim-web3",
      },
      {
        name: "Maya Patel",
        email: "maya.patel@devdate.test",
        passwordHash: defaultPassword,
        role: "Full Stack & Security Specialist",
        preferredRole: "Full Stack Developer",
        experience: "4 years in web applications & security",
        availability: "Immediate (Full-time)",
        skills: ["React", "Node.js", "Cybersecurity", "GraphQL", "MongoDB", "Express.js"],
        interests: ["Web Security", "GraphQL APIs", "Identity Management"],
        bio: "Full stack developer with a strong focus on secure authentication, GraphQL, and resilient architecture.",
        introduction: "Building fast, airtight web applications that scale seamlessly.",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        github: "https://github.com/mayapatel-sec",
        linkedin: "https://linkedin.com/in/maya-patel-sec",
      },
    ];

    // Batch fetch existing developers by email
    const devEmails = sampleDevelopers.map((d) => d.email);
    const existingUsers = await User.find({ email: { $in: devEmails } });
    const userMap = new Map();
    existingUsers.forEach((u) => userMap.set(u.email, u));

    const seededDevs = [];
    for (const dev of sampleDevelopers) {
      let user = userMap.get(dev.email);
      if (!user) {
        user = await User.create(dev);
        console.log(`  + Seeded developer: ${user.name} (${user.preferredRole})`);
      } else {
        Object.assign(user, dev);
        await user.save();
        console.log(`  ~ Synced developer: ${user.name}`);
      }
      seededDevs.push(user);
    }

    // 4. Seed / Upsert Projects for Test Lead
    const sampleProjects = [
      {
        title: "DevDate - Collaboration Matcher",
        description: "An intelligent discovery platform connecting project leaders with skilled developers through automated matching and rich invitations.",
        owner: leadUser._id,
        members: [leadUser._id],
        requiredSkills: getSkillIds(["React", "Node.js", "Express.js", "MongoDB"]),
        interests: ["EdTech", "Collaboration", "Open Source"],
        requiredRoles: ["Frontend Developer", "Backend Developer"],
        category: "Web Development",
        duration: "4-6 weeks",
        teamSize: { min: 2, max: 5 },
        status: "OPEN",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "AI Code Review & Mentor Assistant",
        description: "A real-time IDE extension and dashboard that reviews pull requests, explains algorithms, and suggests code optimizations using LLMs.",
        owner: leadUser._id,
        members: [leadUser._id],
        requiredSkills: getSkillIds(["Python", "FastAPI", "React", "TypeScript", "Docker"]),
        interests: ["Artificial Intelligence", "Developer Tools"],
        requiredRoles: ["AI Engineer", "Full Stack Developer"],
        category: "AI / Machine Learning",
        duration: "6-8 weeks",
        teamSize: { min: 2, max: 4 },
        status: "OPEN",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Campus Hub & Event Ticketing",
        description: "Cross-platform mobile application for university clubs to organize hackathons, workshops, and manage digital passes.",
        owner: leadUser._id,
        members: [leadUser._id],
        requiredSkills: getSkillIds(["React Native", "Node.js", "MongoDB", "Figma"]),
        interests: ["Mobile Development", "Community"],
        requiredRoles: ["Mobile Developer", "UI/UX"],
        category: "Mobile Development",
        duration: "3-5 weeks",
        teamSize: { min: 2, max: 4 },
        status: "OPEN",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80",
      },
    ];

    // Batch fetch existing projects by title and owner
    const projectTitles = sampleProjects.map((p) => p.title);
    const existingProjects = await Project.find({
      title: { $in: projectTitles },
      owner: leadUser._id,
    });
    const projectMap = new Map();
    existingProjects.forEach((p) => projectMap.set(p.title, p));

    const seededProjects = [];
    for (const proj of sampleProjects) {
      let project = projectMap.get(proj.title);
      if (!project) {
        project = await Project.create(proj);
        console.log(`  + Created project: "${project.title}"`);
      } else {
        Object.assign(project, proj);
        await project.save();
        console.log(`  ~ Synced project: "${project.title}"`);
      }
      seededProjects.push(project);
    }

    console.log("\n==========================================");
    console.log("✅ Developer & Project Seed Completed Successfully!");
    console.log(`   - Lead: ${leadUser.name} [ID: ${leadUser._id}]`);
    console.log(`   - Developers Seeded: ${seededDevs.length}`);
    console.log(`   - Projects Seeded: ${seededProjects.length}`);
    console.log("==========================================\n");

    return { leadUser, seededDevs, seededProjects };
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    throw err;
  }
};

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith("seedDevelopers.js")) {
  seedDevelopersAndProjects()
    .then(() => {
      mongoose.disconnect();
      process.exit(0);
    })
    .catch(() => {
      mongoose.disconnect();
      process.exit(1);
    });
}

export default seedDevelopersAndProjects;
