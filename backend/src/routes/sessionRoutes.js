const express = require("express");
const router = express.Router();

const { listAll, listByPlayer, createSession, updateStatus, deleteSession } = require("../data/sessionStore");
const { requireAuth, requireCoach, scopeToOwnPlayer } = require("../middleware/auth");

router.get("/", requireAuth, scopeToOwnPlayer, (req, res) => {
  try {
    const { playerId } = req.query;
    res.json(playerId ? listByPlayer(playerId) : listAll());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", requireAuth, requireCoach, (req, res) => {
  try {
    const { playerId, title, scheduledAt } = req.body;
    if (!playerId || !title || !scheduledAt) {
      return res.status(400).json({ error: "playerId, title, and scheduledAt are required" });
    }
    const session = createSession(req.body);
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id", requireAuth, requireCoach, (req, res) => {
  try {
    const { status } = req.body;
    if (!["upcoming", "completed"].includes(status)) {
      return res.status(400).json({ error: "status must be 'upcoming' or 'completed'" });
    }
    const updated = updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: "Session not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", requireAuth, requireCoach, (req, res) => {
  try {
    const deleted = deleteSession(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Session not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
