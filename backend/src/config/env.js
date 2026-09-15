import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// List of mandatory environment variables required for the application to function securely
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "REFRESH_TOKEN_SECRET",
  "EMAIL_USER",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REFRESH_TOKEN",
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

// JWT Secrets & Expirations
export const JWT_SECRET = process.env.JWT_SECRET.trim();
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET.trim();
export const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

// Email & Google OAuth2 Credentials
export const EMAIL_USER = process.env.EMAIL_USER.trim();
export const EMAIL_PASS = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.trim() : undefined;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID.trim();
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET.trim();
export const GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN.trim();

// Application URL
export const APP_URL = process.env.APP_URL ? process.env.APP_URL.trim() : `http://localhost:${PORT}`;

export default {
  PORT,
  NODE_ENV,
  MONGO_URI,
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  EMAIL_USER,
  EMAIL_PASS,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN,
  APP_URL,
};
