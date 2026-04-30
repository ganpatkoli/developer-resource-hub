import { asyncHandler } from "../utils/asyncHandler.js";
import { Post } from "../models/Post.js";
import { UserFavorite } from "../models/UserFavorite.js";
import { UserResource } from "../models/UserResource.js";

export const getMyResources = asyncHandler(async (req, res) => {
  const items = await UserResource.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(items);
});

export const createMyResource = asyncHandler(async (req, res) => {
  const { title, description, link, type } = req.body;
  if (!title?.trim() || !description?.trim() || !link?.trim()) {
    return res.status(400).json({ message: "title, description and link are required" });
  }
  const item = await UserResource.create({
    user: req.userId,
    title: title.trim(),
    description: description.trim(),
    link: link.trim(),
    type: type === "repo" || type === "news" ? type : "other",
  });
  res.status(201).json(item);
});

export const updateMyResource = asyncHandler(async (req, res) => {
  const item = await UserResource.findOne({ _id: req.params.id, user: req.userId });
  if (!item) {
    return res.status(404).json({ message: "Resource not found" });
  }
  const { title, description, link, type } = req.body;
  if (title !== undefined) item.title = String(title).trim();
  if (description !== undefined) item.description = String(description).trim();
  if (link !== undefined) item.link = String(link).trim();
  if (type !== undefined) {
    item.type = type === "repo" || type === "news" ? type : "other";
  }
  await item.save();
  res.json(item);
});

export const deleteMyResource = asyncHandler(async (req, res) => {
  const deleted = await UserResource.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!deleted) {
    return res.status(404).json({ message: "Resource not found" });
  }
  await UserFavorite.deleteMany({ user: req.userId, userResource: deleted._id });
  res.json({ message: "Resource deleted" });
});

export const getMyFavorites = asyncHandler(async (req, res) => {
  const favorites = await UserFavorite.find({ user: req.userId })
    .populate("post")
    .populate("userResource")
    .sort({ createdAt: -1 })
    .lean();

  const mapped = favorites
    .map((f) => {
      if (f.post) return { _id: f._id, kind: "post", item: f.post, createdAt: f.createdAt };
      if (f.userResource)
        return { _id: f._id, kind: "userResource", item: f.userResource, createdAt: f.createdAt };
      return null;
    })
    .filter(Boolean);
  res.json(mapped);
});

export const toggleFavoritePost = asyncHandler(async (req, res) => {
  const { postId } = req.body;
  if (!postId) return res.status(400).json({ message: "postId is required" });
  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ message: "Post not found" });

  const existing = await UserFavorite.findOne({ user: req.userId, post: postId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ favorite: false });
  }
  await UserFavorite.create({ user: req.userId, post: postId });
  return res.json({ favorite: true });
});

export const toggleFavoriteResource = asyncHandler(async (req, res) => {
  const { resourceId } = req.body;
  if (!resourceId) return res.status(400).json({ message: "resourceId is required" });
  const resource = await UserResource.findOne({ _id: resourceId, user: req.userId });
  if (!resource) return res.status(404).json({ message: "Resource not found" });

  const existing = await UserFavorite.findOne({ user: req.userId, userResource: resourceId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ favorite: false });
  }
  await UserFavorite.create({ user: req.userId, userResource: resourceId });
  return res.json({ favorite: true });
});

export const getFavoritePostIds = asyncHandler(async (req, res) => {
  const rows = await UserFavorite.find({ user: req.userId, post: { $ne: null } }).select("post");
  res.json(rows.map((r) => String(r.post)));
});
