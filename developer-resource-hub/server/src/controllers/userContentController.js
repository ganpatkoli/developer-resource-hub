import { Op } from "sequelize";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Post } from "../models/Post.js";
import { UserFavorite } from "../models/UserFavorite.js";
import { UserResource } from "../models/UserResource.js";

export const getMyResources = asyncHandler(async (req, res) => {
  const items = await UserResource.findAll({ 
    where: { userId: req.userId },
    order: [["createdAt", "DESC"]]
  });
  res.json(items);
});

export const createMyResource = asyncHandler(async (req, res) => {
  const { title, description, link, type } = req.body;
  if (!title?.trim() || !description?.trim() || !link?.trim()) {
    return res.status(400).json({ message: "title, description and link are required" });
  }
  const item = await UserResource.create({
    userId: req.userId,
    title: title.trim(),
    description: description.trim(),
    link: link.trim(),
    type: type === "repo" || type === "news" ? type : "other",
  });
  res.status(201).json(item);
});

export const updateMyResource = asyncHandler(async (req, res) => {
  const item = await UserResource.findOne({ where: { id: req.params.id, userId: req.userId } });
  if (!item) {
    return res.status(404).json({ message: "Resource not found" });
  }
  const { title, description, link, type } = req.body;
  
  const updateData = {};
  if (title !== undefined) updateData.title = String(title).trim();
  if (description !== undefined) updateData.description = String(description).trim();
  if (link !== undefined) updateData.link = String(link).trim();
  if (type !== undefined) {
    updateData.type = type === "repo" || type === "news" ? type : "other";
  }
  
  await item.update(updateData);
  res.json(item);
});

export const deleteMyResource = asyncHandler(async (req, res) => {
  const item = await UserResource.findOne({ where: { id: req.params.id, userId: req.userId } });
  if (!item) {
    return res.status(404).json({ message: "Resource not found" });
  }
  
  await UserFavorite.destroy({ where: { userId: req.userId, userResourceId: item.id } });
  await item.destroy();
  
  res.json({ message: "Resource deleted" });
});

export const getMyFavorites = asyncHandler(async (req, res) => {
  const favorites = await UserFavorite.findAll({ 
    where: { userId: req.userId },
    include: [
      { model: Post, required: false },
      { model: UserResource, required: false }
    ],
    order: [["createdAt", "DESC"]]
  });

  const mapped = favorites
    .map((f) => {
      if (f.Post) return { id: f.id, kind: "post", item: f.Post, createdAt: f.createdAt };
      if (f.UserResource)
        return { id: f.id, kind: "userResource", item: f.UserResource, createdAt: f.createdAt };
      return null;
    })
    .filter(Boolean);
  res.json(mapped);
});

export const toggleFavoritePost = asyncHandler(async (req, res) => {
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ message: "postId is required" });
  const post = await Post.findByPk(postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const existing = await UserFavorite.findOne({ where: { userId: req.userId, postId: postId } });
  if (existing) {
    await existing.destroy();
    return res.json({ favorite: false });
  }
  await UserFavorite.create({ userId: req.userId, postId: postId });
  return res.json({ favorite: true });
});

export const toggleFavoriteResource = asyncHandler(async (req, res) => {
  const { resourceId } = req.body;
  if (!resourceId) return res.status(400).json({ message: "resourceId is required" });
  const resource = await UserResource.findOne({ where: { id: resourceId, userId: req.userId } });
  if (!resource) return res.status(404).json({ message: "Resource not found" });

  const existing = await UserFavorite.findOne({ where: { userId: req.userId, userResourceId: resourceId } });
  if (existing) {
    await existing.destroy();
    return res.json({ favorite: false });
  }
  await UserFavorite.create({ userId: req.userId, userResourceId: resourceId });
  return res.json({ favorite: true });
});

export const getFavoritePostIds = asyncHandler(async (req, res) => {
  const rows = await UserFavorite.findAll({ 
    where: { 
      userId: req.userId, 
      postId: { [Op.ne]: null } 
    },
    attributes: ["postId"]
  });
  res.json(rows.map((r) => String(r.postId)));
});
