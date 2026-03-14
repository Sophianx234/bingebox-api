import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { 
  logSearchQueryInDB, 
  getUserSearchHistoryFromDB, 
  removeSearchQueryFromDB, 
  clearUserSearchHistoryInDB 
} from '../services/search.service.js';

// 1. LOG SEARCH
export const logSearch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId as number;
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchRecord = await logSearchQueryInDB(userId, query);
    return res.status(200).json(searchRecord);
  } catch (error) {
    console.error("Log Search Error:", error);
    return res.status(500).json({ error: 'Failed to log search history' });
  }
};

// 2. GET SEARCH HISTORY
export const getSearchHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId as number;
    const history = await getUserSearchHistoryFromDB(userId);
    return res.status(200).json(history);
  } catch (error) {
    console.error("Fetch Search History Error:", error);
    return res.status(500).json({ error: 'Failed to fetch search history' });
  }
};

// 3. REMOVE SINGLE SEARCH TERM
export const removeSearch = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId as number;
    const searchId = parseInt(req.params.id as string);

    if (isNaN(searchId)) {
      return res.status(400).json({ error: 'Invalid search ID' });
    }

    await removeSearchQueryFromDB(userId, searchId);
    return res.status(200).json({ message: 'Search term removed' });
  } catch (error) {
    console.error("Remove Search Error:", error);
    return res.status(500).json({ error: 'Failed to remove search term' });
  }
};

// 4. CLEAR ALL HISTORY
export const clearHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId as number;
    await clearUserSearchHistoryInDB(userId);
    return res.status(200).json({ message: 'Search history cleared' });
  } catch (error) {
    console.error("Clear History Error:", error);
    return res.status(500).json({ error: 'Failed to clear search history' });
  }
};