import jwt from "jsonwebtoken";


const authenticateToken = (req, res, next) => {
  console.log("Cookies received:", req.cookies); // Log cookies

  const token = req.cookies.jwtToken;
  if (!token) {
    console.log("No token found in cookies.");
    return res.status(401).json({ error: "Access denied" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified:", verified);
    req.user = { id: verified.id, uid: verified.uid };
    next();
  } catch (err) {
    console.log("JWT verification error:", err);
    res.status(403).json({ error: "Invalid token" });
  }
};
export default authenticateToken;
