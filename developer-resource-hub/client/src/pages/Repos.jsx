import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Compass, Database, Radio, User, Star,ArrowUpRight  , GitFork, BookOpen, SlidersHorizontal, Settings as SettingsIcon, UserCircle, ChevronDown, Eye } from "lucide-react";
import client, { getUserToken } from "../api/client";
import { useSettings } from "../context/SettingsContext";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import AdBanner from "../components/AdBanner";
import Button from "../components/Button";

function parseGithubRepo(link) {
  try {
    const url = new URL(link);
    if (!url.hostname.includes("github.com")) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(".git", "") };
  } catch {
    return null;
  }
}

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n || 0);
}

const PAGE_SIZE = 20;

const trackView = (id) => {
  if (!id) return;
  client.patch(`/posts/${id}/view`).catch(() => { });
};

export default function ReposPublic() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [filters, setFilters] = useState([]);
  const [postsPayload, setPostsPayload] = useState({ data: [] });
  const [githubMetaMap, setGithubMetaMap] = useState({});
  const [favoritePostIds, setFavoritePostIds] = useState([]);
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();
  const { dark } = useTheme();

  const fetchPosts = useCallback(async (pageToLoad = 1, append = false) => {
    try {
      setLoading(true);
      const params = { limit: PAGE_SIZE, page: pageToLoad, type: "repo" };
      if (search.trim()) params.search = search.trim();
      if (activeFilter !== "ALL") params.category = activeFilter;
      const { data } = await client.get("/posts", { params });
      setPostsPayload(prev => ({
        ...data,
        data: append ? [...prev.data, ...(data.data || [])] : (data.data || []),
      }));
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter]);

  useEffect(() => {
    fetchPosts(1, false);

    // Fetch categories
    async function fetchCategories() {
      try {
        const { data } = await client.get("/categories?type=repo");
        setFilters(data || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    fetchCategories();
  }, [fetchPosts]);

  useEffect(() => {
    if (!getUserToken()) {
      setFavoritePostIds([]);
      return;
    }
    client.get("/user/favorites/post-ids", { authType: "user" })
      .then(res => setFavoritePostIds(res.data || []))
      .catch(() => setFavoritePostIds([]));
  }, []);

  const toggleFavorite = async (postId) => {
    if (!getUserToken()) {
      alert("Please login to add to favorites");
      navigate("/login");
      return;
    }
    try {
      await client.post("/user/favorites/post/toggle", { postId }, { authType: "user" });
      setFavoritePostIds(prev =>
        prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
      );
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  const loadMore = () => {
    if (postsPayload.page < postsPayload.totalPages && !loading) {
      const nextPage = postsPayload.page + 1;
      setPage(nextPage);
      fetchPosts(nextPage, true);
    }
  };

  const posts = postsPayload.data || [];
  const repoCards = useMemo(() => {
    let filtered = posts.filter((p) => p.type === "repo");
    if (activeFilter !== "ALL") {
      filtered = filtered.filter((p) => String(p.category?.id || p.categoryId || "") === String(activeFilter));
    }
    return filtered;
  }, [posts, activeFilter]);

  useEffect(() => {
    if (repoCards.length === 0) return;
    let cancelled = false;
    async function loadMeta() {
      const entries = await Promise.all(
        repoCards.map(async (repoPost) => {
          const parsed = parseGithubRepo(repoPost.link);
          if (!parsed) return null;
          try {
            const { data } = await client.post("/github/meta", { url: repoPost.link });
            return [
              repoPost.id,
              {
                stars: data.stars,
                forks: data.forks,
                language: data.language || "Unknown",
                ownerLogin: data.ownerLogin || parsed.owner,
                ownerAvatar: data.ownerAvatar || "",
                contributors: data.contributors || 0,
              },
            ];
          } catch {
            return null;
          }
        })
      );
      if (cancelled) return;
      const next = {};
      entries.forEach((item) => {
        if (item) next[item[0]] = item[1];
      });
      setGithubMetaMap((prev) => ({ ...prev, ...next }));
    }
    loadMeta();
    return () => {
      cancelled = true;
    };
  }, [repoCards]);



  const renderCards = (isDesktop = false) => {
    return repoCards.map((repo, i) => {
      const meta = githubMetaMap[repo.id] || {};
      const parsed = parseGithubRepo(repo.link);
      const owner = meta.ownerLogin || parsed?.owner || "unknown";
      const repoName = parsed?.repo || repo.title;
      const langColor =
        meta.language === "Rust" ? "bg-fuchsia-400" :
          meta.language === "TypeScript" ? "bg-cyan-400" :
            meta.language === "Python" ? "bg-yellow-400" :
              meta.language === "C++" ? "bg-cyan-400" : "bg-cyan-500";

      const langTextClass =
        meta.language === "Rust" ? "text-fuchsia-400" :
          meta.language === "C++" ? "text-cyan-400" : "text-slate-300";

      const langBorderClass =
        meta.language === "Rust" ? "border-fuchsia-900/30 bg-fuchsia-900/20" :
          meta.language === "C++" ? "border-cyan-900/30 bg-cyan-900/20" : "border-[#1A2333] bg-[#0A1220]";

      return (
        <article key={repo.id || i} className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-500 overflow-hidden ${dark ? "border-[#1A2333] bg-[#111622]/40 backdrop-blur-sm hover:border-[#00dbe9]/50" : "border-slate-200 bg-white shadow-xl shadow-slate-200/50 hover:border-blue-400"} ${isDesktop ? "p-8 h-[360px]" : "p-6 h-[340px]"}`}>
          {/* Decorative Glow */}
          <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${dark ? "bg-cyan-500" : "bg-blue-500"}`} />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl border overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:scale-105 ${dark ? "border-[#1A2333] bg-[#0B0F19]" : "border-slate-100 bg-slate-50"}`}>
                  <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${owner}`} alt="" className="w-8 h-8 opacity-80" />
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className={`font-bold tracking-tight transition-colors group-hover:text-cyan-400 truncate ${isDesktop ? "text-xl" : "text-md"} ${dark ? "text-white" : "text-slate-900"}`}>
                    <span className={dark ? "text-cyan-400" : "text-blue-600"}>{owner}</span> <span className="text-slate-500">/</span> {repoName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-widest ${dark ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" : "bg-blue-50 text-blue-600 border-blue-100"}`}>
                      {repo.category?.name || "ARCHIVE"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">v2.4.1 // STABLE</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleFavorite(repo.id)}
                className={`transition-colors shrink-0 ${favoritePostIds.includes(repo.id) ? "text-yellow-400" : "text-slate-500 hover:text-cyan-400"}`}
              >
                <Star size={20} fill={favoritePostIds.includes(repo.id) ? "currentColor" : "none"} />
              </button>
            </div>

            <p className={`mb-8 ${isDesktop ? "text-[13px]" : "text-[12px]"} leading-relaxed line-clamp-3 font-medium transition-colors ${dark ? "text-slate-400 group-hover:text-slate-300" : "text-slate-600"}`}>
              {repo.description || "No description provided for this technical resource."}
            </p>
          </div>

          <div className="relative z-10">
            <div className={`mb-6 flex flex-wrap items-center gap-y-3 gap-x-6 ${isDesktop ? "text-[11px]" : "text-[10px]"} font-bold text-slate-500 uppercase tracking-widest`}>
              <span className="flex items-center gap-2"><Star size={16} className={dark ? "text-cyan-400/40" : "text-blue-500/40"} /> {formatCount(meta.stars || 0)}</span>
              <span className="flex items-center gap-2"><GitFork size={16} className={dark ? "text-cyan-400/40" : "text-blue-500/40"} /> {formatCount(meta.forks || 0)}</span>
              <span className="flex items-center gap-2"><Eye size={16} className={dark ? "text-emerald-500/40" : "text-emerald-600/40"} /> {formatCount(repo.views || 0)}</span>

              <div className={`flex items-center gap-2.5 rounded-full px-3 py-1.5 border ml-auto ${dark ? "border-cyan-500/10 bg-cyan-500/5 text-cyan-400" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                <span className={`h-2 w-2 rounded-full ${langColor} shadow-[0_0_8px_currentColor]`}></span>
                <span className="uppercase tracking-[0.1em]">{meta.language || "Unknown"}</span>
              </div>
            </div>

            <Button
              as="a"
              href={repo.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackView(repo.id)}
              variant="secondary"
              className="w-full !py-3 !rounded-xl border-cyan-500/30 hover:border-cyan-500"
            >
              VIEW REPOSITORY <ArrowUpRight size={14} className="ml-1" />
            </Button>
          </div>
        </article>
      );
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-[#0B0F19] text-slate-200" : "bg-slate-50 text-slate-900"} font-sans tracking-wide relative overflow-hidden`}>
      {/* Cinematic Gutter Ads */}
      <div className="hidden xl:block fixed left-4 top-1/2 -translate-y-1/2 z-40">
        <AdBanner position="LEFT_GUTTER" variant="skyscraper" />
      </div>
      <div className="hidden xl:block fixed right-4 top-1/2 -translate-y-1/2 z-40">
        <AdBanner position="RIGHT_GUTTER" variant="skyscraper" />
      </div>

      {/* Background Grid Pattern - Only in Dark Mode */}
      {dark && (
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#84949510_1px,transparent_1px),linear-gradient(to_bottom,#84949510_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      )}

      {/* MOBILE LAYOUT */}
      <div className="mx-auto block max-w-md pb-24 lg:hidden">
        {/* Mobile Header */}
        <header className={`flex items-center justify-between border-b px-4 py-4 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300 ${dark ? "border-[#1A2333] bg-[#0B0F19]/90" : "border-slate-200 bg-white/90"}`}>
          <div className="flex items-center gap-2">
            <Database size={16} className={dark ? "text-cyan-400" : "text-blue-600"} />
            <h1 className={`text-[13px] font-black tracking-[0.15em] uppercase ${dark ? "text-cyan-400 shadow-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" : "text-blue-600"}`}>
              CORE REPOS
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className={dark ? "!bg-[#111622] !border-[#1A2333]" : "!bg-slate-100 !border-slate-200"} />
            <Search size={18} className="text-slate-400" />
          </div>
        </header>

        <main className="px-4 py-5 animate-fade-in-up">
          {/* Search Input */}
          <div className={`mb-4 flex items-center gap-2 rounded border px-3 py-2.5 transition-all focus-within:ring-1 ${dark ? "border-[#1A2333] bg-[#111622] focus-within:border-cyan-500/50 focus-within:ring-cyan-500/20" : "border-slate-200 bg-white focus-within:border-blue-400 focus-within:ring-blue-500/10 shadow-sm"}`}>
            <Search size={14} className="text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="QUERY_DATASET_ID..."
              className={`w-full bg-transparent text-[11px] font-medium tracking-wide outline-none placeholder:text-slate-600 uppercase ${dark ? "text-slate-300" : "text-slate-700"}`}
            />
          </div>

          {/* Filters */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-4 px-4">
            <Button
              variant="filter"
              active={activeFilter === "ALL"}
              onClick={() => setActiveFilter("ALL")}
            >
              ALL SYSTEMS
            </Button>
            {filters.map((f) => (
              <Button
                key={f.id}
                variant="filter"
                active={activeFilter === f.id}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.name}
              </Button>
            ))}
          </div>

          {/* Repos List */}
          <div className="space-y-4">
            {repoCards.length > 0 ? (
              renderCards(false)
            ) : (
              <div className={`rounded-xl border p-6 text-center text-sm ${dark ? "border-[#1A2333] bg-[#111622] text-slate-400" : "border-slate-200 bg-white text-slate-600"}`}>
                No repositories found.
              </div>
            )}
          </div>

          {postsPayload.page < postsPayload.totalPages && (
            <div className="mt-8 text-center">
              <Button
                variant="secondary"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? "Decrypting..." : "Load More Repos"}
              </Button>
            </div>
          )}
        </main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 w-full border-t border-[#1A2333] bg-[#0B0F19]/95 backdrop-blur-md z-30 pb-safe">
          <ul className="flex justify-around px-2 py-3">
            <li className="flex flex-col items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-300">
              <Link to="/" className="flex flex-col items-center gap-1.5">
                <Compass size={18} />
                <span className="text-[8px] font-bold tracking-[0.15em] uppercase">Explore</span>
              </Link>
            </li>
            {settings.tabs?.repos !== false && (
              <li className="flex flex-col items-center gap-1.5 cursor-pointer text-cyan-400">
                <Database size={18} />
                <span className="text-[8px] font-bold tracking-[0.15em] uppercase">Repos</span>
              </li>
            )}
            {settings.tabs?.websites !== false && (
              <li className="flex flex-col items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-300">
                <Link to="/websites" className="flex flex-col items-center gap-1.5">
                  <BookOpen size={18} />
                  <span className="text-[8px] font-bold tracking-[0.15em] uppercase">Websites</span>
                </Link>
              </li>
            )}
            {settings.tabs?.research !== false && (
              <li className="flex flex-col items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-300">
                <Link to="/research" className="flex flex-col items-center gap-1.5">
                  <Radio size={18} />
                  <span className="text-[8px] font-bold tracking-[0.15em] uppercase">Research</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className={`mx-auto hidden min-h-screen max-w-[1400px] flex-col lg:flex transition-colors duration-300 bg-transparent`}>

        <main className="flex-1 px-8 py-12 max-w-[1200px] mx-auto w-full animate-fade-in-up">
          <div className="mb-10 text-center">
            <h3 className={`text-[11px] font-black tracking-[0.3em] mb-4 uppercase flex items-center justify-center gap-4 before:content-[''] before:h-[1px] before:w-8 after:content-[''] after:h-[1px] after:w-8 ${dark ? "text-cyan-400 before:bg-cyan-400 after:bg-cyan-400" : "text-cyan-600 before:bg-cyan-600 after:bg-cyan-600"}`}>
              Central Repository Network
            </h3>
            <h2 className={`text-5xl font-black tracking-tight uppercase drop-shadow-md ${dark ? "text-slate-100" : "text-slate-900"}`}>
              REPOSITORIES
            </h2>
          </div>

          <div className="mb-10 flex gap-4">
            <div className={`flex h-14 flex-1 items-center gap-3 rounded-xl px-5 border transition-all focus-within:ring-1 ${dark ? "bg-[#161b22] border-[#3b494b] focus-within:border-[#00dbe9]/50 focus-within:ring-[#00dbe9]/20" : "bg-white border-slate-200 focus-within:border-blue-400 focus-within:ring-blue-500/10 shadow-sm"}`}>
              <Search size={18} className="text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="QUERY REPOSITORIES (E.G. DATASETS, TOOLS, NEURAL-NETS...)"
                className={`w-full bg-transparent text-[13px] tracking-widest outline-none placeholder:text-slate-600 uppercase font-black ${dark ? "text-slate-300" : "text-slate-800"}`}
              />
            </div>
          </div>

          <div className="mb-10 flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
            <Button
              variant="filter"
              active={activeFilter === "ALL"}
              onClick={() => setActiveFilter("ALL")}
            >
              ALL SYSTEMS
            </Button>
            {filters.map((f) => (
              <Button
                key={f.id}
                variant="filter"
                active={activeFilter === f.id}
                onClick={() => setActiveFilter(f.id)}
              >
                {f.name}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {repoCards.length > 0 ? (
              renderCards(true)
            ) : (
              <div className={`col-span-full rounded-xl border p-8 text-center text-sm ${dark ? "border-[#1A2333] bg-[#111622] text-slate-400" : "border-slate-200 bg-white text-slate-600"}`}>
                No repositories found.
              </div>
            )}
          </div>

          {postsPayload.page < postsPayload.totalPages && (
            <div className="flex flex-col items-center justify-center mt-8 pb-10">
              <Button
                variant="secondary"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? "PROCESSING..." : "LOAD MORE ARCHIVES"}
              </Button>
            </div>
          )}
        </main>

       
      </div>

    </div>
  );
}
