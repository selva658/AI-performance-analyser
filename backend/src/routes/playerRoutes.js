const express = require("express");
const router = express.Router();

const { listPlayers, getPlayer, createPlayer, updatePlayer, deletePlayer } = require("../data/playerStore");
const { requireAuth, requireCoach, scopeToOwnPlayer } = require("../middleware/auth");

router.get("/", requireAuth, requireCoach, (req, res) => {
  try {
    res.json(listPlayers());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", requireAuth, scopeToOwnPlayer, (req, res) => {
  try {
    const player = getPlayer(req.params.id);
    if (!player) return res.status(404).json({ error: "Player not found" });
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", requireAuth, requireCoach, (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Player name is required" });
    }
    const player = createPlayer(req.body);
    res.status(201).json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", requireAuth, requireCoach, (req, res) => {
  try {
    const player = updatePlayer(req.params.id, req.body);
    if (!player) return res.status(404).json({ error: "Player not found" });
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", requireAuth, requireCoach, (req, res) => {
  try {
    const deleted = deletePlayer(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Player not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
