const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB_PATH = path.join(__dirname, "analyses.json");

function readAll() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeAll(analyses) {
  fs.writeFileSync(DB_PATH, JSON.stringify(analyses, null, 2));
}

function listByPlayer(playerId) {
  return readAll()
    .filter((a) => a.playerId === playerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function createAnalysis({ playerId, report }) {
  const analyses = readAll();
  const analysis = {
    id: crypto.randomUUID(),
    playerId,
    createdAt: new Date().toISOString(),
    report,
  };
  analyses.push(analysis);
  writeAll(analyses);
  return analysis;
}

function deleteAnalysis(id) {
  const analyses = readAll();
  const index = analyses.findIndex((a) => a.id === id);
  if (index === -1) return false;

  analyses.splice(index, 1);
  writeAll(analyses);
  return true;
}

module.exports = { listByPlayer, createAnalysis, deleteAnalysis };
