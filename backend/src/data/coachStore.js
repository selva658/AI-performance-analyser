const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "coaches.json");

function readAll() {
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

function findByEmail(email) {
  if (!email) return null;
  return readAll().find((c) => c.email.toLowerCase() === email.toLowerCase()) || null;
}

module.exports = { findByEmail };
