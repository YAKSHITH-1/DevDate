import { validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

export const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return next(new ApiError(400, extractedErrors[0]?.message || "Validation error", extractedErrors));
  };
};

export default validate;
