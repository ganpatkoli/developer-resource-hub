import { ResearchSubmission } from "../models/ResearchSubmission.js";
import { Category } from "../models/Category.js";
import { Op } from "sequelize";
import { asyncHandler } from "../utils/asyncHandler.js";

function normalizeKeywords(raw) {
  if (Array.isArray(raw)) return raw.map((k) => String(k).trim()).filter(Boolean);
  return String(raw || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

function pickField(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) return row[key];
  }
  return undefined;
}

function parseDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const getResearchSubmissions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
  const offset = (page - 1) * limit;
  const categoryId = req.query.category ? String(req.query.category).trim() : "";
  const search = req.query.search ? String(req.query.search).trim() : "";

  const where = {};
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await ResearchSubmission.findAndCountAll({
    where,
    include: [{ model: Category, attributes: ["id", "name"] }],
    order: [["createdAt", "DESC"]],
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
    totalPages
  });
});

export const getPublicResearchSubmissions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 12));
  const offset = (page - 1) * limit;

  const { count, rows } = await ResearchSubmission.findAndCountAll({
    include: [{ model: Category, attributes: ["id", "name"] }],
    order: [["dateOfSubmission", "DESC"], ["createdAt", "DESC"]],
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

export const createResearchSubmission = asyncHandler(async (req, res) => {
  const { title, description, dateOfSubmission, publishUrl, documentUrl, keywords, category } = req.body || {};
  const parsedDate = parseDate(dateOfSubmission);
  if (!title?.trim() || !description?.trim() || !publishUrl?.trim() || !documentUrl?.trim() || !parsedDate) {
    return res.status(400).json({ message: "title, description, dateOfSubmission, publishUrl, documentUrl are required" });
  }
  const created = await ResearchSubmission.create({
    title: title.trim(),
    description: description.trim(),
    dateOfSubmission: parsedDate,
    publishUrl: publishUrl.trim(),
    documentUrl: documentUrl.trim(),
    keywords: normalizeKeywords(keywords),
    categoryId: category,
  });
  res.status(201).json(created);
});

export const getResearchSubmission = asyncHandler(async (req, res) => {
  const item = await ResearchSubmission.findByPk(req.params.id, {
    include: [{ model: Category, attributes: ["id", "name"] }]
  });
  if (!item) {
    return res.status(404).json({ message: "Research submission not found" });
  }
  res.json({ data: item });
});

export const updateResearchSubmission = asyncHandler(async (req, res) => {
  const { title, description, dateOfSubmission, publishUrl, documentUrl, keywords, category } = req.body || {};
  const parsedDate = parseDate(dateOfSubmission);
  if (!title?.trim() || !description?.trim() || !publishUrl?.trim() || !documentUrl?.trim() || !parsedDate) {
    return res.status(400).json({ message: "title, description, dateOfSubmission, publishUrl, documentUrl are required" });
  }
  const item = await ResearchSubmission.findByPk(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Research submission not found" });
  }
  
  await item.update({
    title: title.trim(),
    description: description.trim(),
    dateOfSubmission: parsedDate,
    publishUrl: publishUrl.trim(),
    documentUrl: documentUrl.trim(),
    keywords: normalizeKeywords(keywords),
    categoryId: category,
  });
  
  res.json(item);
});

export const deleteResearchSubmission = asyncHandler(async (req, res) => {
  const item = await ResearchSubmission.findByPk(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Research submission not found" });
  }
  await item.destroy();
  res.json({ message: "Research submission deleted" });
});

export const importResearchBulk = asyncHandler(async (req, res) => {
  const items = req.body?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items array is required" });
  }
  if (items.length > 500) {
    return res.status(400).json({ message: "Maximum 500 items allowed per import" });
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors = [];

  // Pre-fetch categories for faster lookup
  const allCats = await Category.findAll({ where: { type: "research" } });
  const catMap = {};
  allCats.forEach(c => {
    if (c.id) catMap[String(c.id).toLowerCase()] = c.id;
    if (c.name) catMap[String(c.name).toLowerCase()] = c.id;
  });

  for (let index = 0; index < items.length; index += 1) {
    try {
      const row = items[index] || {};
      const title = String(
        pickField(row, ["title", "paperTitle", "paper_title", "paper title"]) || ""
      ).trim();
      const description = String(
        pickField(row, ["description", "abstract", "summary"]) || ""
      ).trim();
      const publishUrl = String(
        pickField(row, ["publishUrl", "publishURL", "publish_url", "publish url", "publishedUrl", "url"]) || ""
      ).trim();
      const documentUrl = String(
        pickField(row, ["documentUrl", "documentURL", "document_url", "document url", "docUrl", "pdfUrl", "pdf_url"]) || ""
      ).trim();
      const parsedDate = parseDate(
        pickField(row, ["dateOfSubmission", "submissionDate", "submission_date", "date", "dateOfSubmit", "date of submission"])
      );
      const keywords = normalizeKeywords(
        pickField(row, ["keywords", "keyword", "tags", "tag"])
      );

      if (!title || !description || !publishUrl || !documentUrl || !parsedDate) {
        errors.push({ index, message: "Missing required fields (title, abstract, URLs, or date)" });
        skipped += 1;
        continue;
      }

      let categoryId = pickField(row, ["category", "categoryId", "category_id", "category_name"]);
      if (categoryId) {
        const lookup = String(categoryId).trim();
        const lookupLower = lookup.toLowerCase();
        
        if (catMap[lookupLower]) {
          categoryId = catMap[lookupLower];
        } else if (lookup && lookup.length > 1) {
          // Auto-create category if it doesn't exist
          try {
            const newCat = await Category.create({
              name: lookup,
              type: "research",
              active: true
            });
            categoryId = newCat.id;
            catMap[lookupLower] = categoryId;
            catMap[String(categoryId).toLowerCase()] = categoryId;
          } catch (catErr) {
            console.error("Failed to auto-create category:", catErr);
            categoryId = allCats.length > 0 ? allCats[0].id : null;
          }
        } else {
          categoryId = allCats.length > 0 ? allCats[0].id : null;
        }
      }

      // If no category found/created, default to first available research category
      if (!categoryId && allCats.length > 0) {
        categoryId = allCats[0].id;
      }

      const [item, isNew] = await ResearchSubmission.findOrCreate({
        where: { publishUrl },
        defaults: { 
          title, 
          description, 
          dateOfSubmission: parsedDate, 
          publishUrl, 
          documentUrl, 
          keywords, 
          categoryId 
        }
      });

      if (isNew) {
        created += 1;
      } else {
        await item.update({ title, description, dateOfSubmission: parsedDate, documentUrl, keywords, categoryId });
        updated += 1;
      }
    } catch (err) {
      console.error(`Bulk Import Error at index ${index}:`, err);
      errors.push({ index, message: err.message || "Database operation failed" });
      skipped += 1;
    }
  }

  res.json({
    message: "Research import completed",
    total: items.length,
    created,
    updated,
    skipped,
    errors,
  });
});

export const incrementResearchViews = asyncHandler(async (req, res) => {
  const item = await ResearchSubmission.findByPk(req.params.id);
  if (!item) {
    return res.status(404).json({ message: "Research submission not found" });
  }
  item.views += 1;
  await item.save();
  res.json({ success: true, views: item.views });
});

