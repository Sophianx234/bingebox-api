import { NextFunction, RequestHandler, Response } from 'express';
import { z } from 'zod'; 
import { rateMovieSchema } from '../validations/movie.schema.js';
import { 
  toggleWatchlistInDB, // <-- Swapped saveMovieToDB for toggleWatchlistInDB
  getUserMoviesFromDB, 
  updateMovieRatingInDB, 
  markMovieAsDownloadedInDB, 
  toggleFavoriteInDB
} from '../services/movie.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

// 1. TOGGLE WATCHLIST (Previously saveMovie)
export const saveMovie = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId as number;
    const movieData = req.body;

    if (!movieData.tmdbId || !movieData.title) {
      return res.status(400).json({ error: 'Missing movie details (tmdbId, title required)' });
    }

    // Now uses the upsert toggle logic
    const interaction = await toggleWatchlistInDB(userId, movieData);
    return res.status(200).json(interaction); 
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to toggle watchlist' });
  }
};

// 2. GET USER LIBRARY
export const getSavedMovies = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.userId);
    const movies = await getUserMoviesFromDB(userId);
    return res.status(200).json(movies);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch library' });
  }
};

// 3. RATE MOVIE
export const rateMovie = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Validate the incoming rating data
    const validatedData = rateMovieSchema.parse(req.body);

    // Construct the full movieData object in case the row needs to be created
    const movieData = {
      tmdbId: validatedData.tmdbId,
      title: req.body.title,
      posterPath: req.body.posterPath
    };

    if (!movieData.title) {
      return res.status(400).json({ error: "Movie title is required to log a new rating." });
    }

    // Pass the full movieData object
    const updatedMovie = await updateMovieRatingInDB(userId, movieData, validatedData.rating);

    return res.status(200).json({ 
      message: "Rating saved successfully!", 
      movie: updatedMovie 
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid rating data", 
        details: error.issues.map((e: z.ZodIssue) => e.message) 
      });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// 4. MARK AS DOWNLOADED
export const markDownloaded = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId as number;
    const movieData = req.body; 

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    if (!movieData.tmdbId || !movieData.title) {
      return res.status(400).json({ error: "Movie ID and Title are required" });
    }

    const updatedMovie = await markMovieAsDownloadedInDB(userId, movieData);

    return res.status(200).json({ 
      message: "Download synced to library!", 
      movie: updatedMovie 
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Failed to sync download" });
  }
};

// 5. TOGGLE FAVORITE
export const toggleFavorite: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId as number;
    
    // We extract the entire body now, not just tmdbId
    const movieData = req.body; 

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return; 
    }
    
    if (!movieData.tmdbId || !movieData.title) {
      res.status(400).json({ error: "Movie ID and Title are required" });
      return;
    }

    // Call the service with the full movieData payload
    const result = await toggleFavoriteInDB(userId, movieData);

    // Send dynamic response
    res.status(200).json({ 
      message: result.isFavorite ? "Added to favorites!" : "Removed from favorites!",
      isFavorite: result.isFavorite 
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to toggle favorite status" });
  }
};