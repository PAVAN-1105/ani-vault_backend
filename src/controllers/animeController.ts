// controllers/animeController.ts
import { Response } from 'express';
import Anime from '../models/Anime';
import { AuthRequest } from '../middleware/auth';

// GET all animes for the logged-in user
export const getAnimes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const animes = await Anime.find({ owner: req.user.id });
    res.json(animes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch animes' });
  }
};

// POST a new anime
export const addAnime = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const newAnime = new Anime({ ...req.body, owner: req.user.id });
    const savedAnime = await newAnime.save();
    res.status(201).json(savedAnime);
  } catch (error) {
    res.status(400).json({ message: 'Failed to add anime' });
  }
};

// PUT (Update) an anime status
export const updateAnime = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData._id; // Prevent MongoDB immutable field crash

    const updatedAnime = await Anime.findOneAndUpdate(
      { _id: id, owner: req.user.id }, // Ensure they own it!
      updateData,
      { new: true }
    );
    res.json(updatedAnime);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update anime' });
  }
};

// DELETE an anime
export const deleteAnime = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await Anime.findOneAndDelete({ _id: id, owner: req.user.id });
    res.json({ message: 'Anime deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete anime' });
  }
};