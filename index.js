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

// ✅ Enable CORS for both Vercel and local dev
app.use(cors({
  origin: ['http://localhost:5500', 'https://greencoin-frontend.vercel.app'],
  credentials: true
}));

// ✅ Built-in body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve frontend static files from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// ✅ Optional request logger
app.use((req, res, next) => {
  console.log(`🧾 ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tree', treeRoutes);

// ✅ Default fallback route (root = login page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});