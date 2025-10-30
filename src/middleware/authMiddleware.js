const jwt = require("jsonwebtoken");

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Access token missing" });
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Malformed authorization header" });
  }

  const token = parts[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // log err.message in dev to debug (do not leak secrets to client)
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // decoded is the JWT payload; map the staff id explicitly
    // adjust the property name if your token uses a different key (e.g., decoded.id)
    req.user = decoded;
    req.staff = { id: decoded.staff_id || decoded.id || null };
    req.role = { id: decoded.role || decoded.id || null};
    // optional: reject if staff_id is missing
    if (!req.staff.id) {
      return res.status(401).json({ error: "Token missing staff_id" });
    }


    next();
  });
}

module.exports = authenticateJWT;
