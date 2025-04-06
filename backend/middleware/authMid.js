/*import jwt from "jsonwebtoken";


const authenticateToken = (req, res, next) => {
  console.log("Cookies received:", req.cookies); // Log cookies

  const token = req.cookies.jwtToken;

  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
      console.log("Token found in Authorization header");
    }
  }

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
export default authenticateToken;*/

import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  console.log("Cookies received:", req.cookies); // Log cookies

  let token = req.cookies.jwtToken;

  if (!token) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
      console.log("Token found in Authorization header");
    }
  }

  if (!token) {
    console.log("No token found in cookies or Authorization header.");
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