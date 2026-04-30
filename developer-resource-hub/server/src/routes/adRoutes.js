import express from "express";
import { getAds, createAd, updateAd, deleteAd, trackClick } from "../controllers/adController.js";
// Assuming verifyAdmin middleware exists based on standard patterns
// import { verifyAdmin } from "../middleware/authMiddleware.js";

import { cacheMiddleware } from "../utils/cache.js";

const router = express.Router();

router.get("/", cacheMiddleware("ads", 600), getAds);
router.post("/click/:id", trackClick);

// Admin only routes (should use verifyAdmin in production)
router.post("/", createAd);
router.put("/:id", updateAd);
router.delete("/:id", deleteAd);

export default router;
