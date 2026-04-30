import { Op } from "sequelize";
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

  const where = {};
  if (type && isValidType(type)) {
    where.type = type;
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (search) {
    where.title = { [Op.iLike]: `%${search}%` };
  }

  const offset = (page - 1) * limit;
  const sortField = req.query.sort || "createdAt";
  const sortOrder = req.query.order === "asc" ? "ASC" : "DESC";

  const { count, rows } = await Post.findAndCountAll({
    where,
    include: [{ model: Category, attributes: ["name"] }],
    order: [[sortField, sortOrder]],
    offset,
    limit,
    distinct: true
  });

  const totalPages = Math.ceil(count / limit) || 1;
  res.json({
    data: rows,
    page,
    limit,
    total: count,
    totalPages,
  });
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findByPk(req.params.id, {
    include: [{ model: Category, attributes: ["name"] }]
  });
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
  const cat = await Category.findByPk(category);
  if (!cat) {
    return res.status(400).json({ message: "Invalid category" });
  }
  const post = await Post.create({
    title: title.trim(),
    description: description.trim(),
    link: link.trim(),
    type,
    categoryId: category,
  });
  const populated = await Post.findByPk(post.id, {
    include: [{ model: Category, attributes: ["name"] }]
  });
  res.status(201).json(populated);
});

export const updatePost = asyncHandler(async (req, res) => {
  const { title, description, link, type, category } = req.body;
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  
  const updateData = {};
  if (title !== undefined) updateData.title = String(title).trim();
  if (description !== undefined) updateData.description = String(description).trim();
  if (link !== undefined) updateData.link = String(link).trim();
  if (type !== undefined) {
    if (!isValidType(type)) {
      return res.status(400).json({ message: 'type must be "repo", "news", or "website"' });
    }
    updateData.type = type;
  }
  if (category !== undefined) {
    const cat = await Category.findByPk(category);
    if (!cat) {
      return res.status(400).json({ message: "Invalid category" });
    }
    updateData.categoryId = category;
  }
  
  await post.update(updateData);
  const populated = await Post.findByPk(post.id, {
    include: [{ model: Category, attributes: ["name"] }]
  });
  res.json(populated);
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  await post.destroy();
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
  const categories = await Category.findAll({ 
    where: { id: { [Op.in]: categoryIds } },
    attributes: ["id"] 
  });
  const validCategorySet = new Set(categories.map((c) => String(c.id)));

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

    const [post, isNew] = await Post.findOrCreate({
      where: { link, type },
      defaults: { title, description, link, type, categoryId: category }
    });

    if (isNew) {
      created += 1;
    } else {
      await post.update({ title, description, categoryId: category });
      updated += 1;
    }
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
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  post.views += 1;
  await post.save();
  res.json({ success: true, views: post.views });
});

