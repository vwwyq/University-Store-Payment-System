const { verify } = require("jsonwebtoken");

module.exports = function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
