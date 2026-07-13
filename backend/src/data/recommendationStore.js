const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB_PATH = path.join(__dirname, "recommendations.json");

function readAll() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeAll(recommendations) {
  fs.writeFileSync(DB_PATH, JSON.stringify(recommendations, null, 2));
}

function listAll() {
  return readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function listByPlayer(playerId) {
  return listAll().filter((r) => r.playerId === playerId);
}

function createRecommendation({ playerId, analysisId, text }) {
  const recommendations = readAll();
  const recommendation = {
    id: crypto.randomUUID(),
    playerId,
    analysisId,
    text,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  recommendations.push(recommendation);
  writeAll(recommendations);
  return recommendation;
}

function updateStatus(id, status) {
  const recommendations = readAll();
  const index = recommendations.findIndex((r) => r.id === id);
  if (index === -1) return null;

  recommendations[index].status = status;
  writeAll(recommendations);
  return recommendations[index];
}

function deleteRecommendation(id) {
  const recommendations = readAll();
  const index = recommendations.findIndex((r) => r.id === id);
  if (index === -1) return false;

  recommendations.splice(index, 1);
  writeAll(recommendations);
  return true;
}

module.exports = { listAll, listByPlayer, createRecommendation, updateStatus, deleteRecommendation };
