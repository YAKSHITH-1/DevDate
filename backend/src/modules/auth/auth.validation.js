import { body } from "express-validator";

export const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Za-z]/)
    .withMessage("Password must contain at least one letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number"),
];

export const verifyEmailValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
];

export const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

export const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail({ gmail_remove_dots: false }),
];

export const resetPasswordValidation = [
  body("token")
    .trim()
    .notEmpty()
    .withMessage("Reset token is required"),

  body("password")
    .custom((value, { req }) => {
      const pwd = value || req.body.newPassword;
      if (!pwd) {
        throw new Error("New password is required");
      }
      if (pwd.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }
      if (!/[A-Za-z]/.test(pwd)) {
        throw new Error("Password must contain at least one letter");
      }
      if (!/[0-9]/.test(pwd)) {
        throw new Error("Password must contain at least one number");
      }
      return true;
    }),
];

export const updateProfileValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),

  body("introduction")
    .optional()
    .trim(),

  body("role")
    .optional()
    .trim(),

  body("preferredRole")
    .optional()
    .trim(),

  body("experience")
    .optional()
    .trim(),

  body("availability")
    .optional()
    .trim(),

  body("location")
    .optional()
    .trim(),

  body("github")
    .optional()
    .trim(),

  body("linkedin")
    .optional()
    .trim(),

  body("portfolio")
    .optional()
    .trim(),

  body("avatar")
    .optional({ nullable: true })
    .trim()
    .custom((value) => {
      if (!value) return true;
      if (typeof value !== "string") throw new Error("Avatar must be a string");
      if (/^(javascript|vbscript):/i.test(value)) throw new Error("Invalid avatar image URL scheme");
      if (value.length > 2048) throw new Error("Avatar URL exceeds maximum length");
      return true;
    }),

  body("skills")
    .optional()
    .custom((value) => {
      if (typeof value === "string") return true;
      if (Array.isArray(value) && value.every((s) => typeof s === "string")) return true;
      throw new Error("Skills must be an array of strings or a comma-separated string");
    }),

  body("interests")
    .optional()
    .custom((value) => {
      if (typeof value === "string") return true;
      if (Array.isArray(value) && value.every((s) => typeof s === "string")) return true;
      throw new Error("Interests must be an array of strings or a comma-separated string");
    }),

  body("passwordHash")
    .custom((value) => {
      if (value !== undefined) {
        throw new Error("passwordHash cannot be modified through profile update");
      }
      return true;
    }),

  body("isVerified")
    .custom((value) => {
      if (value !== undefined) {
        throw new Error("isVerified cannot be modified through profile update");
      }
      return true;
    }),
];

export default {
  registerValidation,
  verifyEmailValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
};

