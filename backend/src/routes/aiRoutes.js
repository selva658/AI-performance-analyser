const express = require("express");
const multer = require("multer");
const os = require("os");
const fs = require("fs");
const router = express.Router();

const { analyzePlayer, analyzeVideoWithFallback } = require("../ai/geminiService");
const { createAnalysis } = require("../data/analysisStore");
const { createRecommendation } = require("../data/recommendationStore");
const { requireAuth, requireCoach } = require("../middleware/auth");

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 500 * 1024 * 1024 },
});

router.post("/player-analysis", requireAuth, requireCoach, async (req, res) => {
  try {
    console.log("REQ BODY:", req.body);

    const insights = await analyzePlayer(req.body);

    const cleaned = insights
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    res.json(JSON.parse(cleaned));
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message
    });
  }
});

router.post("/video-analysis", requireAuth, requireCoach, upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "A video file is required" });
  }

  let player;
  try {
    player = JSON.parse(req.body.player || "{}");
  } catch {
    return res.status(400).json({ error: "Invalid player data" });
  }

  try {
    const report = await analyzeVideoWithFallback(player, req.file);

    const playerId = req.body.playerId;
    if (playerId) {
      try {
        const analysis = createAnalysis({ playerId, report });
        for (const text of report.recommendations || []) {
          createRecommendation({ playerId, analysisId: analysis.id, text });
        }
      } catch (saveError) {
        console.error("Failed to save analysis to player history:", saveError.message);
      }
    }

    res.json(report);
  } catch (error) {
    console.error(error);
    const status = error?.status || error?.response?.status;
    const message =
      status === 503
        ? "The AI analysis service is currently overloaded. Please try again in a minute."
        : "Video analysis failed. Please try again.";
    res.status(502).json({ error: message });
  } finally {
    fs.unlink(req.file.path, () => {});
  }
});

module.exports = router;