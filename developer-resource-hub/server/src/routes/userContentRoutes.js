import { Router } from "express";
import { requireUser } from "../middleware/authMiddleware.js";
import {
  createMyResource,
  deleteMyResource,
  getFavoritePostIds,
  getMyFavorites,
  getMyResources,
  toggleFavoritePost,
  toggleFavoriteResource,
  updateMyResource,
} from "../controllers/userContentController.js";

const router = Router();

router.use(requireUser);

router.get("/resources", getMyResources);
router.post("/resources", createMyResource);
router.put("/resources/:id", updateMyResource);
router.delete("/resources/:id", deleteMyResource);

router.get("/favorites", getMyFavorites);
router.get("/favorites/post-ids", getFavoritePostIds);
router.post("/favorites/post/toggle", toggleFavoritePost);
router.post("/favorites/resource/toggle", toggleFavoriteResource);

export default router;
