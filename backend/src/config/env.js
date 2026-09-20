import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// List of mandatory environment variables required for the application to function securely
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "REFRESH_TOKEN_SECRET",
];

// Check for any missing or empty required environment variables
const missingEnvVars = requiredEnvVars.filter(
  (envKey) => !process.env[envKey] || process.env[envKey].trim() === ""
);

if (missingEnvVars.length > 0) {
  console.error("=================================================================");
  console.error("❌ [FATAL CONFIG ERROR] Missing required environment variables:");
  missingEnvVars.forEach((key) => console.error(`   - ${key}`));
  console.error("Please provide these values in your backend/.env file.");
  console.error("=================================================================");
  process.exit(1);
}

// Export validated variables and defaults
export const PORT = Number(process.env.PORT) || 3000;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const MONGO_URI = process.env.MONGO_URI.trim();

// Production Brevo API Key Validation
if (NODE_ENV === "production" && (!process.env.BREVO_API_KEY || process.env.BREVO_API_KEY.trim() === "")) {
  console.error("=================================================================");
  console.error("❌ [FATAL CONFIG ERROR] Missing required environment variable: BREVO_API_KEY");
  console.error("Please provide BREVO_API_KEY in your production environment.");
  console.error("=================================================================");
  process.exit(1);
}

// JWT Secrets & Expirations
export const JWT_SECRET = process.env.JWT_SECRET.trim();
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET.trim();
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

// Brevo Transactional Email Configuration
export const BREVO_API_KEY = process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.trim() : "";
export const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL
  ? process.env.BREVO_SENDER_EMAIL.trim()
  : (process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : "[EMAIL_ADDRESS]");
export const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME
  ? process.env.BREVO_SENDER_NAME.trim()
  : "DevDate";

// Email & SMTP Credentials (Gmail App Password or Custom SMTP)
export const EMAIL_USER = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : (process.env.BREVO_SENDER_EMAIL ? process.env.BREVO_SENDER_EMAIL.trim() : "");
export const EMAIL_PASS = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : "";
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.trim() : "";
export const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN ? process.env.GOOGLE_REFRESH_TOKEN.trim() : "";

// Application URL & Allowed CORS Origins
export const APP_URL = process.env.APP_URL ? process.env.APP_URL.trim() : `http://localhost:${PORT}`;
export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter(Boolean)
  : [];

// Rate Limiting Configuration
// 1. Strict Auth Route Limits (Per-IP & Per-Account with Exponential Backoff)
export const RATE_LIMIT_AUTH_WINDOW_MS = Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_AUTH_MAX_IP = Number(process.env.RATE_LIMIT_AUTH_MAX_IP) || 10; // Max attempts per IP before backoff
export const RATE_LIMIT_AUTH_MAX_ACCOUNT = Number(process.env.RATE_LIMIT_AUTH_MAX_ACCOUNT) || 5; // Max attempts per account before backoff
export const RATE_LIMIT_AUTH_BASE_DELAY_MS = Number(process.env.RATE_LIMIT_AUTH_BASE_DELAY_MS) || 2000; // Base delay: 2 seconds
export const RATE_LIMIT_AUTH_MAX_DELAY_MS = Number(process.env.RATE_LIMIT_AUTH_MAX_DELAY_MS) || 300000; // Delay cap: 5 minutes
export const RATE_LIMIT_AUTH_BACKOFF_FACTOR = Number(process.env.RATE_LIMIT_AUTH_BACKOFF_FACTOR) || 2; // Factor multiplier

// 2. Moderate Public Endpoint Limits (IP-based)
export const RATE_LIMIT_PUBLIC_WINDOW_MS = Number(process.env.RATE_LIMIT_PUBLIC_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_PUBLIC_MAX = Number(process.env.RATE_LIMIT_PUBLIC_MAX) || 100; // 100 requests per 15 min

// 3. Looser Authenticated User Action Limits (User-based)
export const RATE_LIMIT_USER_WINDOW_MS = Number(process.env.RATE_LIMIT_USER_WINDOW_MS) || 15 * 60 * 1000; // 15 minutes
export const RATE_LIMIT_USER_MAX = Number(process.env.RATE_LIMIT_USER_MAX) || 1000; // 1000 requests per 15 min

export default {
  PORT,
  NODE_ENV,
  MONGO_URI,
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  BREVO_API_KEY,
  BREVO_SENDER_EMAIL,
  BREVO_SENDER_NAME,
  EMAIL_USER,
  EMAIL_PASS,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  APP_URL,
  ALLOWED_ORIGINS,
  RATE_LIMIT_AUTH_WINDOW_MS,
  RATE_LIMIT_AUTH_MAX_IP,
  RATE_LIMIT_AUTH_MAX_ACCOUNT,
  RATE_LIMIT_AUTH_BASE_DELAY_MS,
  RATE_LIMIT_AUTH_MAX_DELAY_MS,
  RATE_LIMIT_AUTH_BACKOFF_FACTOR,
  RATE_LIMIT_PUBLIC_WINDOW_MS,
  RATE_LIMIT_PUBLIC_MAX,
  RATE_LIMIT_USER_WINDOW_MS,
  RATE_LIMIT_USER_MAX,
};
