import { prisma } from "../lib/prisma.js";

export type WatchProgressInput = {
  tmdbId: number;
  mediaType: string; // 'movie' or 'tv'
  title: string;
  posterPath: string | null;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  stoppedAtSeconds: number;
  totalDurationSeconds?: number | null;
};

// 1. LOG OR UPDATE WATCH PROGRESS
export const updateWatchProgressInDB = async (userId: number, data: WatchProgressInput) => {
  // Calculate if the user has basically finished the video (e.g., within 30 seconds of the end)
  let isCompleted = false;
  if (data.totalDurationSeconds && data.totalDurationSeconds > 0) {
    isCompleted = data.stoppedAtSeconds >= (data.totalDurationSeconds - 30);
  }

  // 1. Look for the exact record (matching movie OR exact tv episode)
  const existing = await prisma.watchProgress.findFirst({
    where: {
      userId: userId,
      tmdbId: data.tmdbId,
      seasonNumber: data.seasonNumber || null,
      episodeNumber: data.episodeNumber || null,
    },
  });

  // 2. If it exists, update the timestamp and progress
  if (existing) {
    return await prisma.watchProgress.update({
      where: { id: existing.id },
      data: {
        stoppedAtSeconds: data.stoppedAtSeconds,
        totalDurationSeconds: data.totalDurationSeconds,
        isCompleted: isCompleted,
      },
    });
  }

  // 3. If it doesn't exist, create a brand new progress record
  return await prisma.watchProgress.create({
    data: {
      userId: userId,
      tmdbId: data.tmdbId,
      mediaType: data.mediaType,
      title: data.title,
      posterPath: data.posterPath,
      seasonNumber: data.seasonNumber || null,
      episodeNumber: data.episodeNumber || null,
      stoppedAtSeconds: data.stoppedAtSeconds,
      totalDurationSeconds: data.totalDurationSeconds,
      isCompleted: isCompleted,
    },
  });
};

// 2. GET USER'S "CONTINUE WATCHING" LIST
export const getContinueWatchingFromDB = async (userId: number) => {
  return await prisma.watchProgress.findMany({
    where: { 
      userId: userId,
      isCompleted: false, // Don't show movies they've already finished!
      stoppedAtSeconds: { gt: 10 } // Optional: Ignore if they only watched 10 seconds and bailed
    },
    orderBy: { updatedAt: "desc" }, // Most recently watched shows up first
    take: 20, // Limit the list size
  });
};

// 3. GET SPECIFIC PROGRESS (Useful for resuming a video right when they open the details page)
export const getSpecificProgressFromDB = async (
  userId: number, 
  tmdbId: number, 
  seasonNumber?: number, 
  episodeNumber?: number
) => {
  return await prisma.watchProgress.findFirst({
    where: {
      userId: userId,
      tmdbId: tmdbId,
      seasonNumber: seasonNumber || null,
      episodeNumber: episodeNumber || null,
    },
  });
};