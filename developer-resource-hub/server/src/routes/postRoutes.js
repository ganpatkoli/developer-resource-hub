import { Router } from "express";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  importPostsBulk,
  incrementViews,
} from "../controllers/postController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getPosts);
router.post("/import", requireAdmin, importPostsBulk);
router.get("/:id", getPost);
router.post("/", requireAdmin, createPost);
router.put("/:id", requireAdmin, updatePost);
router.delete("/:id", requireAdmin, deletePost);
router.patch("/:id/view", incrementViews);

export default router;
