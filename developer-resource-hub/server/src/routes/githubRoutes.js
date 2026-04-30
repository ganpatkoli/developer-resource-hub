import { Router } from "express";
import { Post } from "../models/Post.js";

const router = Router();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24;

function parseRepoFromUrl(link) {
  try {
    const url = new URL(String(link || "").trim());
    if (!url.hostname.includes("github.com")) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(".git", "") };
  } catch {
    return null;
  }
}

router.post("/meta", async (req, res) => {
  const rawUrl = String(req.body?.url || "").trim();
  const parsed = parseRepoFromUrl(rawUrl);
  if (!parsed) {
    return res.status(400).json({ message: "Valid GitHub repo url is required" });
  }

  const cachedPost = await Post.findOne({ type: "repo", link: rawUrl }).select("githubMeta").lean();
  const cachedMeta = cachedPost?.githubMeta || null;
  const isFreshCache =
    cachedMeta?.cachedAt && Date.now() - new Date(cachedMeta.cachedAt).getTime() < CACHE_TTL_MS;
  if (isFreshCache) {
    return res.json({ ...cachedMeta, cacheHit: true });
  }

  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "developer-resource-hub",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const repoRes = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, { headers });
  if (!repoRes.ok) {
    const payload = await repoRes.json().catch(() => ({}));
    if (cachedMeta) {
      return res.json({
        ...cachedMeta,
        cacheHit: true,
        stale: true,
        warning: payload?.message || "GitHub API unavailable, serving cached metadata",
      });
    }
    return res.status(repoRes.status).json({
      message: payload?.message || "Failed to fetch GitHub repo metadata",
      rateLimitRemaining: repoRes.headers.get("x-ratelimit-remaining"),
      rateLimitReset: repoRes.headers.get("x-ratelimit-reset"),
    });
  }

  const data = await repoRes.json();

  let contributors = null;
  try {
    const cRes = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contributors?per_page=1&anon=true`,
      { headers }
    );
    if (cRes.ok) {
      const linkHeader = String(cRes.headers.get("link") || "");
      const lastMatch = linkHeader.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/i);
      if (lastMatch) contributors = Number(lastMatch[1]) || 0;
      else {
        const arr = await cRes.json();
        contributors = Array.isArray(arr) ? arr.length : 0;
      }
    }
  } catch {
    contributors = null;
  }

  const meta = {
    ownerLogin: data.owner?.login || parsed.owner,
    ownerAvatar: data.owner?.avatar_url || "",
    stars: data.stargazers_count ?? null,
    forks: data.forks_count ?? null,
    watchers: data.watchers_count ?? null,
    subscribers: data.subscribers_count ?? null,
    network: data.network_count ?? null,
    language: data.language || "Unknown",
    contributors,
    updatedAt: data.updated_at ? new Date(data.updated_at) : null,
    cachedAt: new Date(),
  };

  await Post.updateMany(
    { type: "repo", link: rawUrl },
    { $set: { githubMeta: meta } }
  );

  return res.json({ ...meta, cacheHit: false });
});

export default router;
