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

// ✅ Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Upload Tree Image Route
router.post("/upload", authenticateUser, upload.single("photo"), async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file received" });
    }

    // ✅ Check last upload time (per-user cooldown)
    const lastUpload = await db.query(
      "SELECT created_at FROM uploads WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
      [userId]
    );

    if (lastUpload.rows.length > 0) {
      const lastTime = new Date(lastUpload.rows[0].created_at);
      const now = new Date();
      const diffMinutes = (now - lastTime) / (1000 * 60);
      if (diffMinutes < 5) {
        return res.status(429).json({ error: "Please wait 5 minutes before uploading again." });
      }
    }

    // ✅ Unique filename
    const filename = `${Date.now()}-${file.originalname}`;

    // ✅ Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("tree-uploads")
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
        cacheControl: "3600"
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError.message);
      return res.status(500).json({ error: "Failed to upload to Supabase" });
    }

    // ✅ Get Public URL
    const { data: publicData } = supabase.storage
      .from("tree-uploads")
      .getPublicUrl(filename);

    const publicUrl = publicData.publicUrl;

    // ✅ Insert into DB
    await db.query(
      "INSERT INTO uploads (user_id, filename, created_at, image_url) VALUES ($1, $2, NOW(), $3)",
      [userId, filename, publicUrl]
    );

    // ✅ Update coin count
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
