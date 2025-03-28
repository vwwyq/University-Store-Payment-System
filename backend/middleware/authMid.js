import jwt from "jsonwebtoken";

function authenticateToken(req, res, next) {
  const token = req.cookies?.jwt || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied. No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Middleware error: ", error);
    return res.status(403).json({ error: "Access denied. Invalid token" });
  }
}

export default authenticateToken;
