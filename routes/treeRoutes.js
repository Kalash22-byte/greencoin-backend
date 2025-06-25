const express = require("express");
const router = express.Router();
const multer = require("multer");
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");

// ✅ Supabase Setup
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// ✅ Multer memory storage for buffer upload
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Upload Tree Image
router.post("/upload", authenticateUser, upload.single("photo"), async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file received" });
    }

    // unique file name
    const filename = `${Date.now()}-${file.originalname}`;

    // ✅ Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("tree-uploads")
      .upload(filename, file.buffer, {
        contentType: file.mimetype
      });

    if (error) {
      console.error("Supabase upload error:", error.message);
      return res.status(500).json({ error: "Failed to upload to Supabase" });
    }

    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/tree-uploads/${filename}`;

    // ✅ Save to Neon DB
    await db.query(
      "INSERT INTO uploads (user_id, filename, created_at, image_url) VALUES ($1, $2, NOW(), $3)",
      [userId, filename, publicUrl]
    );

    await db.query("UPDATE users SET coins = coins + 1 WHERE id = $1", [userId]);

    const updatedUser = await db.query("SELECT coins FROM users WHERE id = $1", [userId]);

    res.json({
      message: "✅ Tree detected and uploaded!",
      coins: updatedUser.rows[0].coins,
      imageUrl: publicUrl
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Upload History Route
router.get("/history", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      "SELECT image_url, created_at FROM uploads WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    const history = result.rows.map(row => ({
      imageUrl: row.image_url,
      timestamp: row.created_at
    }));

    res.json({ history });

  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
});

module.exports = router;
