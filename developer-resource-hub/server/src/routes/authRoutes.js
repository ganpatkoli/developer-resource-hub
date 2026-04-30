import { Router } from "express";
import {
  githubOAuthCallback,
  googleOAuthCallback,
  login,
  startGithubOAuth,
  startGoogleOAuth,
  userLogin,
  userSignup,
} from "../controllers/authController.js";

const router = Router();
router.post("/login", login);
router.post("/user/login", userLogin);
router.post("/user/signup", userSignup);
router.get("/google/start", startGoogleOAuth);
router.get("/google/callback", googleOAuthCallback);
router.get("/github/start", startGithubOAuth);
router.get("/github/callback", githubOAuthCallback);

export default router;
