import { Router } from "express";
import {
  getPublicToolkits,
  getAdminToolkits,
  getPublicToolkitBySlug,
  incrementToolkitViews,
  createToolkit,
  updateToolkit,
  deleteToolkit,
  importToolkitsBulk,
  getToolkitById,
} from "../controllers/toolkitController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/public", getPublicToolkits);
router.get("/public/:slug", getPublicToolkitBySlug);
router.patch("/public/:slug/view", incrementToolkitViews);
router.get("/", requireAdmin, getAdminToolkits);
router.get("/:id", requireAdmin, getToolkitById);
router.post("/", requireAdmin, createToolkit);
router.post("/import", requireAdmin, importToolkitsBulk);
router.put("/:id", requireAdmin, updateToolkit);
router.delete("/:id", requireAdmin, deleteToolkit);

export default router;
