const express = require("express");
const router = express.Router();

const { analyzePlayer } = require("../ai/geminiService");

router.post("/player-analysis", async (req, res) => {
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

module.exports = router;