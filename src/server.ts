import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express'; // 1. Import Swagger UI
import { getDocs } from './docs/openapi.js'; // 2. Import your generator
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 3. Generate the OpenAPI JSON object
const openApiDocument = getDocs();

// 4. Serve the UI at the /api-docs endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

// A simple health-check route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Binge Box API is strictly structured and live!' });
});

// Plug in the user routes!
app.use('/api/users', userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📖 Docs available at http://localhost:${PORT}/api-docs`);
});