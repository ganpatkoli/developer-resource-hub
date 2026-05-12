import { Op } from "sequelize";
import { Post } from "../models/Post.js";
import { Category } from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const isValidType = (t) => t === "repo" || t === "news" || t === "website";
const isUUID = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

const getNormalizedRowValue = (row, aliases = []) => {
  if (!row || typeof row !== "object") return "";
  const aliasSet = new Set(aliases.map((alias) => String(alias).toLowerCase()));
  const key = Object.keys(row).find((candidate) => aliasSet.has(String(candidate).toLowerCase()));
  if (!key) return "";
  return String(row[key] ?? "").trim();
};

const normalizeLookupText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

const toCategoryLabel = (value) =>
  normalizeLookupText(value)
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const withCategoryAlias = (item) => {
  const plain = item?.toJSON ? item.toJSON() : item;
  if (plain?.Category && !plain.category) {
    plain.category = plain.Category;
  }
  return plain;
};

const getCategoryTypeForPostType = (postType) => {
  // Category model currently supports: repo, website, research
  // News posts are grouped under repo categories for filter compatibility.
  if (postType === "website") return "website";
  return "repo";
};

const buildCategoryKey = (postType, categoryValue) =>
  `${getCategoryTypeForPostType(postType)}::${normalizeLookupText(categoryValue)}`;


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
    include: [{ model: Category, attributes: ["id", "name"] }],
    order: [[sortField, sortOrder]],
    offset,
    limit,
    distinct: true
  });

  const totalPages = Math.ceil(count / limit) || 1;
  res.json({
    data: rows.map(withCategoryAlias),
    page,
    limit,
    total: count,
    totalPages,
  });
});

export const getPost = asyncHandler(async (req, res) => {
  if (!isUUID(req.params.id)) {
    return res.status(404).json({ message: "Invalid post ID format" });
  }
  const post = await Post.findByPk(req.params.id, {
    include: [{ model: Category, attributes: ["id", "name"] }]
  });
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  res.json(withCategoryAlias(post));
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
    include: [{ model: Category, attributes: ["id", "name"] }]
  });
  res.status(201).json(withCategoryAlias(populated));
});

export const updatePost = asyncHandler(async (req, res) => {
  if (!isUUID(req.params.id)) {
    return res.status(404).json({ message: "Invalid post ID format" });
  }
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
    include: [{ model: Category, attributes: ["id", "name"] }]
  });
  res.json(withCategoryAlias(populated));
});

export const deletePost = asyncHandler(async (req, res) => {
  if (!isUUID(req.params.id)) {
    return res.status(404).json({ message: "Invalid post ID format" });
  }
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

  // Fetch all categories to allow matching by Name or ID
  const allCategories = await Category.findAll({ attributes: ["id", "name", "type"] });
  const categoryMap = {}; // `${categoryType}::normalizedName` -> id
  const categoryIdSet = new Set(); // existing IDs

  allCategories.forEach(c => {
    if (c?.id) categoryIdSet.add(c.id);
    if (c?.name) {
      const catType = c.type || "repo";
      const lowerName = String(c.name).toLowerCase();
      const normalizedName = normalizeLookupText(c.name);
      categoryMap[`${catType}::${lowerName}`] = c.id;
      categoryMap[`${catType}::${normalizedName}`] = c.id;
    }
  });

  const isUUID = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors = [];

  for (let index = 0; index < items.length; index += 1) {
    try {
      const row = items[index] || {};
      const title = getNormalizedRowValue(row, ["title", "name"]);
      const description = getNormalizedRowValue(row, ["description", "desc", "details", "summary"]);
      const link = getNormalizedRowValue(row, ["link", "url", "website", "websiteUrl", "websiteURL"]);
      const type = getNormalizedRowValue(row, ["type"]);
      const category = getNormalizedRowValue(row, ["category", "categoryId", "categoryName", "category_slug", "categorySlug", "slug"]);

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
      let resolvedCategoryId = null;
      const normalizedCategory = normalizeLookupText(category);
      const categoryType = getCategoryTypeForPostType(type);
      const categoryKey = buildCategoryKey(type, category);
      const categoryKeyLower = `${categoryType}::${String(category || "").toLowerCase()}`;
      if (isUUID(category) && categoryIdSet.has(category)) {
        resolvedCategoryId = category;
      } else if (categoryMap[categoryKeyLower]) {
        resolvedCategoryId = categoryMap[categoryKeyLower];
      } else if (categoryMap[categoryKey]) {
        resolvedCategoryId = categoryMap[categoryKey];
      } else if (type === "website" || type === "repo" || type === "news") {
        const categoryName = toCategoryLabel(category);
        const [createdCategory] = await Category.findOrCreate({
          where: { name: categoryName, type: categoryType },
          defaults: { name: categoryName, type: categoryType, active: true },
        });
        resolvedCategoryId = createdCategory.id;
        categoryIdSet.add(createdCategory.id);
        categoryMap[`${categoryType}::${categoryName.toLowerCase()}`] = createdCategory.id;
        categoryMap[`${categoryType}::${normalizedCategory}`] = createdCategory.id;
      }

      if (!resolvedCategoryId) {
        errors.push({ index, message: `Category "${category}" not found by ID or Name` });
        skipped += 1;
        continue;
      }

      const [post, isNew] = await Post.findOrCreate({
        where: { link, type },
        defaults: { title, description, link, type, categoryId: resolvedCategoryId }
      });

      if (isNew) {
        created += 1;
      } else {
        await post.update({ title, description, categoryId: resolvedCategoryId });
        updated += 1;
      }
    } catch (err) {
      console.error("Bulk Import Error at index", index, ":", err);
      errors.push({ index, message: err?.message || "Unexpected import error" });
      skipped += 1;
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
  if (!isUUID(req.params.id)) {
    return res.status(404).json({ message: "Invalid post ID format" });
  }
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  post.views += 1;
  await post.save();
  res.json({ success: true, views: post.views });
});

