import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(express.json());

// A simple health-check route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Binge Box API is live and running from server.ts!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});