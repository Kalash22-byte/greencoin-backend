const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 🌱 Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const treeRoutes = require('./routes/treeRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔐 Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌐 Serve frontend static files (public folder)
app.use(express.static(path.join(__dirname, '..', 'public')));

// 📦 API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tree', treeRoutes);

// 🖼 Serve uploaded images from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔁 Root Test Route
app.get('/', (req, res) => {
  res.send('🌱 GreenCoin API is running!');
});

// 🚀 Start server
app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
