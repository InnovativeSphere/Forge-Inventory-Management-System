import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// -----------------------------
// Verify JWT Middleware
// -----------------------------
export const verifyToken = async (req, res) => {
  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return false; // stop further execution
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // decoded contains { id, role, email }
    console.log("Decoded JWT:", decoded);
    return true; // success
  } catch (err) {
    console.error("JWT verification error:", err);
    res.status(401).json({ message: "Invalid token" });
    return false; // stop further execution
  }
};

// -----------------------------
// Admin-only Middleware
// -----------------------------
export const adminOnly = async (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    console.log("Access denied:", req.user);
    res.status(403).json({ message: "Access denied" });
    return false; // stop further execution
  }
  return true; // success
};
