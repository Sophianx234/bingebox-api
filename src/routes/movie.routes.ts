import { Router } from "express";
import {
  saveMovie,
  getSavedMovies,
  rateMovie,
  toggleFavorite,
  getFavoriteMovies,
} from "../controllers/movie.controller.js";
import { markDownloaded } from "../controllers/movie.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// All movie routes are protected

router.use(protect); // Apply the protect middleware to all routes in this router
// router.use(protect)
router.post("/", saveMovie).get("/", getSavedMovies);

// POST /api/movies/rate -> Updates the star rating of a saved movie
router.post("/rate", rateMovie);

// POST /api/movies/download -> Marks a movie as downloaded
router.post("/download", markDownloaded);

// POST /api/movies/favorite -> Toggles a saved movie's favorite status
router.post("/favorite", toggleFavorite);
router.get('/favorite', protect, getFavoriteMovies);

export default router;
