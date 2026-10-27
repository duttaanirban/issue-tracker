import express from 'express';
import cors from 'cors';
import issueRoutes from './routes/issueRoutes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/issues', issueRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

export default app;