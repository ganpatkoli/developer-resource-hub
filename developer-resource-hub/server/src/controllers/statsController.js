import { Op, fn, col, literal } from "sequelize";
import { Post } from "../models/Post.js";
import { Category } from "../models/Category.js";
import { ResearchSubmission } from "../models/ResearchSubmission.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getStats = asyncHandler(async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalRepos,
    totalWebsites,
    totalCategories,
    totalResearch,
    recentRepos,
    recentWebsites,
    recentResearch,
    trendingRepos,
    topViewed,
  ] = await Promise.all([
    Post.count({ where: { type: "repo" } }),
    Post.count({ where: { type: "website" } }),
    Category.count(),
    ResearchSubmission.count(),
    Post.count({ where: { type: "repo", createdAt: { [Op.gte]: weekAgo } } }),
    Post.count({ where: { type: "website", createdAt: { [Op.gte]: weekAgo } } }),
    ResearchSubmission.count({ where: { createdAt: { [Op.gte]: weekAgo } } }),
    Post.findAll({
      where: { 
        type: "repo",
        githubMeta: { [Op.ne]: null }
      },
      include: [{ model: Category, attributes: ["name"] }],
      order: [[literal("githubMeta->>'stars'"), "DESC"]],
      limit: 5
    }),
    Post.findAll({
      include: [{ model: Category, attributes: ["name"] }],
      order: [["views", "DESC"]],
      limit: 5
    }),
  ]);

  const topWebsites = await Post.findAll({
    where: { type: "website" },
    include: [{ model: Category, attributes: ["name"] }],
    order: [["createdAt", "DESC"]],
    limit: 5
  });

  const categoryBreakdown = await Post.findAll({
    where: { type: { [Op.in]: ["repo", "website"] } },
    attributes: [
      "categoryId",
      [fn("COUNT", col("Post.id")), "count"]
    ],
    include: [{ model: Category, attributes: ["name"] }],
    group: ["categoryId", "Category.id"],
    order: [[literal("count"), "DESC"]],
    limit: 6
  });

  const formattedBreakdown = categoryBreakdown.map(b => ({
    name: b.Category?.name || "Unknown",
    count: parseInt(b.get("count"), 10)
  }));

  res.json({
    counts: {
      repos: totalRepos,
      websites: totalWebsites,
      research: totalResearch,
      categories: totalCategories,
      total: totalRepos + totalWebsites + totalResearch,
    },
    recentWeek: {
      repos: recentRepos,
      websites: recentWebsites,
      research: recentResearch,
    },
    trending: {
      repos: trendingRepos,
      websites: topWebsites,
      popular: topViewed,
    },
    categoryBreakdown: formattedBreakdown,
  });
});
