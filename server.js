require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- CHANGE 1: Professional Dynamic CORS ---
// This will allow any Vercel URL or your local environment to talk to the server
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const allowedPatterns = [/vercel\.app$/, /localhost:4200$/];
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('CORS Error: This origin is not allowed by Pavan\'s Server'));
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json());

// --- CHANGE 2: Environment Variables ---
const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(() => console.log("✅ Successfully connected to MongoDB!"))
  .catch(err => console.error("❌ Failed to connect to MongoDB:", err));

const animeSchema = new mongoose.Schema({
  id: Number,
  title: String,
  episodes: Number,
  status: String,
  imageUrl: String
});

const Anime = mongoose.model('Anime', animeSchema);

// GET all animes
app.get('/api/animes', async (req, res) => {
  try {
    const animes = await Anime.find();
    res.json(animes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new anime
app.post('/api/animes', async (req, res) => {
  try {
    const newAnime = new Anime(req.body);
    await newAnime.save(); 
    res.status(201).json(newAnime); 
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE an anime
app.delete('/api/animes/:id', async (req, res) => {
  try {
    const animeId = Number(req.params.id);
    const deletedAnime = await Anime.findOneAndDelete({ id: animeId });
    if (!deletedAnime) {
      return res.status(404).json({ message: "Anime not found!" });
    }
    res.json({ message: "Anime deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- CHANGE 3: Dynamic Port ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});