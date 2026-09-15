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

export default {
  registerValidation,
  verifyEmailValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
