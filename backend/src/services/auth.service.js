import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

export async function signup({ email, password, name }) {
  const exists = await User.findOne({ email });
  if (exists) throw new Error("EMAIL_TAKEN");
  const password_hash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, password_hash, name });
  return user;
}

export async function validateUser(email, password) {
  const user = await User.findOne({ email });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
}

export function signTokens(payload) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "15m" });
  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" });
  return { accessToken, refreshToken };
}

export function rotateRefresh(oldRefresh) {
  try {
    const decoded = jwt.verify(oldRefresh, process.env.JWT_REFRESH_SECRET);
    return signTokens({ id: decoded.id, email: decoded.email, role: decoded.role });
  } catch (err) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }
}

export function revokeRefresh(refresh) {
  // Dev: bỏ qua DB, coi như client xóa cookie
  return true;
}
