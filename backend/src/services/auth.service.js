import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/user.model.js";

/**
 * Generate random password (for signup)
 */
function generateRandomPassword() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate reset token (one-time use)
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Signup with auto-generated password and reset token
 * User will receive one-time reset password link via email
 */
export async function signup({ email, name }) {
  const exists = await User.findOne({ email });
  if (exists) throw new Error("EMAIL_TAKEN");
  
  // Generate random password (not sent to user)
  const randomPassword = generateRandomPassword();
  const password_hash = await bcrypt.hash(randomPassword, 12);
  
  // Generate reset token (one-time use, expires in 24 hours)
  const resetToken = generateResetToken();
  const resetTokenExpires = new Date();
  resetTokenExpires.setHours(resetTokenExpires.getHours() + 24);
  
  const user = await User.create({ 
    email, 
    password_hash, 
    name,
    role: "customer",
    resetToken,
    resetTokenExpires
  });
  
  return { user, resetToken };
}

/**
 * Legacy signup (for backward compatibility if needed)
 */
export async function signupWithPassword({ email, password, name }) {
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

/**
 * Forgot password - generate reset token and send email
 */
export async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not (security best practice)
    return null;
  }
  
  // Generate reset token (one-time use, expires in 1 hour)
  const resetToken = generateResetToken();
  const resetTokenExpires = new Date();
  resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);
  
  // Update user with reset token
  user.resetToken = resetToken;
  user.resetTokenExpires = resetTokenExpires;
  await user.save();
  
  return { resetToken };
}

/**
 * Reset password using reset token
 */
export async function resetPassword(resetToken, newPassword) {
  // Find user with valid reset token
  const user = await User.findOne({
    resetToken,
    resetTokenExpires: { $gt: new Date() } // Token not expired
  });
  
  if (!user) {
    throw new Error("INVALID_OR_EXPIRED_TOKEN");
  }
  
  // Hash new password
  const password_hash = await bcrypt.hash(newPassword, 12);
  
  // Update password and clear reset token (one-time use)
  user.password_hash = password_hash;
  user.resetToken = null;
  user.resetTokenExpires = null;
  await user.save();
  
  return user;
}

/**
 * Change password for authenticated user
 */
export async function changePassword(userId, currentPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!user.password_hash) {
    throw new Error("PASSWORD_NOT_SET");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw new Error("INVALID_CURRENT_PASSWORD");
  }

  const password_hash = await bcrypt.hash(newPassword, 12);
  user.password_hash = password_hash;
  await user.save();

  return user;
}