import { Router } from "express";
import {
  createResearchSubmission,
  getPublicResearchSubmissions,
  getResearchSubmissions,
  importResearchBulk,
  getResearchSubmission,
  updateResearchSubmission,
  deleteResearchSubmission,
  incrementResearchViews,
} from "../controllers/researchController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/public", getPublicResearchSubmissions);
router.get("/", requireAdmin, getResearchSubmissions);
router.post("/", requireAdmin, createResearchSubmission);
router.post("/import", requireAdmin, importResearchBulk);
router.get("/:id", requireAdmin, getResearchSubmission);
router.put("/:id", requireAdmin, updateResearchSubmission);
router.delete("/:id", requireAdmin, deleteResearchSubmission);
router.patch("/:id/view", incrementResearchViews);

export default router;
