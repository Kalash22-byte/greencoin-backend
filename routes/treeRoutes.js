const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-tree_photo.png`;
    cb(null, filename);
  }
});
const upload = multer({ storage });

router.post("/upload", authenticateUser, upload.single("photo"), async (req, res) => {
  const userId = req.user.id;
  const filename = req.file.filename;

  // cooldown logic skipped here, you can re-add if needed

  await db.query(
    "INSERT INTO uploads (user_id, filename, created_at) VALUES ($1, $2, NOW())",
    [userId, filename]
  );

  await db.query("UPDATE users SET coins = coins + 1 WHERE id = $1", [userId]);

  const updatedUser = await db.query("SELECT coins FROM users WHERE id = $1", [userId]);

  res.json({ message: "✅ Tree detected and uploaded!", coins: updatedUser.rows[0].coins });
});

// ✅ Upload history route
router.get("/history", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const result = await db.query(
    "SELECT filename, created_at FROM uploads WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );

  const history = result.rows.map(row => ({
    imageUrl: `/uploads/${row.filename}`,
    timestamp: row.created_at
  }));

  res.json({ history });
});

module.exports = router;
