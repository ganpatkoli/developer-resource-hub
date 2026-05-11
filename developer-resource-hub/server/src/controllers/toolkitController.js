import { Toolkit } from "../models/Toolkit.js";
import { Op } from "sequelize";
import { asyncHandler } from "../utils/asyncHandler.js";

const normalizeToc = (raw) => {
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim()).filter(Boolean);
  }
  const text = String(raw || "").trim();
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^\d+[\).\s-]+/, "").replace(/^[-*]\s+/, ""))
    .filter(Boolean);
};

export const getPublicToolkits = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 8));
  const offset = (page - 1) * limit;

  const { count, rows } = await Toolkit.findAndCountAll({
    where: { active: true },
    order: [["createdAt", "DESC"]],
    offset,
    limit,
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

export const getPublicToolkitBySlug = asyncHandler(async (req, res) => {
  const toolkit = await Toolkit.findOne({
    where: { slug: req.params.slug, active: true },
  });
  if (!toolkit) {
    return res.status(404).json({ message: "Toolkit not found" });
  }
  res.json(toolkit);
});

export const incrementToolkitViews = asyncHandler(async (req, res) => {
  const toolkit = await Toolkit.findOne({
    where: { slug: req.params.slug, active: true },
  });
  if (!toolkit) {
    return res.status(404).json({ message: "Toolkit not found" });
  }
  toolkit.views += 1;
  await toolkit.save();
  res.json({ success: true, views: toolkit.views });
});

export const getToolkitById = asyncHandler(async (req, res) => {
  const toolkit = await Toolkit.findByPk(req.params.id);
  if (!toolkit) {
    return res.status(404).json({ message: "Toolkit not found" });
  }
  res.json(toolkit);
});

export const getAdminToolkits = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
  const search = req.query.search ? String(req.query.search).trim() : "";
  const offset = (page - 1) * limit;

  const where = {};
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { audience: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
      { content: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await Toolkit.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    offset,
    limit,
  });

  const totalPages = Math.ceil(count / limit) || 1;
  res.json({ data: rows, page, limit, total: count, totalPages });
});

export const createToolkit = asyncHandler(async (req, res) => {
  const { title, audience, slug, description, content, coverImage, accentClass, tableOfContents, active } = req.body || {};
  if (!title?.trim() || !audience?.trim()) {
    return res.status(400).json({ message: "title and audience are required" });
  }
  const nextSlug = String(slug || title)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const created = await Toolkit.create({
    title: title.trim(),
    audience: audience.trim(),
    slug: nextSlug,
    description: description ? String(description).trim() : null,
    content: content ? String(content).trim() : null,
    coverImage: coverImage ? String(coverImage).trim() : null,
    accentClass: accentClass ? String(accentClass).trim() : null,
    tableOfContents: normalizeToc(tableOfContents),
    active: active !== undefined ? Boolean(active) : true,
  });
  res.status(201).json(created);
});

export const updateToolkit = asyncHandler(async (req, res) => {
  const toolkit = await Toolkit.findByPk(req.params.id);
  if (!toolkit) return res.status(404).json({ message: "Toolkit not found" });

  const next = {};
  const fields = ["title", "audience", "description", "content", "coverImage", "accentClass", "active"];
  fields.forEach((f) => {
    if (req.body?.[f] !== undefined) next[f] = req.body[f];
  });
  if (req.body?.tableOfContents !== undefined) {
    next.tableOfContents = normalizeToc(req.body.tableOfContents);
  }
  if (req.body?.slug !== undefined) {
    next.slug = String(req.body.slug || toolkit.slug)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  await toolkit.update(next);
  res.json(toolkit);
});

export const deleteToolkit = asyncHandler(async (req, res) => {
  const toolkit = await Toolkit.findByPk(req.params.id);
  if (!toolkit) return res.status(404).json({ message: "Toolkit not found" });
  await toolkit.destroy();
  res.json({ message: "Toolkit removed" });
});

export const importToolkitsBulk = asyncHandler(async (req, res) => {
  const items = req.body?.items;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items array is required" });
  }
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const errors = [];
  for (let i = 0; i < items.length; i += 1) {
    try {
      const row = items[i] || {};
      const title = String(row.title || "").trim();
      const audience = String(row.audience || "").trim();
      if (!title || !audience) {
        skipped += 1;
        errors.push({ index: i, message: "title and audience are required" });
        continue;
      }
      const slug = String(row.slug || title)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const [toolkit, isNew] = await Toolkit.findOrCreate({
        where: { slug },
        defaults: {
          title,
          audience,
          slug,
          description: row.description || row.summary || null,
          content: row.content || row.body || row.article || row.contents || null,
          coverImage: row.coverImage || null,
          accentClass: row.accentClass || null,
          tableOfContents: normalizeToc(row.tableOfContents || row.toc || row.table_of_contents),
          active: row.active !== undefined ? Boolean(row.active) : true,
        },
      });
      if (isNew) created += 1;
      else {
        const importedToc = normalizeToc(row.tableOfContents || row.toc || row.table_of_contents);
        await toolkit.update({
          title,
          audience,
          description: row.description || row.summary || toolkit.description,
          content: row.content || row.body || row.article || row.contents || toolkit.content,
          coverImage: row.coverImage || toolkit.coverImage,
          accentClass: row.accentClass || toolkit.accentClass,
          tableOfContents: importedToc.length > 0 ? importedToc : toolkit.tableOfContents,
          active: row.active !== undefined ? Boolean(row.active) : toolkit.active,
        });
        updated += 1;
      }
    } catch (err) {
      skipped += 1;
      errors.push({ index: i, message: err?.message || "Unexpected import error" });
    }
  }
  res.json({ message: "Toolkit import completed", total: items.length, created, updated, skipped, errors });
});
