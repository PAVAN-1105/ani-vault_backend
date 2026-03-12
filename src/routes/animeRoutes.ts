// routes/animeRoutes.ts
import express from 'express';
import { getAnimes, addAnime, updateAnime, deleteAnime } from '../controllers/animeController';
import authenticateToken from '../middleware/auth';

const router = express.Router();

// 1. Apply the JWT middleware to ALL routes in this file automatically
router.use(authenticateToken); 

// 2. Map the base URLs to the controller functions
router.route('/')
  .get(getAnimes)
  .post(addAnime);

// 3. Map the URLs with an ID parameter
router.route('/:id')
  .put(updateAnime)
  .delete(deleteAnime);

export default router;