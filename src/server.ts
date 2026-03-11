import express, { Request, Response } from 'express';
import userRoutes from './routes/user.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// A simple health-check route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Binge Box API is strictly structured and live!' });
});

// Plug in the user routes!
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});