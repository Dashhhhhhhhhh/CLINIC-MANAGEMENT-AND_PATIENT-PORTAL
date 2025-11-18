const jwt = require("jsonwebtoken");
const { Staff } = require("../modules/staff/staff.model");


function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Access token missing" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = user;
    
    if (req.user.role === "staff") {
      const staffRecord = await Staff.findOne({
        where: { user_id: req.user.id }
      });
     
      if (!staffRecord) {
        return res.status(403).json({ error: "Forbidden ID."});
      }
      req.staff = staffRecord;
    };

    next();
  });
}

module.exports = authenticateJWT;
