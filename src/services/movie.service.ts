import { prisma } from "../lib/prisma.js";

export type MovieInput = {
  tmdbId: number;
  title: string;
  posterPath: string;
  isFavorite?: boolean;
  rating?: number; // Optional: User's star rating (1-5)
};
// Save a movie to a specific user
export const saveMovieToDB = async (userId: number, movieData: MovieInput) => {
  return await prisma.savedMovie.create({
    data: {
      tmdbId: movieData.tmdbId,
      title: movieData.title,
      posterPath: movieData.posterPath,
      userId: userId, // Link the movie to the user
    },
  });
};

export const toggleFavoriteInDB = async (userId: number, tmdbId: number) => {
  const movie = await prisma.savedMovie.findFirst({
    where: { userId, tmdbId },
  });

  if (!movie) {
    throw new Error("You must save a movie before favoriting it.");
  }

  const updated = await prisma.savedMovie.update({
    where: { id: movie.id },
    data: { isFavorite: !movie.isFavorite }, // Flips true to false, or false to true
  });

  return { isFavorite: updated.isFavorite };
};
// Get all saved movies for a specific user
export const getUserMoviesFromDB = async (userId: number) => {
  return await prisma.savedMovie.findMany({
    where: { userId },
    orderBy: { id: "desc" }, // Show newest saves first
  });
};

export const updateMovieRatingInDB = async (
  userId: number,
  tmdbId: number,
  rating: number,
) => {
  // 1. Find the exact movie in the user's saved list
  const movie = await prisma.savedMovie.findFirst({
    where: { userId, tmdbId },
  });

  // 2. If they haven't saved it yet, they can't rate it!
  if (!movie) {
    throw new Error(
      "You must save the movie to your watchlist before rating it.",
    );
  }

  // 3. Update the rating
  const updatedMovie = await prisma.savedMovie.update({
    where: { id: movie.id },
    data: { rating },
  });

  return updatedMovie;
};


export const markMovieAsDownloadedInDB = async (
  userId: number,
  movieData: MovieInput,
) => {
  // 1. Check if the movie already exists in their list
  const existingMovie = await prisma.savedMovie.findFirst({
    where: { userId, tmdbId: movieData.tmdbId },
  });

  // 2. If it exists, UPDATE it
  if (existingMovie) {
    return await prisma.savedMovie.update({
      where: { id: existingMovie.id },
      data: {
        isDownloaded: true,
        downloadedAt: new Date(),
      },
    });
  }

  // 3. If it does NOT exist, CREATE it seamlessly in the background
  return await prisma.savedMovie.create({
    data: {
      tmdbId: movieData.tmdbId,
      title: movieData.title,
      posterPath: movieData.posterPath,
      userId: userId,
      isDownloaded: true, // Mark it downloaded immediately
      downloadedAt: new Date(), // Set the timestamp
    },
  });
};
