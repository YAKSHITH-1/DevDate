import { Router } from "express";
import { getDevelopers, getDeveloperById, recordSwipe } from "./discovery.controller.js";
import { optionalAuthenticate } from "../../middleware/auth.js";

const router = Router();

router.use(optionalAuthenticate);

// GET /api/discovery/developers (List and filter developers)
router.get("/developers", getDevelopers);

// POST /api/discovery/swipe (Record a swipe: PASS or INTERESTED)
router.post("/swipe", recordSwipe);

// GET /api/discovery/developers/:id (Get single developer full profile)
router.get("/developers/:id", getDeveloperById);

export default router;
