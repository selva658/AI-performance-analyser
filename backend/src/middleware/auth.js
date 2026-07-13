const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireCoach(req, res, next) {
  if (req.user.role !== "coach") {
    return res.status(403).json({ error: "Coach access required" });
  }
  next();
}

// For player-scoped routes (own player record, own analyses/recommendations/sessions):
// a coach may request anything; a player may only request their own playerId, and a
// request for the whole collection (no playerId at all) is treated as not-theirs.
function scopeToOwnPlayer(req, res, next) {
  if (req.user.role !== "player") return next();

  const targetId = req.params.id || req.query.playerId;
  if (!targetId || targetId !== req.user.playerId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

module.exports = { requireAuth, requireCoach, scopeToOwnPlayer };
