// DevDate — Canonical Skills Database
// 100+ predefined skills organized by category.
// Ensures "JS" and "JavaScript" always map to the same canonical skill.

export const SKILL_CATEGORIES = [
  {
    id: 'frontend',
    name: 'Frontend',
    icon: '🎨',
    skills: [
      { id: 'react', label: 'React', badge: { text: '⚛', bg: '#00D8FF', color: '#000' }, subtitle: 'FRONTEND • UI LIB' },
      { id: 'vue', label: 'Vue.js', badge: { text: 'V', bg: '#42B883', color: '#FFF' }, subtitle: 'FRONTEND • FRAMEWORK' },
      { id: 'angular', label: 'Angular', badge: { text: 'NG', bg: '#DD0031', color: '#FFF' }, subtitle: 'FRONTEND • MVC' },
      { id: 'nextjs', label: 'Next.js', badge: { text: 'N', bg: '#000000', color: '#FFF' }, subtitle: 'FRAMEWORK • SSR' },
      { id: 'svelte', label: 'Svelte', badge: { text: 'S', bg: '#FF3E00', color: '#FFF' }, subtitle: 'FRONTEND • COMPILER' },
      { id: 'html_css', label: 'HTML/CSS', badge: { text: '</>', bg: '#E34F26', color: '#FFF' }, subtitle: 'CORE • MARKUP' },
      { id: 'tailwind', label: 'Tailwind CSS', badge: { text: 'TW', bg: '#38BDF8', color: '#000' }, subtitle: 'CSS • UTILITY' },
      { id: 'bootstrap', label: 'Bootstrap', badge: { text: 'B', bg: '#7952B3', color: '#FFF' }, subtitle: 'CSS • FRAMEWORK' },
      { id: 'sass', label: 'Sass/SCSS', badge: { text: 'Sass', bg: '#CC6699', color: '#FFF' }, subtitle: 'CSS • PREPROCESSOR' },
      { id: 'redux', label: 'Redux', badge: { text: 'RD', bg: '#764ABC', color: '#FFF' }, subtitle: 'STATE • MANAGEMENT' },
      { id: 'webpack', label: 'Webpack', badge: { text: 'WP', bg: '#8DD6F9', color: '#000' }, subtitle: 'TOOL • BUNDLER' },
      { id: 'vite', label: 'Vite', badge: { text: '⚡', bg: '#646CFF', color: '#FFF' }, subtitle: 'TOOL • BUNDLER' },
    ],
  },
  {
    id: 'backend',
    name: 'Backend',
    icon: '⚙️',
    skills: [
      { id: 'nodejs', label: 'Node.js', badge: { text: 'Node', bg: '#5FA04E', color: '#FFF' }, subtitle: 'BACKEND • RUNTIME' },
      { id: 'express', label: 'Express.js', badge: { text: 'EX', bg: '#E2E8F0', color: '#000' }, subtitle: 'BACKEND • API' },
      { id: 'django', label: 'Django', badge: { text: 'DJ', bg: '#092E20', color: '#FFF' }, subtitle: 'BACKEND • PYTHON' },
      { id: 'flask', label: 'Flask', badge: { text: 'FL', bg: '#000000', color: '#FFF' }, subtitle: 'BACKEND • MICRO' },
      { id: 'fastapi', label: 'FastAPI', badge: { text: 'FA', bg: '#059669', color: '#FFF' }, subtitle: 'BACKEND • ASYNC' },
      { id: 'spring_boot', label: 'Spring Boot', badge: { text: 'SB', bg: '#6DB33F', color: '#FFF' }, subtitle: 'BACKEND • JAVA' },
      { id: 'rails', label: 'Ruby on Rails', badge: { text: 'RoR', bg: '#CC0000', color: '#FFF' }, subtitle: 'BACKEND • MVC' },
      { id: 'go_fiber', label: 'Go Fiber', badge: { text: 'GF', bg: '#00ADD8', color: '#FFF' }, subtitle: 'BACKEND • HIGH-PERF' },
      { id: 'nestjs', label: 'NestJS', badge: { text: 'NJ', bg: '#E0234E', color: '#FFF' }, subtitle: 'BACKEND • TYPESCRIPT' },
      { id: 'graphql', label: 'GraphQL', badge: { text: '◈', bg: '#E10098', color: '#FFF' }, subtitle: 'API • QUERY SPEC' },
      { id: 'rest_api', label: 'REST API', badge: { text: 'REST', bg: '#3B82F6', color: '#FFF' }, subtitle: 'API • ARCHITECTURE' },
      { id: 'grpc', label: 'gRPC', badge: { text: 'gRPC', bg: '#244c5a', color: '#FFF' }, subtitle: 'API • PROTOBUF' },
    ],
  },
  {
    id: 'fullstack',
    name: 'Full Stack',
    icon: '🔗',
    skills: [
      { id: 'javascript', label: 'JavaScript', badge: { text: 'JS', bg: '#F7DF1E', color: '#000' }, subtitle: 'LANGUAGE • CORE' },
      { id: 'typescript', label: 'TypeScript', badge: { text: 'TS', bg: '#3178C6', color: '#FFF' }, subtitle: 'LANGUAGE • STRICT' },
      { id: 'mern', label: 'MERN Stack', badge: { text: 'MERN', bg: '#C4B5FD', color: '#000' }, subtitle: 'STACK • REACT/NODE' },
      { id: 'mean', label: 'MEAN Stack', badge: { text: 'MEAN', bg: '#DD0031', color: '#FFF' }, subtitle: 'STACK • ANGULAR/NODE' },
      { id: 't3_stack', label: 'T3 Stack', badge: { text: 'T3', bg: '#1E293B', color: '#FFF' }, subtitle: 'STACK • NEXT/TRPC' },
      { id: 'remix', label: 'Remix', badge: { text: 'RX', bg: '#000000', color: '#FFF' }, subtitle: 'FRAMEWORK • WEB' },
      { id: 'nuxtjs', label: 'Nuxt.js', badge: { text: 'NX', bg: '#00DC82', color: '#000' }, subtitle: 'FRAMEWORK • VUE SSR' },
      { id: 'astro', label: 'Astro', badge: { text: '🚀', bg: '#FF5D01', color: '#FFF' }, subtitle: 'FRAMEWORK • CONTENT' },
      { id: 'blitz', label: 'Blitz.js', badge: { text: 'BZ', bg: '#6700EB', color: '#FFF' }, subtitle: 'FRAMEWORK • FULLSTACK' },
      { id: 'redwood', label: 'RedwoodJS', badge: { text: '🌲', bg: '#BF4722', color: '#FFF' }, subtitle: 'FRAMEWORK • FULLSTACK' },
    ],
  },
  {
    id: 'ai_ml',
    name: 'AI / ML',
    icon: '🤖',
    skills: [
      { id: 'tensorflow', label: 'TensorFlow', badge: { text: 'TF', bg: '#FF6F00', color: '#FFF' }, subtitle: 'AI • DEEP LEARNING' },
      { id: 'pytorch', label: 'PyTorch', badge: { text: 'PT', bg: '#EE4C2C', color: '#FFF' }, subtitle: 'AI • RESEARCH/TENSORS' },
      { id: 'openai_api', label: 'OpenAI / LLMs', badge: { text: 'AI', bg: '#10A37F', color: '#FFF' }, subtitle: 'AI • GENERATIVE' },
      { id: 'langchain', label: 'LangChain', badge: { text: '🦜', bg: '#22C55E', color: '#000' }, subtitle: 'AI • AGENT/CHAINS' },
      { id: 'huggingface', label: 'Hugging Face', badge: { text: '🤗', bg: '#FFD21E', color: '#000' }, subtitle: 'AI • TRANSFORMERS' },
      { id: 'computer_vision', label: 'Computer Vision', badge: { text: '👁', bg: '#8B5CF6', color: '#FFF' }, subtitle: 'AI • PERCEPTION' },
      { id: 'nlp', label: 'NLP', badge: { text: 'NLP', bg: '#06B6D4', color: '#FFF' }, subtitle: 'AI • LINGUISTICS' },
      { id: 'scikit_learn', label: 'scikit-learn', badge: { text: 'SK', bg: '#F59E0B', color: '#000' }, subtitle: 'AI • CLASSIC ML' },
      { id: 'pandas', label: 'Pandas', badge: { text: '🐼', bg: '#150458', color: '#FFF' }, subtitle: 'DATA • ANALYSIS' },
      { id: 'rag', label: 'RAG Systems', badge: { text: 'RAG', bg: '#EC4899', color: '#FFF' }, subtitle: 'AI • RETRIEVAL' },
      { id: 'prompt_engineering', label: 'Prompt Engineering', badge: { text: 'PE', bg: '#A855F7', color: '#FFF' }, subtitle: 'AI • OPTIMIZATION' },
      { id: 'stable_diffusion', label: 'Diffusion Models', badge: { text: 'SD', bg: '#6366F1', color: '#FFF' }, subtitle: 'AI • IMAGE GEN' },
    ],
  },
  {
    id: 'mobile',
    name: 'Mobile',
    icon: '📱',
    skills: [
      { id: 'react_native', label: 'React Native', badge: { text: 'RN', bg: '#61DAFB', color: '#000' }, subtitle: 'MOBILE • CROSS-PLATFORM' },
      { id: 'flutter', label: 'Flutter', badge: { text: 'FL', bg: '#02569B', color: '#FFF' }, subtitle: 'MOBILE • DART UI' },
      { id: 'swift', label: 'Swift', badge: { text: 'SW', bg: '#F05138', color: '#FFF' }, subtitle: 'MOBILE • IOS NATIVE' },
      { id: 'kotlin', label: 'Kotlin', badge: { text: 'KT', bg: '#7F52FF', color: '#FFF' }, subtitle: 'MOBILE • ANDROID' },
      { id: 'expo', label: 'Expo', badge: { text: 'EXPO', bg: '#000020', color: '#FFF' }, subtitle: 'MOBILE • WORKFLOW' },
      { id: 'swiftui', label: 'SwiftUI', badge: { text: 'SUI', bg: '#0A84FF', color: '#FFF' }, subtitle: 'MOBILE • DECLARATIVE' },
      { id: 'jetpack_compose', label: 'Jetpack Compose', badge: { text: 'JC', bg: '#4285F4', color: '#FFF' }, subtitle: 'MOBILE • DECLARATIVE' },
      { id: 'ionic', label: 'Ionic', badge: { text: 'ION', bg: '#3880FF', color: '#FFF' }, subtitle: 'MOBILE • HYBRID' },
      { id: 'capacitor', label: 'Capacitor', badge: { text: 'CAP', bg: '#119EFF', color: '#FFF' }, subtitle: 'MOBILE • RUNTIME' },
    ],
  },
  {
    id: 'database',
    name: 'Database',
    icon: '🗄️',
    skills: [
      { id: 'mongodb', label: 'MongoDB', badge: { text: '🗄️', bg: '#13AA52', color: '#FFF' }, subtitle: 'DATABASE • NOSQL' },
      { id: 'postgresql', label: 'PostgreSQL', badge: { text: '☰', bg: '#336791', color: '#FFF' }, subtitle: 'DATABASE • SQL' },
      { id: 'mysql', label: 'MySQL', badge: { text: 'MY', bg: '#4479A1', color: '#FFF' }, subtitle: 'DATABASE • RELATIONAL' },
      { id: 'redis', label: 'Redis', badge: { text: 'RD', bg: '#DC382D', color: '#FFF' }, subtitle: 'DATABASE • IN-MEMORY' },
      { id: 'firebase', label: 'Firebase', badge: { text: '🔥', bg: '#FFCA28', color: '#000' }, subtitle: 'DATABASE • REALTIME' },
      { id: 'supabase', label: 'Supabase', badge: { text: '⚡', bg: '#3ECF8E', color: '#000' }, subtitle: 'DATABASE • POSTGRES/AUTH' },
      { id: 'prisma', label: 'Prisma', badge: { text: '▲', bg: '#2D3748', color: '#FFF' }, subtitle: 'ORM • TYPE-SAFE' },
      { id: 'dynamodb', label: 'DynamoDB', badge: { text: 'DDB', bg: '#4053D6', color: '#FFF' }, subtitle: 'DATABASE • KEY-VALUE' },
      { id: 'sqlite', label: 'SQLite', badge: { text: 'SQL', bg: '#003B57', color: '#FFF' }, subtitle: 'DATABASE • EMBEDDED' },
      { id: 'elasticsearch', label: 'Elasticsearch', badge: { text: 'ES', bg: '#005571', color: '#FFF' }, subtitle: 'SEARCH • ANALYTICS' },
    ],
  },
  {
    id: 'devops',
    name: 'DevOps / Cloud',
    icon: '☁️',
    skills: [
      { id: 'docker', label: 'Docker', badge: { text: '📦', bg: '#2496ED', color: '#FFF' }, subtitle: 'DEVOPS • CONTAINERS' },
      { id: 'kubernetes', label: 'Kubernetes', badge: { text: 'K8s', bg: '#326CE5', color: '#FFF' }, subtitle: 'DEVOPS • ORCHESTRATION' },
      { id: 'aws', label: 'AWS', badge: { text: 'AWS', bg: '#FF9900', color: '#000' }, subtitle: 'CLOUD • INFRASTRUCTURE' },
      { id: 'gcp', label: 'GCP', badge: { text: 'GCP', bg: '#4285F4', color: '#FFF' }, subtitle: 'CLOUD • PLATFORM' },
      { id: 'azure', label: 'Azure', badge: { text: 'AZ', bg: '#0078D4', color: '#FFF' }, subtitle: 'CLOUD • ENTERPRISE' },
      { id: 'cicd', label: 'CI/CD', badge: { text: 'CI', bg: '#10B981', color: '#FFF' }, subtitle: 'DEVOPS • PIPELINES' },
      { id: 'terraform', label: 'Terraform', badge: { text: 'TF', bg: '#844FBA', color: '#FFF' }, subtitle: 'DEVOPS • IAC' },
      { id: 'github_actions', label: 'GitHub Actions', badge: { text: 'GA', bg: '#2088FF', color: '#FFF' }, subtitle: 'CI • AUTOMATION' },
      { id: 'nginx', label: 'Nginx', badge: { text: 'NGX', bg: '#009639', color: '#FFF' }, subtitle: 'SERVER • PROXY' },
      { id: 'vercel', label: 'Vercel', badge: { text: '▲', bg: '#000000', color: '#FFF' }, subtitle: 'DEPLOY • EDGE' },
      { id: 'netlify', label: 'Netlify', badge: { text: 'NL', bg: '#00C7B7', color: '#000' }, subtitle: 'DEPLOY • JAMSTACK' },
    ],
  },
  {
    id: 'design',
    name: 'Design',
    icon: '🎯',
    skills: [
      { id: 'figma', label: 'Figma', badge: { text: 'FG', bg: '#F24E1E', color: '#FFF' }, subtitle: 'DESIGN • COLLAB' },
      { id: 'ui_ux', label: 'UI/UX Design', badge: { text: 'UX', bg: '#FF7262', color: '#FFF' }, subtitle: 'DESIGN • PRODUCT' },
      { id: 'design_systems', label: 'Design Systems', badge: { text: 'DS', bg: '#A259FF', color: '#FFF' }, subtitle: 'DESIGN • ARCHITECTURE' },
      { id: 'prototyping', label: 'Prototyping', badge: { text: 'PR', bg: '#1ABCFE', color: '#FFF' }, subtitle: 'DESIGN • INTERACTION' },
      { id: 'adobe_xd', label: 'Adobe XD', badge: { text: 'XD', bg: '#FF61F6', color: '#FFF' }, subtitle: 'DESIGN • SCREEN' },
      { id: 'sketch', label: 'Sketch', badge: { text: 'SK', bg: '#F7B500', color: '#000' }, subtitle: 'DESIGN • VECTOR' },
      { id: 'motion_design', label: 'Motion Design', badge: { text: 'MO', bg: '#9933FF', color: '#FFF' }, subtitle: 'DESIGN • ANIMATION' },
      { id: 'accessibility', label: 'Accessibility', badge: { text: 'A11Y', bg: '#0284C7', color: '#FFF' }, subtitle: 'DESIGN • INCLUSIVE' },
    ],
  },
  {
    id: 'blockchain',
    name: 'Blockchain',
    icon: '⛓️',
    skills: [
      { id: 'solidity', label: 'Solidity', badge: { text: 'SOL', bg: '#363636', color: '#FFF' }, subtitle: 'WEB3 • EVM' },
      { id: 'web3js', label: 'Web3.js', badge: { text: 'W3', bg: '#F16822', color: '#FFF' }, subtitle: 'WEB3 • CLIENT' },
      { id: 'ethereum', label: 'Ethereum', badge: { text: 'ETH', bg: '#3C3C3D', color: '#FFF' }, subtitle: 'WEB3 • PROTOCOL' },
      { id: 'smart_contracts', label: 'Smart Contracts', badge: { text: 'SC', bg: '#4F46E5', color: '#FFF' }, subtitle: 'WEB3 • SECURITY' },
      { id: 'hardhat', label: 'Hardhat', badge: { text: 'HH', bg: '#FFF100', color: '#000' }, subtitle: 'WEB3 • DEV TOOL' },
      { id: 'ipfs', label: 'IPFS', badge: { text: 'IPFS', bg: '#65C2CB', color: '#000' }, subtitle: 'WEB3 • STORAGE' },
      { id: 'defi', label: 'DeFi', badge: { text: 'DF', bg: '#10B981', color: '#FFF' }, subtitle: 'WEB3 • PROTOCOLS' },
      { id: 'nft', label: 'NFT Development', badge: { text: 'NFT', bg: '#8B5CF6', color: '#FFF' }, subtitle: 'WEB3 • STANDARDS' },
    ],
  },
  {
    id: 'languages',
    name: 'Languages',
    icon: '💻',
    skills: [
      { id: 'python', label: 'Python', badge: { text: 'PY', bg: '#3776AB', color: '#FFD43B' }, subtitle: 'LANGUAGE • GENERAL' },
      { id: 'go', label: 'Go', badge: { text: 'GO', bg: '#00ADD8', color: '#FFF' }, subtitle: 'LANGUAGE • COMPILED' },
      { id: 'rust', label: 'Rust', badge: { text: 'RS', bg: '#DEA584', color: '#000' }, subtitle: 'LANGUAGE • SYSTEMS' },
      { id: 'java', label: 'Java', badge: { text: 'JV', bg: '#EA2D2E', color: '#FFF' }, subtitle: 'LANGUAGE • ENTERPRISE' },
      { id: 'cpp', label: 'C++', badge: { text: 'C++', bg: '#00599C', color: '#FFF' }, subtitle: 'LANGUAGE • SYSTEMS' },
      { id: 'ruby', label: 'Ruby', badge: { text: 'RB', bg: '#CC342D', color: '#FFF' }, subtitle: 'LANGUAGE • INTERPRETED' },
      { id: 'php', label: 'PHP', badge: { text: 'PHP', bg: '#777BB4', color: '#FFF' }, subtitle: 'LANGUAGE • SERVER' },
      { id: 'csharp', label: 'C#', badge: { text: 'C#', bg: '#239120', color: '#FFF' }, subtitle: 'LANGUAGE • .NET' },
      { id: 'dart', label: 'Dart', badge: { text: 'DT', bg: '#0175C2', color: '#FFF' }, subtitle: 'LANGUAGE • CLIENT' },
      { id: 'elixir', label: 'Elixir', badge: { text: 'EX', bg: '#4E275E', color: '#FFF' }, subtitle: 'LANGUAGE • BEAM' },
    ],
  },
];

// Flat list of all skills for quick iteration
export const ALL_SKILLS = SKILL_CATEGORIES.flatMap((cat) =>
  cat.skills.map((s) => ({
    ...s,
    categoryId: cat.id,
    categoryName: cat.name,
    categoryIcon: cat.icon,
    badge: s.badge || { text: s.label.slice(0, 2).toUpperCase(), bg: '#3B82F6', color: '#FFF' },
    subtitle: s.subtitle || `${cat.name.toUpperCase()} • TECH`,
  }))
);

// Lookup a skill by its canonical ID
export function getSkillById(id) {
  return ALL_SKILLS.find((s) => s.id === id) || null;
}

// Get skill labels from an array of skill IDs
export function getSkillLabels(ids) {
  if (!ids || !Array.isArray(ids)) return [];
  return ids.map((id) => {
    const skill = getSkillById(id);
    return skill ? skill.label : id; // Fallback to raw string if not found
  });
}

// Search skills by query string (matches label, subtitle, category)
export function searchSkills(query) {
  if (!query || !query.trim()) return ALL_SKILLS;
  const q = query.trim().toLowerCase();
  return ALL_SKILLS.filter(
    (s) =>
      s.label.toLowerCase().includes(q) ||
      s.categoryName.toLowerCase().includes(q) ||
      (s.subtitle && s.subtitle.toLowerCase().includes(q)) ||
      s.id.toLowerCase().includes(q)
  );
}

// Predefined project categories
export const PROJECT_CATEGORIES = [
  'Web Development',
  'Mobile App',
  'AI / Machine Learning',
  'Developer Tools',
  'Design & Creative',
  'Full Stack Platform',
  'Open Source',
  'Blockchain / Web3',
  'SaaS / Productivity',
  'Gaming & Graphics',
  'Other',
];

// Predefined project durations
export const PROJECT_DURATIONS = [
  '1-2 weeks',
  '1-2 months',
  '2-3 months',
  '3-6 months',
  '6+ months',
  'Ongoing MVP',
];

// Structured Team Role Cards matching the reference screenshot (Step 3)
export const TEAM_ROLE_CARDS = [
  { id: 'fullstack', title: 'FULL STACK', subtitle: 'Full Cycle Dev' },
  { id: 'backend', title: 'BACKEND DEV', subtitle: 'API & Database' },
  { id: 'frontend', title: 'FRONTEND DEV', subtitle: 'UI & Logic' },
  { id: 'mobile', title: 'MOBILE DEV', subtitle: 'iOS & Android' },
  { id: 'aiml', title: 'AI/ML ENGINEER', subtitle: 'LLMs & Models' },
  { id: 'design', title: 'UI/UX DESIGNER', subtitle: 'Product & Flows' },
  { id: 'devops', title: 'DEVOPS ENG', subtitle: 'Infra & CI/CD' },
  { id: 'datascientist', title: 'DATA SCIENTIST', subtitle: 'Pipelines & Math' },
  { id: 'security', title: 'CYBERSECURITY', subtitle: 'SecOps & Audit' },
  { id: 'blockchain', title: 'BLOCKCHAIN', subtitle: 'Solidity & Web3' },
];

// Legacy array of role strings (compatible with existing code)
export const TEAM_ROLES = TEAM_ROLE_CARDS.map((r) => r.title);

// Predefined interests matching the reference screenshot (Step 3)
export const PROJECT_INTERESTS = [
  'AI & Neural Nets',
  'Web Platform',
  'Developer Tools',
  'Open Source',
  'Mobile',
  'FinTech',
  'SaaS',
  'EdTech',
  'HealthTech',
  'Gaming & Graphics',
  'E-commerce',
];

// Color mapping for project interest pills
export const INTEREST_COLORS = {
  'AI & Neural Nets': '#F43F5E',
  'Web Platform': '#4ADE80',
  'Developer Tools': '#38BDF8',
  'Open Source': '#FCD34D',
  'Mobile': '#C084FC',
  'FinTech': '#FACC15',
  'SaaS': '#FB923C',
  'EdTech': '#818CF8',
  'HealthTech': '#34D399',
  'Gaming & Graphics': '#F472B6',
  'E-commerce': '#60A5FA',
};

// Project icon options
export const PROJECT_ICONS = [
  '🚀', '⚡', '🔥', '💡', '🎯', '⚛️', '🤖', '🎨',
  '📱', '🌐', '🔗', '🛠️', '📊', '🎮', '🧠', '💻',
  '🏗️', '🔒', '📡', '🌟', '💎', '🎪', '🏆', '🦾',
];
