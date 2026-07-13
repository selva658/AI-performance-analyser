const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const DB_PATH = path.join(__dirname, "players.json");

function readAll() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeAll(players) {
  fs.writeFileSync(DB_PATH, JSON.stringify(players, null, 2));
}

// Never send a password hash to a client — every public-facing read goes through this.
function sanitize(player) {
  if (!player) return player;
  const { passwordHash, ...safe } = player;
  return safe;
}

function listPlayers() {
  return readAll().map(sanitize);
}

function getPlayer(id) {
  return sanitize(readAll().find((p) => p.id === id) || null);
}

// Internal-only: used by auth to verify a login, so it must keep passwordHash.
function findByEmail(email) {
  if (!email) return null;
  return readAll().find((p) => p.email && p.email.toLowerCase() === email.toLowerCase()) || null;
}

function createPlayer({ name, age, team, position, notes, email, password }) {
  const players = readAll();
  const player = {
    id: crypto.randomUUID(),
    name,
    age: age ?? null,
    team: team ?? "",
    position: position ?? "",
    notes: notes ?? "",
    email: email ?? "",
    passwordHash: password ? bcrypt.hashSync(password, 10) : null,
    createdAt: new Date().toISOString(),
  };
  players.push(player);
  writeAll(players);
  return sanitize(player);
}

function updatePlayer(id, updates) {
  const players = readAll();
  const index = players.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const { password, ...rest } = updates;
  const passwordHash = password ? bcrypt.hashSync(password, 10) : players[index].passwordHash;

  players[index] = {
    ...players[index],
    ...rest,
    passwordHash,
    id: players[index].id,
    createdAt: players[index].createdAt,
  };
  writeAll(players);
  return sanitize(players[index]);
}

function deletePlayer(id) {
  const players = readAll();
  const index = players.findIndex((p) => p.id === id);
  if (index === -1) return false;

  players.splice(index, 1);
  writeAll(players);
  return true;
}

module.exports = { listPlayers, getPlayer, findByEmail, createPlayer, updatePlayer, deletePlayer };
