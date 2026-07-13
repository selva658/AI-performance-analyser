const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const coachStore = require("../data/coachStore");
const playerStore = require("../data/playerStore");
const { requireAuth } = require("../middleware/auth");

const TOKEN_EXPIRY = "7d";

router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const coach = coachStore.findByEmail(email);
    if (coach && bcrypt.compareSync(password, coach.passwordHash)) {
      const token = jwt.sign(
        { sub: coach.id, role: "coach", name: coach.name },
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY },
      );
      return res.json({ token, user: { id: coach.id, role: "coach", name: coach.name } });
    }

    const player = playerStore.findByEmail(email);
    if (player && player.passwordHash && bcrypt.compareSync(password, player.passwordHash)) {
      const token = jwt.sign(
        { sub: player.id, role: "player", playerId: player.id, name: player.name },
        process.env.JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY },
      );
      return res.json({ token, user: { id: player.id, role: "player", playerId: player.id, name: player.name } });
    }

    res.status(401).json({ error: "Invalid email or password" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/me", requireAuth, (req, res) => {
  const { sub, role, playerId, name } = req.user;
  res.json({ user: { id: sub, role, playerId, name } });
});

module.exports = router;
