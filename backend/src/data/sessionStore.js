const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB_PATH = path.join(__dirname, "sessions.json");

function readAll() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeAll(sessions) {
  fs.writeFileSync(DB_PATH, JSON.stringify(sessions, null, 2));
}

function listAll() {
  return readAll();
}

function listByPlayer(playerId) {
  return readAll().filter((s) => s.playerId === playerId);
}

function createSession({ playerId, title, scheduledAt, notes, recommendationId }) {
  const sessions = readAll();
  const session = {
    id: crypto.randomUUID(),
    playerId,
    title,
    scheduledAt,
    notes: notes ?? "",
    recommendationId: recommendationId ?? null,
    status: "upcoming",
    createdAt: new Date().toISOString(),
  };
  sessions.push(session);
  writeAll(sessions);
  return session;
}

function updateStatus(id, status) {
  const sessions = readAll();
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return null;

  sessions[index].status = status;
  writeAll(sessions);
  return sessions[index];
}

function deleteSession(id) {
  const sessions = readAll();
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return false;

  sessions.splice(index, 1);
  writeAll(sessions);
  return true;
}

module.exports = { listAll, listByPlayer, createSession, updateStatus, deleteSession };
