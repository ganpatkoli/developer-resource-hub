import { Category } from "../models/Category.js";
import { Post } from "../models/Post.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCategories = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.type) {
    where.type = req.query.type;
  }
  const hasPaginationParams = req.query.page !== undefined || req.query.limit !== undefined;
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 100));
  const offset = (page - 1) * limit;

  const { count, rows } = await Category.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    offset,
    limit
  });
  if (!hasPaginationParams) {
    return res.json(rows);
  }

  const totalPages = Math.ceil(count / limit) || 1;
  return res.json({
    data: rows,
    page,
    limit,
    total: count,
    totalPages
  });
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  res.json(category);
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, type, active } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Name is required" });
  }
  const category = await Category.create({ 
    name: name.trim(), 
    type: type || 'repo',
    active: active !== undefined ? active : true 
  });
  res.status(201).json(category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, type, active } = req.body;
  
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  
  const updateData = {};
  if (name !== undefined) updateData.name = name.trim();
  if (type !== undefined) updateData.type = type;
  if (active !== undefined) updateData.active = active;
  
  if (updateData.name === "") {
    return res.status(400).json({ message: "Name cannot be empty" });
  }
  
  await category.update(updateData);
  res.json(category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const count = await Post.count({ where: { categoryId: req.params.id } });
  if (count > 0) {
    return res.status(400).json({
      message: `Cannot delete: ${count} post(s) use this category. Reassign or delete them first.`,
    });
  }
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  await category.destroy();
  res.json({ message: "Category removed" });
});
