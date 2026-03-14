import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { 
  updateWatchProgressInDB, 
  getContinueWatchingFromDB,
  getSpecificProgressFromDB
} from '../services/watch.service.js';

// 1. LOG PROGRESS (Called repeatedly by the frontend video player)
export const logProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId as number;
    const progressData = req.body;

    if (!progressData.tmdbId || !progressData.mediaType || !progressData.title) {
      return res.status(400).json({ error: 'Missing required media details' });
    }

    if (progressData.stoppedAtSeconds === undefined) {
      return res.status(400).json({ error: 'stoppedAtSeconds is required' });
    }

    const updatedRecord = await updateWatchProgressInDB(userId, progressData);
    return res.status(200).json(updatedRecord);
  } catch (error) {
    console.error("Log Progress Error:", error);
    return res.status(500).json({ error: 'Failed to log watch progress' });
  }
};

// 2. FETCH "CONTINUE WATCHING" ROW
export const getContinueWatching = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId as number;
    const list = await getContinueWatchingFromDB(userId);
    return res.status(200).json(list);
  } catch (error) {
    console.error("Fetch Continue Watching Error:", error);
    return res.status(500).json({ error: 'Failed to fetch continue watching list' });
  }
};

// 3. FETCH SPECIFIC PROGRESS (To auto-resume when opening a movie)
export const getSpecificProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId as number;
    const tmdbId = parseInt(req.params.tmdbId as string);
    
    // Read query params for TV shows (e.g., ?season=1&episode=3)
    const season = req.query.season ? parseInt(req.query.season as string) : undefined;
    const episode = req.query.episode ? parseInt(req.query.episode as string) : undefined;

    if (isNaN(tmdbId)) {
      return res.status(400).json({ error: 'Invalid TMDB ID' });
    }

    const progress = await getSpecificProgressFromDB(userId, tmdbId, season, episode);
    
    return res.status(200).json(progress || { stoppedAtSeconds: 0 });
  } catch (error) {
    console.error("Fetch Specific Progress Error:", error);
    return res.status(500).json({ error: 'Failed to fetch specific progress' });
  }
};