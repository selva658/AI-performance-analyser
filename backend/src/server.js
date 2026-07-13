const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const aiRoutes = require("./routes/aiRoutes");
const playerRoutes = require("./routes/playerRoutes");
const analysisRoutes = require("./routes/analysisRoutes");
const recommendationRoutes = require("./routes/recommendationRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const authRoutes = require("./routes/authRoutes");
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/analyses", analysisRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/sessions", sessionRoutes);


app.get("/", (req, res) => {
  res.send("AthleteIQ API Running 🚀");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});