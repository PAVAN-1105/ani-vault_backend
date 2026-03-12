// server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';         
import animeRoutes from './routes/animeRoutes'; 
import authRoutes from './routes/authRoutes';   

// Initialize environment variables and database
dotenv.config();
connectDB();

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/animes', animeRoutes);
// We will add app.use('/api/auth', authRoutes) next!
app.use('/api/auth', authRoutes);
// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is blazing fast and running on port ${PORT}`);
});