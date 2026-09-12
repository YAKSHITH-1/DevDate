import mongoose from "mongoose";
import Skill from "../models/Skill.js";
import { MONGO_URI } from "../config/env.js";

export const SKILL_CATEGORIES = [
  "Full Stack Development",
  "AI / Machine Learning",
  "Frontend Development",
  "Backend Development",
  "Mobile Development",
  "Data Science",
  "Database",
  "Cloud / DevOps",
  "Cybersecurity",
  "Blockchain / Web3",
  "Game Development",
  "Testing / QA",
  "UI/UX",
  "Programming Languages",
  "Developer Tools",
];

export const SKILLS_SEED_DATA = [
  // Full Stack & Frontend & Languages
  {
    name: "JavaScript",
    aliases: ["JS", "Javascript", "Vanilla JS", "ECMAScript"],
    categories: ["Full Stack Development", "Frontend Development", "Programming Languages"],
  },
  {
    name: "TypeScript",
    aliases: ["TS", "Typescript"],
    categories: ["Full Stack Development", "Frontend Development", "Backend Development", "Programming Languages"],
  },
  {
    name: "HTML",
    aliases: ["HTML5", "HyperText Markup Language"],
    categories: ["Full Stack Development", "Frontend Development"],
  },
  {
    name: "CSS",
    aliases: ["CSS3", "Cascading Style Sheets"],
    categories: ["Full Stack Development", "Frontend Development"],
  },
  {
    name: "React",
    aliases: ["React.js", "ReactJS"],
    categories: ["Full Stack Development", "Frontend Development"],
  },
  {
    name: "Next.js",
    aliases: ["NextJS", "Next", "Next.js 14", "Next.js 15"],
    categories: ["Full Stack Development", "Frontend Development", "Backend Development"],
  },
  {
    name: "Vue.js",
    aliases: ["Vue", "VueJS", "Vue 3"],
    categories: ["Frontend Development"],
  },
  {
    name: "Angular",
    aliases: ["AngularJS", "Angular 2+", "Angular.js"],
    categories: ["Frontend Development"],
  },
  {
    name: "Svelte",
    aliases: ["SvelteKit", "SvelteJS"],
    categories: ["Frontend Development"],
  },
  {
    name: "Tailwind CSS",
    aliases: ["Tailwind", "TailwindCSS"],
    categories: ["Frontend Development", "UI/UX"],
  },
  {
    name: "Bootstrap",
    aliases: ["Bootstrap 5", "Twitter Bootstrap"],
    categories: ["Frontend Development"],
  },
  {
    name: "Redux",
    aliases: ["Redux Toolkit", "RTK"],
    categories: ["Frontend Development"],
  },
  {
    name: "Sass",
    aliases: ["SCSS", "SASS"],
    categories: ["Frontend Development"],
  },
  {
    name: "Webpack",
    aliases: ["Webpack 5"],
    categories: ["Frontend Development", "Developer Tools"],
  },
  {
    name: "Vite",
    aliases: ["ViteJS"],
    categories: ["Frontend Development", "Developer Tools"],
  },

  // Backend & Languages
  {
    name: "Node.js",
    aliases: ["Node", "NodeJS", "Node js"],
    categories: ["Full Stack Development", "Backend Development"],
  },
  {
    name: "Express.js",
    aliases: ["Express", "ExpressJS"],
    categories: ["Full Stack Development", "Backend Development"],
  },
  {
    name: "NestJS",
    aliases: ["Nest.js", "Nest"],
    categories: ["Backend Development"],
  },
  {
    name: "FastAPI",
    aliases: ["Fast API", "FastAPI Python"],
    categories: ["Backend Development", "AI / Machine Learning"],
  },
  {
    name: "Django",
    aliases: ["Django REST Framework", "DRF"],
    categories: ["Backend Development"],
  },
  {
    name: "Flask",
    aliases: ["Flask Python"],
    categories: ["Backend Development"],
  },
  {
    name: "Spring Boot",
    aliases: ["SpringBoot", "Spring Framework", "Spring"],
    categories: ["Backend Development"],
  },
  {
    name: "Java",
    aliases: ["Core Java", "Java 8", "Java 17", "Java 21"],
    categories: ["Backend Development", "Mobile Development", "Programming Languages"],
  },
  {
    name: "Python",
    aliases: ["Py", "Python 3", "Python3"],
    categories: ["AI / Machine Learning", "Backend Development", "Data Science", "Programming Languages"],
  },
  {
    name: "Go",
    aliases: ["Golang", "Go Language"],
    categories: ["Backend Development", "Cloud / DevOps", "Programming Languages"],
  },
  {
    name: "Rust",
    aliases: ["Rustlang", "Rust-lang"],
    categories: ["Backend Development", "Blockchain / Web3", "Programming Languages"],
  },
  {
    name: "C#",
    aliases: ["CSharp", "C Sharp", "C#.NET"],
    categories: ["Backend Development", "Game Development", "Programming Languages"],
  },
  {
    name: ".NET",
    aliases: [".NET Core", "DotNet", "ASP.NET", "ASP.NET Core"],
    categories: ["Backend Development"],
  },
  {
    name: "PHP",
    aliases: ["PHP 8", "PHP7"],
    categories: ["Backend Development", "Programming Languages"],
  },
  {
    name: "Laravel",
    aliases: ["Laravel Framework"],
    categories: ["Backend Development"],
  },
  {
    name: "Ruby",
    aliases: ["Ruby on Rails", "Rails", "RoR"],
    categories: ["Backend Development", "Programming Languages"],
  },
  {
    name: "C",
    aliases: ["C Language", "ANSI C"],
    categories: ["Programming Languages"],
  },
  {
    name: "C++",
    aliases: ["CPP", "C Plus Plus", "Cpp"],
    categories: ["Game Development", "Programming Languages"],
  },
  {
    name: "Kotlin",
    aliases: ["Kotlin Android"],
    categories: ["Mobile Development", "Programming Languages"],
  },
  {
    name: "Swift",
    aliases: ["Swift Apple", "Swift iOS"],
    categories: ["Mobile Development", "Programming Languages"],
  },
  {
    name: "Dart",
    aliases: ["Dart Language"],
    categories: ["Mobile Development", "Programming Languages"],
  },
  {
    name: "R",
    aliases: ["R Language", "R Programming", "RStats"],
    categories: ["Data Science", "Programming Languages"],
  },
  {
    name: "Scala",
    aliases: ["Scala Language"],
    categories: ["Backend Development", "Data Science", "Programming Languages"],
  },
  {
    name: "Elixir",
    aliases: ["Elixir Phoenix"],
    categories: ["Backend Development", "Programming Languages"],
  },

  // Mobile Development
  {
    name: "React Native",
    aliases: ["RN", "ReactNative"],
    categories: ["Mobile Development"],
  },
  {
    name: "Flutter",
    aliases: ["Flutter SDK"],
    categories: ["Mobile Development"],
  },
  {
    name: "SwiftUI",
    aliases: ["Swift UI"],
    categories: ["Mobile Development"],
  },
  {
    name: "Jetpack Compose",
    aliases: ["Compose", "Android Compose"],
    categories: ["Mobile Development"],
  },
  {
    name: "Android",
    aliases: ["Android SDK", "Android Native", "Android Development"],
    categories: ["Mobile Development"],
  },
  {
    name: "iOS",
    aliases: ["iOS Development", "iOS Native"],
    categories: ["Mobile Development"],
  },
  {
    name: "Ionic",
    aliases: ["Ionic Framework"],
    categories: ["Mobile Development"],
  },

  // Database
  {
    name: "MongoDB",
    aliases: ["Mongo", "MongoDB Atlas"],
    categories: ["Full Stack Development", "Database"],
  },
  {
    name: "PostgreSQL",
    aliases: ["Postgres", "PG", "Postgre"],
    categories: ["Full Stack Development", "Database"],
  },
  {
    name: "MySQL",
    aliases: ["My SQL"],
    categories: ["Database"],
  },
  {
    name: "Redis",
    aliases: ["Redis Cache", "In-Memory DB"],
    categories: ["Database", "Backend Development"],
  },
  {
    name: "SQLite",
    aliases: ["Sqlite3"],
    categories: ["Database", "Mobile Development"],
  },
  {
    name: "Firebase",
    aliases: ["Firestore", "Firebase Realtime DB"],
    categories: ["Database", "Mobile Development", "Cloud / DevOps"],
  },
  {
    name: "Supabase",
    aliases: ["Supabase DB"],
    categories: ["Database", "Backend Development"],
  },
  {
    name: "Cassandra",
    aliases: ["Apache Cassandra"],
    categories: ["Database"],
  },
  {
    name: "MariaDB",
    aliases: ["Maria DB"],
    categories: ["Database"],
  },
  {
    name: "Oracle",
    aliases: ["Oracle DB", "Oracle Database"],
    categories: ["Database"],
  },
  {
    name: "SQL",
    aliases: ["Structured Query Language", "ANSI SQL"],
    categories: ["Database"],
  },
  {
    name: "Prisma",
    aliases: ["Prisma ORM"],
    categories: ["Backend Development", "Database"],
  },
  {
    name: "GraphQL",
    aliases: ["GQL", "Apollo GraphQL"],
    categories: ["Full Stack Development", "Backend Development", "Frontend Development"],
  },
  {
    name: "REST API",
    aliases: ["REST", "RESTful", "RESTful APIs", "REST APIs"],
    categories: ["Full Stack Development", "Backend Development"],
  },
  {
    name: "gRPC",
    aliases: ["Protobuf", "Protocol Buffers"],
    categories: ["Backend Development"],
  },

  // Cloud / DevOps
  {
    name: "Docker",
    aliases: ["Docker Container", "Docker Compose"],
    categories: ["Full Stack Development", "Cloud / DevOps"],
  },
  {
    name: "Kubernetes",
    aliases: ["K8s", "K8", "Kube"],
    categories: ["Cloud / DevOps"],
  },
  {
    name: "AWS",
    aliases: ["Amazon Web Services", "Amazon AWS", "EC2", "S3", "Lambda"],
    categories: ["Cloud / DevOps"],
  },
  {
    name: "Google Cloud",
    aliases: ["GCP", "Google Cloud Platform"],
    categories: ["Cloud / DevOps"],
  },
  {
    name: "Azure",
    aliases: ["Microsoft Azure", "MS Azure"],
    categories: ["Cloud / DevOps"],
  },
  {
    name: "Terraform",
    aliases: ["HashiCorp Terraform", "IaC"],
    categories: ["Cloud / DevOps"],
  },
  {
    name: "Jenkins",
    aliases: ["Jenkins CI"],
    categories: ["Cloud / DevOps"],
  },
  {
    name: "GitHub Actions",
    aliases: ["GHA", "Github Workflows"],
    categories: ["Cloud / DevOps", "Developer Tools"],
  },
  {
    name: "GitLab CI",
    aliases: ["GitLab CI/CD"],
    categories: ["Cloud / DevOps"],
  },
  {
    name: "Nginx",
    aliases: ["NGINX", "Nginx Server"],
    categories: ["Cloud / DevOps", "Backend Development"],
  },
  {
    name: "Linux",
    aliases: ["GNU/Linux", "Ubuntu", "Debian", "CentOS", "Bash", "Shell"],
    categories: ["Cloud / DevOps", "Developer Tools"],
  },
  {
    name: "CI/CD",
    aliases: ["Continuous Integration", "Continuous Deployment", "Pipelines"],
    categories: ["Cloud / DevOps"],
  },
  {
    name: "Ansible",
    aliases: ["Red Hat Ansible"],
    categories: ["Cloud / DevOps"],
  },

  // AI / Machine Learning & Data Science
  {
    name: "NumPy",
    aliases: ["Numpy"],
    categories: ["AI / Machine Learning", "Data Science"],
  },
  {
    name: "Pandas",
    aliases: ["Pandas Dataframe"],
    categories: ["AI / Machine Learning", "Data Science"],
  },
  {
    name: "Scikit-learn",
    aliases: ["Sklearn", "Scikit Learn"],
    categories: ["AI / Machine Learning", "Data Science"],
  },
  {
    name: "TensorFlow",
    aliases: ["TF", "Tensorflow"],
    categories: ["AI / Machine Learning", "Data Science"],
  },
  {
    name: "PyTorch",
    aliases: ["Torch", "Pytorch"],
    categories: ["AI / Machine Learning", "Data Science"],
  },
  {
    name: "Keras",
    aliases: ["Keras API"],
    categories: ["AI / Machine Learning"],
  },
  {
    name: "OpenCV",
    aliases: ["Computer Vision", "CV"],
    categories: ["AI / Machine Learning"],
  },
  {
    name: "NLP",
    aliases: ["Natural Language Processing", "Text Processing"],
    categories: ["AI / Machine Learning"],
  },
  {
    name: "Transformers",
    aliases: ["HuggingFace Transformers", "BERT", "GPT"],
    categories: ["AI / Machine Learning"],
  },
  {
    name: "Hugging Face",
    aliases: ["HuggingFace", "HF"],
    categories: ["AI / Machine Learning"],
  },
  {
    name: "LangChain",
    aliases: ["Langchain", "LLM Chains"],
    categories: ["AI / Machine Learning"],
  },
  {
    name: "MLflow",
    aliases: ["ML Flow"],
    categories: ["AI / Machine Learning", "Cloud / DevOps"],
  },
  {
    name: "LlamaIndex",
    aliases: ["Llama Index", "GPT Index"],
    categories: ["AI / Machine Learning"],
  },
  {
    name: "Apache Spark",
    aliases: ["Spark", "PySpark"],
    categories: ["Data Science"],
  },
  {
    name: "Tableau",
    aliases: ["Tableau BI"],
    categories: ["Data Science"],
  },
  {
    name: "Power BI",
    aliases: ["PowerBI", "Microsoft Power BI"],
    categories: ["Data Science"],
  },
  {
    name: "Matplotlib",
    aliases: ["Pyplot"],
    categories: ["Data Science"],
  },
  {
    name: "Seaborn",
    aliases: ["SNS"],
    categories: ["Data Science"],
  },

  // Cybersecurity
  {
    name: "Network Security",
    aliases: ["NetSec", "Firewalls"],
    categories: ["Cybersecurity"],
  },
  {
    name: "Ethical Hacking",
    aliases: ["White Hat Hacking", "Hacking"],
    categories: ["Cybersecurity"],
  },
  {
    name: "Penetration Testing",
    aliases: ["Pen Testing", "Pentest", "Pentesting"],
    categories: ["Cybersecurity"],
  },
  {
    name: "OWASP",
    aliases: ["OWASP Top 10", "Web Security"],
    categories: ["Cybersecurity"],
  },
  {
    name: "Kali Linux",
    aliases: ["Kali"],
    categories: ["Cybersecurity"],
  },
  {
    name: "Burp Suite",
    aliases: ["Burp", "BurpSuite"],
    categories: ["Cybersecurity"],
  },
  {
    name: "Cryptography",
    aliases: ["Crypto", "Encryption", "PKI"],
    categories: ["Cybersecurity", "Blockchain / Web3"],
  },
  {
    name: "Cybersecurity",
    aliases: ["InfoSec", "Information Security"],
    categories: ["Cybersecurity"],
  },
  {
    name: "SIEM",
    aliases: ["Security Information and Event Management", "Splunk"],
    categories: ["Cybersecurity"],
  },
  {
    name: "Vulnerability Assessment",
    aliases: ["VAPT", "Vulnerability Scanning"],
    categories: ["Cybersecurity"],
  },

  // Blockchain / Web3
  {
    name: "Solidity",
    aliases: ["Solidity Smart Contracts"],
    categories: ["Blockchain / Web3"],
  },
  {
    name: "Ethereum",
    aliases: ["ETH", "EVM"],
    categories: ["Blockchain / Web3"],
  },
  {
    name: "Web3.js",
    aliases: ["Web3", "Web3JS"],
    categories: ["Blockchain / Web3"],
  },
  {
    name: "Ethers.js",
    aliases: ["Ethers", "EthersJS"],
    categories: ["Blockchain / Web3"],
  },
  {
    name: "Hardhat",
    aliases: ["Hardhat Dev"],
    categories: ["Blockchain / Web3", "Developer Tools"],
  },
  {
    name: "Smart Contracts",
    aliases: ["Smart Contract Development"],
    categories: ["Blockchain / Web3"],
  },
  {
    name: "DeFi",
    aliases: ["Decentralized Finance"],
    categories: ["Blockchain / Web3"],
  },
  {
    name: "NFT",
    aliases: ["Non-Fungible Token", "ERC-721", "ERC-1155"],
    categories: ["Blockchain / Web3"],
  },
  {
    name: "Solana",
    aliases: ["SOL", "Anchor"],
    categories: ["Blockchain / Web3"],
  },

  // Game Development
  {
    name: "Unity",
    aliases: ["Unity 3D", "Unity Engine"],
    categories: ["Game Development"],
  },
  {
    name: "Unreal Engine",
    aliases: ["UE4", "UE5", "Unreal"],
    categories: ["Game Development"],
  },
  {
    name: "Godot",
    aliases: ["Godot Engine"],
    categories: ["Game Development"],
  },
  {
    name: "Game Design",
    aliases: ["Game Mechanics", "Level Design"],
    categories: ["Game Development"],
  },
  {
    name: "2D Game Development",
    aliases: ["2D Games"],
    categories: ["Game Development"],
  },
  {
    name: "3D Game Development",
    aliases: ["3D Games"],
    categories: ["Game Development"],
  },
  {
    name: "Blender",
    aliases: ["Blender 3D", "3D Modeling"],
    categories: ["Game Development", "UI/UX"],
  },
  {
    name: "OpenGL",
    aliases: ["GL", "WebGL"],
    categories: ["Game Development", "Frontend Development"],
  },

  // Testing / QA
  {
    name: "Jest",
    aliases: ["JestJS"],
    categories: ["Testing / QA"],
  },
  {
    name: "Mocha",
    aliases: ["MochaJS", "Chai"],
    categories: ["Testing / QA"],
  },
  {
    name: "Cypress",
    aliases: ["Cypress.io", "Cypress E2E"],
    categories: ["Testing / QA"],
  },
  {
    name: "Selenium",
    aliases: ["Selenium WebDriver"],
    categories: ["Testing / QA"],
  },
  {
    name: "Playwright",
    aliases: ["Playwright Test"],
    categories: ["Testing / QA"],
  },
  {
    name: "Postman",
    aliases: ["Postman API"],
    categories: ["Testing / QA", "Developer Tools"],
  },
  {
    name: "API Testing",
    aliases: ["REST Testing", "Endpoint Testing"],
    categories: ["Testing / QA"],
  },
  {
    name: "Unit Testing",
    aliases: ["Unit Tests", "TDD"],
    categories: ["Testing / QA"],
  },
  {
    name: "Integration Testing",
    aliases: ["Integration Tests"],
    categories: ["Testing / QA"],
  },
  {
    name: "End-to-End Testing",
    aliases: ["E2E Testing", "E2E"],
    categories: ["Testing / QA"],
  },

  // UI/UX
  {
    name: "Figma",
    aliases: ["Figma Design"],
    categories: ["UI/UX", "Developer Tools"],
  },
  {
    name: "Adobe XD",
    aliases: ["XD"],
    categories: ["UI/UX"],
  },
  {
    name: "Wireframing",
    aliases: ["Wireframes", "Balsamiq"],
    categories: ["UI/UX"],
  },
  {
    name: "Prototyping",
    aliases: ["Interactive Prototypes", "Prototypes"],
    categories: ["UI/UX"],
  },
  {
    name: "User Research",
    aliases: ["UX Research", "Usability Testing"],
    categories: ["UI/UX"],
  },
  {
    name: "UX Design",
    aliases: ["User Experience Design", "UX"],
    categories: ["UI/UX"],
  },
  {
    name: "UI Design",
    aliases: ["User Interface Design", "UI"],
    categories: ["UI/UX"],
  },
  {
    name: "Design Systems",
    aliases: ["Design Tokens", "Component Library"],
    categories: ["UI/UX", "Frontend Development"],
  },

  // Developer Tools
  {
    name: "Git",
    aliases: ["Git SCM", "Version Control"],
    categories: ["Full Stack Development", "Developer Tools"],
  },
  {
    name: "GitHub",
    aliases: ["GH", "Github"],
    categories: ["Developer Tools"],
  },
  {
    name: "GitLab",
    aliases: ["Gitlab"],
    categories: ["Developer Tools"],
  },
  {
    name: "Bitbucket",
    aliases: ["BitBucket"],
    categories: ["Developer Tools"],
  },
  {
    name: "VS Code",
    aliases: ["Visual Studio Code", "VSCode"],
    categories: ["Developer Tools"],
  },
  {
    name: "Jira",
    aliases: ["Jira Software", "Atlassian Jira"],
    categories: ["Developer Tools"],
  },
  {
    name: "npm",
    aliases: ["Node Package Manager", "NPM"],
    categories: ["Developer Tools"],
  },
  {
    name: "Yarn",
    aliases: ["Yarn Package Manager"],
    categories: ["Developer Tools"],
  },
  {
    name: "pnpm",
    aliases: ["PNPM"],
    categories: ["Developer Tools"],
  },
];

export const seedSkills = async () => {
  console.log("🌱 Starting Skill Seed Process...");

  const operations = SKILLS_SEED_DATA.map((skillData) => {
    const normalizedAliases = [
      ...new Set(
        (skillData.aliases || [])
          .map((a) => (typeof a === "string" ? a.trim() : ""))
          .filter(Boolean)
      ),
    ];

    const normalizedCategories = [
      ...new Set(
        (skillData.categories || [])
          .map((c) => (typeof c === "string" ? c.trim() : ""))
          .filter(Boolean)
      ),
    ];

    return {
      updateOne: {
        filter: { name: skillData.name.trim() },
        update: {
          $set: {
            name: skillData.name.trim(),
            aliases: normalizedAliases,
            categories: normalizedCategories,
          },
        },
        upsert: true,
      },
    };
  });

  const result = await Skill.bulkWrite(operations);
  const totalInDb = await Skill.countDocuments();
  console.log(`✅ Successfully seeded/synced skills. (Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}). Total skills in DB: ${totalInDb}`);

  // Category breakdown
  console.log("\n📊 Category Breakdown:");
  for (const category of SKILL_CATEGORIES) {
    const count = await Skill.countDocuments({ categories: category });
    console.log(`  - ${category}: ${count} skills`);
  }

  return totalInDb;
};

// Auto-run if executed directly via CLI
if (process.argv[1] && process.argv[1].endsWith("seedSkills.js")) {
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      console.log("Connected to MongoDB.");
      await seedSkills();
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB. Done!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Error seeding skills:", err);
      process.exit(1);
    });
}

export default seedSkills;
