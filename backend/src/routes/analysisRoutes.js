const express = require("express");
const router = express.Router();

const { listByPlayer, deleteAnalysis } = require("../data/analysisStore");
const { requireAuth, requireCoach, scopeToOwnPlayer } = require("../middleware/auth");

router.get("/", requireAuth, scopeToOwnPlayer, (req, res) => {
  try {
    const { playerId } = req.query;
    if (!playerId) {
      return res.status(400).json({ error: "playerId query param is required" });
    }
    res.json(listByPlayer(playerId));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", requireAuth, requireCoach, (req, res) => {
  try {
    const deleted = deleteAnalysis(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Analysis not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
