// server/index.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const treeRoutes = require('./routes/treeRoutes');

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Enable CORS for Vercel + localhost (dev)
app.use(cors({
  origin: ['http://localhost:5500', 'https://greencoin-frontend.vercel.app'],
  credentials: true
}));

// ✅ Serve static files (e.g., login.html, CSS, JS)
app.use(express.static(path.join(__dirname, '..', 'public')));

// ✅ Logger (optional)
app.use((req, res, next) => {
  console.log(`🧾 ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tree', treeRoutes);

// ✅ Fallback route (root → login page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// ✅ Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
