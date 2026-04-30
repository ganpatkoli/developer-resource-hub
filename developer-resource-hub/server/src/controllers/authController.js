import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/** Admin login — JWT has role: admin (required for /categories and /posts mutations). */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  const admin = await Admin.findOne({ where: { email: email.toLowerCase().trim() } });
  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const match = await bcrypt.compare(password, admin.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  res.json({
    token: signToken(admin.id, "admin"),
    admin: { email: admin.email, id: admin.id },
  });
});

/** Regular user login — for browsing; JWT has role: user. */
export const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const lowerEmail = email.toLowerCase().trim();

  // Check Admin first
  const admin = await Admin.findOne({ where: { email: lowerEmail } });
  if (admin) {
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    return res.json({
      token: signToken(admin.id, "admin"),
      user: { email: admin.email, id: admin.id, role: "admin" },
    });
  }

  // If not admin, check User
  const user = await User.findOne({ where: { email: lowerEmail } });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  if (!user.password) {
    return res.status(401).json({ message: "Use Google/GitHub login for this account" });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  res.json({
    token: signToken(user.id, "user"),
    user: { email: user.email, id: user.id, role: "user" },
  });
});

export const userSignup = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters" });
  }
  const cleanEmail = String(email).toLowerCase().trim();
  const exists = await User.findOne({ where: { email: cleanEmail } });
  if (exists) {
    return res.status(409).json({ message: "User already exists. Please login." });
  }
  const hash = await bcrypt.hash(String(password), 10);
  const user = await User.create({
    email: cleanEmail,
    password: hash
  });
  res.status(201).json({
    token: signToken(user.id, "user"),
    user: { email: user.email, id: user.id },
  });
});

const oauthStateStore = new Map();

const FRONTEND_SUCCESS_URL =
  process.env.OAUTH_SUCCESS_REDIRECT_URL || "http://localhost:5173/oauth/success";
const FRONTEND_FAILURE_URL =
  process.env.OAUTH_FAILURE_REDIRECT_URL || "http://localhost:5173/user/login";

function putOAuthState(provider) {
  const state = crypto.randomBytes(16).toString("hex");
  oauthStateStore.set(state, { provider, createdAt: Date.now() });
  return state;
}

function validateOAuthState(state, provider) {
  const row = oauthStateStore.get(state);
  oauthStateStore.delete(state);
  if (!row) return false;
  if (row.provider !== provider) return false;
  return Date.now() - row.createdAt <= 10 * 60 * 1000;
}

function buildFailureRedirect(message) {
  return `${FRONTEND_FAILURE_URL}?oauthError=${encodeURIComponent(message)}`;
}

function buildSuccessRedirect({ token, user, role }) {
  const q = new URLSearchParams({
    token,
    email: user.email,
    id: String(user.id),
    role: role || "user"
  });
  return `${FRONTEND_SUCCESS_URL}?${q.toString()}`;
}

async function upsertOAuthUser({ email, provider, providerId }) {
  const cleanEmail = String(email).toLowerCase().trim();
  
  // Check if Admin exists with this email
  const admin = await Admin.findOne({ where: { email: cleanEmail } });
  if (admin) {
    return { user: admin, role: "admin" };
  }

  let user = await User.findOne({ where: { email: cleanEmail } });
  if (user) {
    if (provider === "google") {
      user.googleId = providerId;
    } else {
      user.githubId = providerId;
    }
    await user.save();
  } else {
    user = await User.create({
      email: cleanEmail,
      password: null,
      googleId: provider === "google" ? providerId : null,
      githubId: provider === "github" ? providerId : null
    });
  }
  return { user, role: "user" };
}

export const startGoogleOAuth = asyncHandler(async (_req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const callback = process.env.GOOGLE_CALLBACK_URL;
  if (!clientId || !callback) {
    return res.status(500).json({ message: "Google OAuth env vars missing" });
  }
  const state = putOAuthState("google");
  const q = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callback,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${q.toString()}`);
});

export const googleOAuthCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state || !validateOAuthState(String(state), "google")) {
    return res.redirect(buildFailureRedirect("Invalid Google OAuth state"));
  }
  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: String(code),
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirect_uri: process.env.GOOGLE_CALLBACK_URL || "",
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResp.ok) {
    return res.redirect(buildFailureRedirect("Google token exchange failed"));
  }
  const tokenData = await tokenResp.json();
  const profileResp = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!profileResp.ok) {
    return res.redirect(buildFailureRedirect("Google profile fetch failed"));
  }
  const profile = await profileResp.json();
  if (!profile.email) {
    return res.redirect(buildFailureRedirect("Google account email not available"));
  }
  const { user, role } = await upsertOAuthUser({
    email: profile.email,
    provider: "google",
    providerId: String(profile.sub || profile.email),
  });
  const token = signToken(user.id, role);
  return res.redirect(buildSuccessRedirect({ token, user, role }));
});

export const startGithubOAuth = asyncHandler(async (_req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const callback = process.env.GITHUB_CALLBACK_URL;
  if (!clientId || !callback) {
    return res.status(500).json({ message: "GitHub OAuth env vars missing" });
  }
  const state = putOAuthState("github");
  const q = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callback,
    scope: "read:user user:email",
    state,
  });
  return res.redirect(`https://github.com/login/oauth/authorize?${q.toString()}`);
});

export const githubOAuthCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state || !validateOAuthState(String(state), "github")) {
    return res.redirect(buildFailureRedirect("Invalid GitHub OAuth state"));
  }
  const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: String(code),
      client_id: process.env.GITHUB_CLIENT_ID || "",
      client_secret: process.env.GITHUB_CLIENT_SECRET || "",
      redirect_uri: process.env.GITHUB_CALLBACK_URL || "",
    }),
  });
  if (!tokenResp.ok) {
    return res.redirect(buildFailureRedirect("GitHub token exchange failed"));
  }
  const tokenData = await tokenResp.json();
  const accessToken = tokenData.access_token;
  if (!accessToken) {
    return res.redirect(buildFailureRedirect("GitHub access token missing"));
  }

  const profileResp = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "developer-resource-hub",
    },
  });
  if (!profileResp.ok) {
    return res.redirect(buildFailureRedirect("GitHub profile fetch failed"));
  }
  const profile = await profileResp.json();
  let email = profile.email;
  if (!email) {
    const emailsResp = await fetch("https://api.github.com/user/emails", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "developer-resource-hub",
      },
    });
    if (emailsResp.ok) {
      const emails = await emailsResp.json();
      const primary = Array.isArray(emails) ? emails.find((e) => e.primary) : null;
      email = primary?.email || emails?.[0]?.email;
    }
  }
  if (!email) {
    return res.redirect(buildFailureRedirect("GitHub account email not available"));
  }
  const { user, role } = await upsertOAuthUser({
    email,
    provider: "github",
    providerId: String(profile.id || email),
  });
  const token = signToken(user.id, role);
  return res.redirect(buildSuccessRedirect({ token, user, role }));
});

