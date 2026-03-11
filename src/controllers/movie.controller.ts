import {  NextFunction, RequestHandler, Response } from 'express';
import { z } from 'zod'; // <--- Added missing Zod import
import { rateMovieSchema } from '../validations/movie.schema.js';
import { 
  saveMovieToDB, 
  getUserMoviesFromDB, 
  updateMovieRatingInDB, 
  markMovieAsDownloadedInDB, 
  toggleFavoriteInDB
} from '../services/movie.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const saveMovie = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId as number;
    const movieData = req.body;

    if (!movieData.tmdbId || !movieData.title) {
      return res.status(400).json({ error: 'Missing movie details' });
    }

    const savedMovie = await saveMovieToDB(userId, movieData);
    return res.status(201).json(savedMovie);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to save movie' });
  }
};

export const getSavedMovies = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const movies = await getUserMoviesFromDB(userId as number);
    return res.status(200).json(movies);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

export const rateMovie = async (req: AuthRequest, res: Response)=> {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // 1. Validate the incoming data
    const validatedData = rateMovieSchema.parse(req.body);

    // 2. Update the database
    const updatedMovie = await updateMovieRatingInDB(userId, validatedData.tmdbId, validatedData.rating);

    return res.status(200).json({ 
      message: "Rating saved successfully!", 
      movie: updatedMovie 
    });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Invalid rating data", 
        // Swap .errors for .issues
        details: error.issues.map((e: z.ZodIssue) => e.message) 
      });
    }
    // ...
    if (error.message) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const markDownloaded = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const movieData = req.body; 

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    if (!movieData.tmdbId || !movieData.title) {
      return res.status(400).json({ error: "Movie ID and Title are required" });
    }

    const updatedMovie = await markMovieAsDownloadedInDB(userId, movieData);

    return res.status(200).json({ 
      message: "Download started and saved to library!", 
      movie: updatedMovie 
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Failed to mark as downloaded" });
  }
};


// We add : RequestHandler here to tell TypeScript exactly what this is
export const toggleFavorite: RequestHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Extract user ID from the protect middleware
    const userId = req.user?.userId;
    const { tmdbId } = req.body; 

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return; // <-- Empty return stops the function, satisfying TypeScript
    }
    
    if (!tmdbId) {
      res.status(400).json({ error: "Movie ID (tmdbId) is required" });
      return;
    }

    // Call the service
    const result = await toggleFavoriteInDB(userId, tmdbId);

    // Send dynamic response
    res.status(200).json({ 
      message: result.isFavorite ? "Added to favorites!" : "Removed from favorites!",
      isFavorite: result.isFavorite 
    });
    return;

  } catch (error: any) {
    if (error.message === "You must save a movie before favoriting it.") {
      res.status(400).json({ error: error.message });
      return;
    }
    
    console.error(error);
    res.status(500).json({ error: "Failed to toggle favorite status" });
    return;
  }
};