const express = require("express");
const router = express.Router();

const { listAll, listByPlayer, updateStatus, deleteRecommendation } = require("../data/recommendationStore");
const { requireAuth, requireCoach, scopeToOwnPlayer } = require("../middleware/auth");

router.get("/", requireAuth, scopeToOwnPlayer, (req, res) => {
  try {
    const { playerId } = req.query;
    res.json(playerId ? listByPlayer(playerId) : listAll());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id", requireAuth, requireCoach, (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "done"].includes(status)) {
      return res.status(400).json({ error: "status must be 'pending' or 'done'" });
    }
    const updated = updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: "Recommendation not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", requireAuth, requireCoach, (req, res) => {
  try {
    const deleted = deleteRecommendation(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Recommendation not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
