// server/index.js

const cors = require('cors');
app.use(cors({ origin: 'https://greencoin-frontend.vercel.app', credentials: true }));

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // You forgot this import
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const treeRoutes = require('./routes/treeRoutes');

dotenv.config(); // Load .env file

const app = express(); // ✅ app is defined here
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS
app.use(cors({
  origin: ['http://localhost:5500', 'https://greencoin-frontend.vercel.app'], // update as needed
  credentials: true
}));

// ✅ Serve static files from public folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// ✅ Logger
app.use((req, res, next) => {
  console.log(`🧾 ${req.method} ${req.originalUrl}`);
  next();
});

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/tree', treeRoutes);

// ✅ Optional: redirect root to login.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
