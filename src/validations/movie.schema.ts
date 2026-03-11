import { z } from 'zod';

export const rateMovieSchema = z.object({
  tmdbId: z.number({ required_error: "Movie ID is required" }),
  rating: z.number()
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
});