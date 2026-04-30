import { Post } from "../models/Post.js";
import { Category } from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isValidType = (t) => t === "repo" || t === "news" || t === "website";

export const getPosts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 10));
  const categoryId = req.query.category;
  const search = req.query.search ? String(req.query.search).trim() : "";
  const type = req.query.type ? String(req.query.type).trim() : "";

  const filter = {};
  if (type && isValidType(type)) {
    filter.type = type;
  }
  if (categoryId) {
    filter.category = categoryId;
  }
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const skip = (page - 1) * limit;
  const sortField = req.query.sort || "createdAt";
  const sortOrder = req.query.order === "asc" ? 1 : -1;

  const [items, total] = await Promise.all([
    Post.find(filter)
      .populate("category", "name")
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;
  res.json({
    data: items,
    page,
    limit,
    total,
    totalPages,
  });
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("category", "name");
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.json(post);
});

export const createPost = asyncHandler(async (req, res) => {
  const { title, description, link, type, category } = req.body;
  if (!title?.trim() || !description?.trim() || !link?.trim() || !type || !category) {
    return res.status(400).json({ message: "title, description, link, type, and category are required" });
  }
  if (!isValidType(type)) {
    return res.status(400).json({ message: 'type must be "repo", "news", or "website"' });
  }
  const cat = await Category.findById(category);
  if (!cat) {
    return res.status(400).json({ message: "Invalid category" });
  }
  const post = await Post.create({
    title: title.trim(),
    description: description.trim(),
    link: link.trim(),
    type,
    category,
  });
  const populated = await Post.findById(post._id).populate("category", "name");
  res.status(201).json(populated);
});

export const updatePost = asyncHandler(async (req, res) => {
  const { title, description, link, type, category } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  if (title !== undefined) post.title = String(title).trim();
  if (description !== undefined) post.description = String(description).trim();
  if (link !== undefined) post.link = String(link).trim();
  if (type !== undefined) {
    if (!isValidType(type)) {
      return res.status(400).json({ message: 'type must be "repo", "news", or "website"' });
    }
    post.type = type;
  }
  if (category !== undefined) {
    const cat = await Category.findById(category);
    if (!cat) {
      return res.status(400).json({ message: "Invalid category" });
    }
    post.category = category;
  }
  await post.save();
  const populated = await Post.findById(post._id).populate("category", "name");
  res.json(populated);
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.json({ message: "Post removed" });
});

export const importPostsBulk = asyncHandler(async (req, res) => {
  const items = req.body?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items array is required" });
  }
  if (items.length > 500) {
    return res.status(400).json({ message: "Maximum 500 items allowed per import" });
  }

  const categoryIds = [...new Set(items.map((item) => String(item?.category || "")).filter(Boolean))];
  const categories = await Category.find({ _id: { $in: categoryIds } }).select("_id").lean();
  const validCategorySet = new Set(categories.map((c) => String(c._id)));

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors = [];

  for (let index = 0; index < items.length; index += 1) {
    const row = items[index] || {};
    const title = String(row.title || "").trim();
    const description = String(row.description || "").trim();
    const link = String(row.link || "").trim();
    const type = String(row.type || "").trim();
    const category = String(row.category || "").trim();

    if (!title || !description || !link || !type || !category) {
      errors.push({ index, message: "title, description, link, type, category are required" });
      skipped += 1;
      continue;
    }
    if (!isValidType(type)) {
      errors.push({ index, message: 'type must be "repo", "news", or "website"' });
      skipped += 1;
      continue;
    }
    if (!validCategorySet.has(category)) {
      errors.push({ index, message: "Invalid category id" });
      skipped += 1;
      continue;
    }

    const result = await Post.updateOne(
      { link, type },
      { $set: { title, description, link, type, category } },
      { upsert: true }
    );

    if (result.upsertedCount) created += 1;
    else if (result.modifiedCount) updated += 1;
    else skipped += 1;
  }

  res.json({
    message: "Import completed",
    total: items.length,
    created,
    updated,
    skipped,
    errors,
  });
});

export const incrementViews = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.json({ success: true, views: post.views });
});

