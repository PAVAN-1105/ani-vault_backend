const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- CHANGE 1: Dynamic CORS ---
// During development, we allow everything. 
// Once deployed, you can change this to your Vercel URL for better security.
app.use(cors()); 

app.use(express.json());

// --- CHANGE 2: Environment Variables for Security ---
// We use process.env to hide your password from the public code
const uri = process.env.MONGODB_URI || "mongodb+srv://pavan:Krish%40511@animecluster.1tamvjb.mongodb.net/anime_vault?appName=AnimeCluster";

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

// --- CHANGE 3: Dynamic Port for Render ---
// Render will automatically assign a port through process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});