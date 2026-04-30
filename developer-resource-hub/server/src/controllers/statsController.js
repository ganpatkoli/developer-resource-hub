import { Post } from "../models/Post.js";
import { Category } from "../models/Category.js";
import { ResearchSubmission } from "../models/ResearchSubmission.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getStats = asyncHandler(async (req, res) => {
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
    Post.countDocuments({ type: "repo" }),
    Post.countDocuments({ type: "website" }),
    Category.countDocuments(),
    ResearchSubmission.countDocuments(),
    Post.countDocuments({ type: "repo", createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    Post.countDocuments({ type: "website", createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    ResearchSubmission.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    Post.find({ type: "repo", "githubMeta.stars": { $exists: true, $ne: null } })
      .populate("category", "name")
      .sort({ "githubMeta.stars": -1 })
      .limit(5)
      .lean(),
    Post.find()
      .populate("category", "name")
      .sort({ views: -1 })
      .limit(5)
      .lean(),
  ]);

  const topWebsites = await Post.find({ type: "website" })
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  const categoryBreakdown = await Post.aggregate([
    { $match: { type: { $in: ["repo", "website"] } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "_id",
        as: "cat",
      },
    },
    {
      $project: {
        name: { $arrayElemAt: ["$cat.name", 0] },
        count: 1,
      },
    },
  ]);

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
    categoryBreakdown,
  });
});
