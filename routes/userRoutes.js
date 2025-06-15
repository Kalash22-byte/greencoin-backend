const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authenticateUser = require("../middleware/auth");

router.get("/profile", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const result = await db.query("SELECT name, email, coins FROM users WHERE id = $1", [userId]);
  res.json({ user: result.rows[0] });
});

// ✅ Redeem coins route
router.post("/redeem", authenticateUser, async (req, res) => {
  const userId = req.user.id;
  const { item } = req.body;

  let cost = 0;
  if (item === "sapling") cost = 5;

  const user = await db.query("SELECT coins FROM users WHERE id = $1", [userId]);
  if (user.rows[0].coins < cost) {
    return res.status(400).json({ message: "❌ Not enough coins" });
  }

  await db.query("UPDATE users SET coins = coins - $1 WHERE id = $2", [cost, userId]);
  res.json({ message: `🎉 You redeemed: ${item}` });
});

module.exports = router;
