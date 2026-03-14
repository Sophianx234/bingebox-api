import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { 
  logSearch, 
  getSearchHistory, 
  removeSearch, 
  clearHistory 
} from "../controllers/search.controller.js";

const router = Router();

// Protect all search routes
router.use(protect);

router.post("/history", logSearch);
router.get("/history", getSearchHistory);
router.delete("/history/:id", removeSearch);
router.delete("/history", clearHistory);

export default router;