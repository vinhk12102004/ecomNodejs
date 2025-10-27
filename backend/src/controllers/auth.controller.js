import * as authService from "../services/auth.service.js";
import User from "../models/user.model.js";

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
