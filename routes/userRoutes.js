const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");

// ✅ Get logged-in user's profile
router.get("/profile", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      "SELECT name, email, coins, profile_photo FROM users WHERE id = $1",
      [userId]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Update profile photo URL
router.post("/profilephoto", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { photoUrl } = req.body;

  if (!photoUrl) {
    return res.status(400).json({ message: "Photo URL is required." });
  }

  try {
    await db.query(
      "UPDATE users SET profile_photo = $1 WHERE id = $2",
      [photoUrl, userId]
    );
    res.json({ message: "✅ Profile photo updated successfully." });
  } catch (err) {
    console.error("[ProfilePhoto] Error:", err.message);
    res.status(500).json({ message: "Server error." });
  }
});

// ✅ Redeem coins for rewards
router.post("/redeem", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { item } = req.body;

  let cost = 0;
  if (item === "sapling") cost = 5;

  try {
    const user = await db.query("SELECT coins FROM users WHERE id = $1", [userId]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.rows[0].coins < cost) {
      return res.status(400).json({ message: "❌ Not enough coins" });
    }

    await db.query("UPDATE users SET coins = coins - $1 WHERE id = $2", [cost, userId]);
    res.json({ message: `🎉 You redeemed: ${item}` });
  } catch (err) {
    console.error("Error in redeem route:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
