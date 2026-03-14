import { prisma } from "../lib/prisma.js";

// 1. LOG SEARCH QUERY
export const logSearchQueryInDB = async (userId: number, query: string) => {
  // We lowercase and trim the query so "Batman" and " batman " don't create duplicate rows
  const normalizedQuery = query.trim().toLowerCase();

  return await prisma.searchHistory.upsert({
    where: {
      userId_query: {
        userId: userId,
        query: normalizedQuery,
      },
    },
    update: {
      // Re-assigning the query forces Prisma to update the `updatedAt` timestamp to right now
      query: normalizedQuery,
    },
    create: {
      userId: userId,
      query: normalizedQuery,
    },
  });
};

// 2. GET RECENT SEARCHES
export const getUserSearchHistoryFromDB = async (userId: number) => {
  return await prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" }, // Most recent searches first
    take: 10, // Only return the last 10 searches to keep the UI clean
  });
};

// 3. DELETE SPECIFIC SEARCH (Optional but good UX)
export const removeSearchQueryFromDB = async (userId: number, searchId: number) => {
  return await prisma.searchHistory.delete({
    where: { 
      id: searchId,
      userId: userId // Ensure they only delete their own history
    },
  });
};

// 4. CLEAR ALL HISTORY (Optional but good UX)
export const clearUserSearchHistoryInDB = async (userId: number) => {
  return await prisma.searchHistory.deleteMany({
    where: { userId },
  });
};