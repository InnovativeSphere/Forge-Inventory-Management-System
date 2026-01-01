import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error("Please set JWT_SECRET in env");

export function signToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}
