import { ResearchSubmission } from "../models/ResearchSubmission.js";
import { Category } from "../models/Category.js";
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

export const getResearchSubmissions = asyncHandler(async (_req, res) => {
  const items = await ResearchSubmission.findAll({
    include: [{ model: Category, attributes: ["name"] }],
    order: [["createdAt", "DESC"]]
  });
  res.json(items);
});

export const getPublicResearchSubmissions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 12));
  const offset = (page - 1) * limit;

  const { count, rows } = await ResearchSubmission.findAndCountAll({
    include: [{ model: Category, attributes: ["name"] }],
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
    include: [{ model: Category, attributes: ["name"] }]
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

  for (let index = 0; index < items.length; index += 1) {
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
      errors.push({ index, message: "title, description, dateOfSubmission, publishUrl, documentUrl are required" });
      skipped += 1;
      continue;
    }

    const category = pickField(row, ["category", "categoryId", "category_id"]);

    const [item, isNew] = await ResearchSubmission.findOrCreate({
      where: { publishUrl },
      defaults: { title, description, dateOfSubmission: parsedDate, publishUrl, documentUrl, keywords, categoryId: category }
    });

    if (isNew) {
      created += 1;
    } else {
      await item.update({ title, description, dateOfSubmission: parsedDate, documentUrl, keywords, categoryId: category });
      updated += 1;
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

