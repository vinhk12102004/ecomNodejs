import * as authService from "../services/auth.service.js";
import * as emailService from "../services/email.service.js";
import User from "../models/user.model.js";
import { OAuth2Client } from "google-auth-library";

function setRefreshCookie(res, token) {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

/**
 * Signup with auto-generated password and one-time reset link
 * User will be automatically logged in after signup
 * User will receive welcome email with reset password link
 */
export async function signup(req, res) {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    // Signup with auto-generated password and reset token
    const { user, resetToken } = await authService.signup({ email, name });
    
    // Send welcome email with reset password link (async, don't wait)
    emailService.sendWelcomeEmail(user.email, resetToken, user.name).catch(err => {
      console.error('Failed to send welcome email:', err);
      // Don't fail the signup if email fails
    });
    
    // Auto-login after signup
    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const { accessToken, refreshToken } = authService.signTokens(payload);
    
    setRefreshCookie(res, refreshToken);
    
    res.status(201).json({
      user: user.toJSON(),
      accessToken,
      message: "Account created successfully. Please check your email to set your password."
    });
  } catch (err) {
    if (err.message === "EMAIL_TAKEN") {
      return res.status(409).json({ error: "Email already registered" });
    }
    res.status(500).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    const user = await authService.validateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const { accessToken, refreshToken } = authService.signTokens(payload);
    
    setRefreshCookie(res, refreshToken);
    
    res.json({
      user: user.toJSON(),
      accessToken
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function refresh(req, res) {
  try {
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({ error: "No refresh token provided" });
    }
    
    const { accessToken, refreshToken: newRefreshToken } = authService.rotateRefresh(refreshToken);
    setRefreshCookie(res, newRefreshToken);
    
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

export async function logout(req, res) {
  res.clearCookie("refresh_token", { path: "/" });
  res.json({ message: "Logged out successfully" });
}

export async function me(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * POST /auth/google
 * Body: { idToken }
 */
/**
 * Forgot password - send reset password link via email
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    // Generate reset token (don't reveal if user exists or not for security)
    const result = await authService.forgotPassword(email);
    
    // Always return success message (don't reveal if user exists)
    if (result) {
      // Send reset password email (async, don't wait)
      emailService.sendPasswordResetEmail(email, result.resetToken).catch(err => {
        console.error('Failed to send password reset email:', err);
        // Don't fail if email fails
      });
    }
    
    // Always return success (security best practice - don't reveal if email exists)
    res.json({ 
      message: "If an account with that email exists, a password reset link has been sent to your email."
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Reset password using reset token from email
 */
export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    
    // Reset password using token
    const user = await authService.resetPassword(token, password);
    
    res.json({ 
      message: "Password reset successfully. You can now login with your new password."
    });
  } catch (err) {
    if (err.message === "INVALID_OR_EXPIRED_TOKEN") {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }
    res.status(500).json({ error: err.message });
  }
}

/**
 * Change password for authenticated user
 */
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All password fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New password confirmation does not match" });
    }

    await authService.changePassword(req.user.id, currentPassword, newPassword);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    if (err.message === "INVALID_CURRENT_PASSWORD") {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    if (err.message === "PASSWORD_NOT_SET") {
      return res.status(400).json({ error: "Password is not set for this account" });
    }
    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ error: "User not found" });
    }
    console.error("changePassword error", err);
    res.status(500).json({ error: "Unable to change password right now" });
  }
}

export async function googleLogin(req, res) {
  try {
    const { idToken } = req.body || {};
    if (!idToken) return res.status(400).json({ error: "idToken is required" });

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: "Missing GOOGLE_CLIENT_ID" });

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();

    const email = payload?.email;
    const name = payload?.name || email?.split("@")[0] || "Google User";
    const sub = payload?.sub;
    if (!email || !sub) return res.status(400).json({ error: "Invalid Google token" });

    // Find or create
    let user = await User.findOne({ email });
    if (user) {
      const updates = {};
      if (!user.oauthProvider) updates.oauthProvider = "google";
      if (!user.oauthSub) updates.oauthSub = sub;
      if (Object.keys(updates).length) {
        user = await User.findByIdAndUpdate(user._id, updates, { new: true });
      }
    } else {
      user = await User.create({
        email,
        name,
        oauthProvider: "google",
        oauthSub: sub,
        // password_hash omitted for OAuth accounts
      });
    }

    const tokenPayload = { id: user._id.toString(), email: user.email, role: user.role };
    const { accessToken, refreshToken } = authService.signTokens(tokenPayload);
    setRefreshCookie(res, refreshToken);

    res.json({ user: user.toJSON(), accessToken });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}
