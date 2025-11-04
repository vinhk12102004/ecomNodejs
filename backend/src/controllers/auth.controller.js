import * as authService from "../services/auth.service.js";
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

export async function signup(req, res) {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    const user = await authService.signup({ email, password, name });
    const payload = { id: user._id.toString(), email: user.email, role: user.role };
    const { accessToken, refreshToken } = authService.signTokens(payload);
    
    setRefreshCookie(res, refreshToken);
    
    res.status(201).json({
      user: user.toJSON(),
      accessToken
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
