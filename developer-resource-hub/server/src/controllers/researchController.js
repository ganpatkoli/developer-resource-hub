import { ResearchSubmission } from "../models/ResearchSubmission.js";
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
  const items = await ResearchSubmission.find().populate("category", "name").sort({ createdAt: -1 }).lean();
  res.json(items);
});

export const getPublicResearchSubmissions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 12));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    ResearchSubmission.find()
      .populate("category", "name")
      .sort({ dateOfSubmission: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ResearchSubmission.countDocuments(),
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
    category,
  });
  res.status(201).json(created);
});

export const getResearchSubmission = asyncHandler(async (req, res) => {
  const item = await ResearchSubmission.findById(req.params.id).populate("category", "name").lean();
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
  const updated = await ResearchSubmission.findByIdAndUpdate(
    req.params.id,
    {
      title: title.trim(),
      description: description.trim(),
      dateOfSubmission: parsedDate,
      publishUrl: publishUrl.trim(),
      documentUrl: documentUrl.trim(),
      keywords: normalizeKeywords(keywords),
      category,
    },
    { new: true, runValidators: true }
  );
  if (!updated) {
    return res.status(404).json({ message: "Research submission not found" });
  }
  res.json(updated);
});

export const deleteResearchSubmission = asyncHandler(async (req, res) => {
  const deleted = await ResearchSubmission.findByIdAndDelete(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Research submission not found" });
  }
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

    const result = await ResearchSubmission.updateOne(
      { publishUrl },
      { $set: { title, description, dateOfSubmission: parsedDate, publishUrl, documentUrl, keywords, category } },
      { upsert: true }
    );
    if (result.upsertedCount) created += 1;
    else if (result.modifiedCount) updated += 1;
    else skipped += 1;
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
  const item = await ResearchSubmission.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!item) {
    return res.status(404).json({ message: "Research submission not found" });
  }
  res.json({ success: true, views: item.views });
});

