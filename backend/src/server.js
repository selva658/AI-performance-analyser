const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const aiRoutes = require("./routes/aiRoutes");
app.use(express.json());
app.use("/api/ai", aiRoutes);
app.use(cors());

app.get("/", (req, res) => {
  res.send("AthleteIQ API Running 🚀");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});