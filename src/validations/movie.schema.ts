import { z } from 'zod';


export const rateMovieSchema = z.object({
  // Swapped `required_error` for `message` to satisfy TypeScript
  tmdbId: z.number({ message: "Movie ID is required" }),
  
  rating: z.number()
    .min(1, "Rating must be at least 1 star")
    .max(5, "Rating cannot exceed 5 stars"),
});