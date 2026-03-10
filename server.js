require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// --- Professional Dynamic CORS ---
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedPatterns = [/vercel\.app$/, /localhost:4200$/];
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('CORS Error: This origin is not allowed'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json());

const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log("✅ Successfully connected to MongoDB!"))
  .catch(err => console.error("❌ Failed to connect to MongoDB:", err));

// --- SCHEMAS ---
const animeSchema = new mongoose.Schema({
  id: Number,
  title: String,
  episodes: Number,
  status: String,
  imageUrl: String,
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);
const Anime = mongoose.model('Anime', animeSchema);

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: "Access Denied." });

  jwt.verify(token, process.env.JWT_SECRET || 'super_secret_fallback_key', (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token." });
    req.user = user; 
    next();
  });
};


// --- AUTH ROUTES ---
app.post('/api/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({ username: req.body.username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered!" });
  } catch (error) {
    res.status(400).json({ message: "Error registering user." });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'super_secret_fallback_key', 
      { expiresIn: '1h' }
    );
    res.json({ token: token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- ANIME ROUTES (OWNER PROTECTED) ---

// 1. GET only MY animes
app.get('/api/animes', authenticateToken, async (req, res) => {
  try {
    const animes = await Anime.find({ 
      owner: new mongoose.Types.ObjectId(req.user.userId) 
    });
    res.json(animes);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 2. POST a new anime
app.post('/api/animes', authenticateToken, async (req, res) => {
  try {
    const newAnime = new Anime({
      ...req.body,
      owner: req.user.userId 
    });
    await newAnime.save(); 
    res.status(201).json(newAnime); 
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 3. PUT (Update) only MY anime
app.put('/api/animes/:id', authenticateToken, async (req, res) => {
  try {
    const animeId = Number(req.params.id);
    
    // ✅ THE FIX: Create a copy of the payload and strip out the immutable _id
    const updateData = { ...req.body };
    delete updateData._id;
    
    const updatedAnime = await Anime.findOneAndUpdate(
      { id: animeId, owner: req.user.userId },
      { $set: updateData }, 
      { new: true } 
    );

    if (!updatedAnime) {
      return res.status(404).json({ message: "Anime not found or unauthorized!" });
    }
    
    res.json(updatedAnime);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// 4. DELETE only MY anime
app.delete('/api/animes/:id', authenticateToken, async (req, res) => {
  try {
    const animeId = Number(req.params.id);
    
    const deletedAnime = await Anime.findOneAndDelete({ 
      id: animeId, 
      owner: req.user.userId 
    });

    if (!deletedAnime) {
      return res.status(404).json({ message: "Anime not found or unauthorized!" });
    }
    res.json({ message: "Deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));