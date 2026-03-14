import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { 
  logProgress, 
  getContinueWatching,
  getSpecificProgress
} from "../controllers/watch.controller.js";

const router = Router();

// Protect all watch progress routes
router.use(protect);

// POST /api/watch/progress -> Syncs the video player's current time
router.post("/progress", logProgress);

// GET /api/watch/continue -> Gets the list for the Home Screen row
router.get("/continue", getContinueWatching);

// GET /api/watch/progress/12345?season=1&episode=2 -> Gets resume time for a specific video
router.get("/progress/:tmdbId", getSpecificProgress);

export default router;