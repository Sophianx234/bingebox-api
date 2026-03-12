import { prisma } from "../lib/prisma.js";

// We require title and posterPath for EVERYTHING now, 
// just in case we need to create a new row on the fly!
export type MovieInput = {
  tmdbId: number;
  title: string;
  posterPath: string | null;
};

// 1. TOGGLE WATCHLIST (Replaces saveMovieToDB)
export const toggleWatchlistInDB = async (userId: number, movieData: MovieInput) => {
  const existing = await prisma.userMovieInteraction.findUnique({
    where: { userId_tmdbId: { userId, tmdbId: movieData.tmdbId } },
  });

  if (existing) {
    // If it exists, just flip the inWatchlist boolean
    return await prisma.userMovieInteraction.update({
      where: { id: existing.id },
      data: { inWatchlist: !existing.inWatchlist },
    });
  }

  // If it doesn't exist, create it and set inWatchlist to true
  return await prisma.userMovieInteraction.create({
    data: {
      userId,
      tmdbId: movieData.tmdbId,
      title: movieData.title,
      posterPath: movieData.posterPath,
      inWatchlist: true,
    },
  });
};

// 2. TOGGLE FAVORITE
export const toggleFavoriteInDB = async (userId: number, movieData: MovieInput) => {
  const existing = await prisma.userMovieInteraction.findUnique({
    where: { userId_tmdbId: { userId, tmdbId: movieData.tmdbId } },
  });

  if (existing) {
    const updated = await prisma.userMovieInteraction.update({
      where: { id: existing.id },
      data: { isFavorite: !existing.isFavorite },
    });
    return { isFavorite: updated.isFavorite };
  }

  const created = await prisma.userMovieInteraction.create({
    data: {
      userId,
      tmdbId: movieData.tmdbId,
      title: movieData.title,
      posterPath: movieData.posterPath,
      isFavorite: true,
    },
  });
  return { isFavorite: created.isFavorite };
};

// 3. UPDATE RATING
export const updateMovieRatingInDB = async (userId: number, movieData: MovieInput, rating: number) => {
  const existing = await prisma.userMovieInteraction.findUnique({
    where: { userId_tmdbId: { userId, tmdbId: movieData.tmdbId } },
  });

  if (existing) {
    return await prisma.userMovieInteraction.update({
      where: { id: existing.id },
      data: { rating },
    });
  }

  return await prisma.userMovieInteraction.create({
    data: {
      userId,
      tmdbId: movieData.tmdbId,
      title: movieData.title,
      posterPath: movieData.posterPath,
      rating, // Save the rating instantly
    },
  });
};

// 4. MARK AS DOWNLOADED
export const markMovieAsDownloadedInDB = async (userId: number, movieData: MovieInput) => {
  const existing = await prisma.userMovieInteraction.findUnique({
    where: { userId_tmdbId: { userId, tmdbId: movieData.tmdbId } },
  });

  if (existing) {
    return await prisma.userMovieInteraction.update({
      where: { id: existing.id },
      data: {
        isDownloaded: true,
        downloadedAt: new Date(),
      },
    });
  }

  return await prisma.userMovieInteraction.create({
    data: {
      userId,
      tmdbId: movieData.tmdbId,
      title: movieData.title,
      posterPath: movieData.posterPath,
      isDownloaded: true,
      downloadedAt: new Date(),
    },
  });
};

// 5. GET ALL USER INTERACTIONS
export const getUserMoviesFromDB = async (userId: number) => {
  return await prisma.userMovieInteraction.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" }, // Automatically sorts by the most recently touched movie!
  });
};