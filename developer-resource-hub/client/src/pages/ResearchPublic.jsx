import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, Compass, Database, Radio, BookOpen, SlidersHorizontal, Settings as SettingsIcon, UserCircle, ChevronDown, Download, Bookmark, Lock, BrainCircuit, Rocket, Eye, Star } from "lucide-react";
import client, { getUserToken } from "../api/client";
import { useSettings } from "../context/SettingsContext";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import AdBanner from "../components/AdBanner";
import Button from "../components/Button";

const trackView = (id) => {
  if (!id) return;
  client.patch(`/research/${id}/view`).catch(() => { });
};

export default function ResearchPublic() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [favoritePostIds, setFavoritePostIds] = useState([]);
  const navigate = useNavigate();
  const [filters, setFilters] = useState([]);
  const [researchPayload, setResearchPayload] = useState({ data: [], page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const { settings } = useSettings();
  const { dark } = useTheme();

  const fetchResearch = useCallback(async (pageToLoad = 1, append = false) => {
    try {
      setLoading(true);
      const { data } = await client.get("/research/public", { params: { limit: 12, page: pageToLoad } });
      setResearchPayload(prev => ({
        ...data,
        data: append ? [...prev.data, ...(data.data || [])] : (data.data || []),
      }));
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResearch(1, false);

    async function fetchCategories() {
      try {
        const { data } = await client.get("/categories?type=research");
        setFilters(data || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    fetchCategories();
  }, [fetchResearch]);

  const loadMore = () => {
    if (researchPayload.page < researchPayload.totalPages && !loading) {
      fetchResearch(researchPayload.page + 1, true);
    }
  };

  const researchItems = useMemo(() => {
    let filtered = researchPayload.data || [];
    if (activeFilter !== "ALL") {
      filtered = filtered.filter((p) => String(p.category?.id || p.categoryId || "") === String(activeFilter));
    }
    return filtered;
  }, [researchPayload.data, activeFilter]);

  const getDummyIcon = (idx) => {
    const icons = [<Lock size={18} className="text-cyan-400" />, <BrainCircuit size={18} className="text-fuchsia-400" />, <Rocket size={18} className="text-cyan-400" />];
    return icons[idx % icons.length];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "DEC 2024";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "DEC 2024";
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', day: 'numeric' }).toUpperCase();
  };

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

  const scholarlySchema = useMemo(() => {
    if (!researchItems.length) return null;
    return {
      "@context": "https://schema.org",
      "@graph": researchItems.map((paper) => ({
        "@type": "ScholarlyArticle",
        "headline": paper.title,
        "description": paper.description,
        "datePublished": paper.dateOfSubmission,
        "author": {
          "@type": "Organization",
          "name": "AI Guardian Research"
        },
        "keywords": (paper.keywords || []).join(", "),
        "url": paper.documentUrl || "https://aiguardian.cloud/research"
      }))
    };
  }, [researchItems]);

  const seoTitle = researchPayload.total > 0 
    ? `${researchPayload.total}+ Research Archives | AI Guardian Cloud`
    : "Neural Research Archive | AI Guardian Cloud";

  const seoDesc = researchItems.length > 0
    ? `Explore the latest technical research: ${researchItems[0].title}. Total ${researchPayload.total} indexed whitepapers.`
    : "Access peer-reviewed research, technical whitepapers, and cryptographic studies in the AI Guardian Neural Archive.";

  const renderCards = (isDesktop = false) => {
    if (researchItems.length === 0 && !loading) {
      return (
        <div className="col-span-full py-20 text-center">
          <Database size={48} className="mx-auto mb-4 text-slate-600 opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">No Research Archives Available</p>
        </div>
      );
    }

    const cardsToRender = researchItems;

    return cardsToRender.map((paper, i) => {
      const title = paper.title || paper.paperTitle;
      const desc = paper.description || "";
      const date = formatDate(paper.dateOfSubmission);
      const author = "SYSTEM ARCHIVIST";
      const tag = (paper.keywords && paper.keywords[0]) ? paper.keywords[0].toUpperCase() : "RESEARCH";
      const mobileTags = ["PEER REVIEWED"];

      if (isDesktop) {
        return (
          <article key={paper.id || i} className={`rounded-xl border ${dark ? "border-[#1A2333] bg-[#111622]" : "border-slate-200 bg-white shadow-sm"} p-6 flex flex-col justify-between hover-cyber-lift transition-colors`}>
            <div>
              <div className="mb-4 flex items-center justify-between text-[10px] font-black tracking-[0.15em]">
                <span className={`rounded-lg border px-2.5 py-1 ${i % 2 === 0 ? "border-cyan-900/50 text-cyan-400 bg-cyan-900/10" : "border-fuchsia-900/50 text-fuchsia-400 bg-fuchsia-900/10"}`}>
                  {tag}
                </span>
                <span className="flex items-center gap-4">
                  <button
                    onClick={() => toggleFavorite(paper.id)}
                    className={`transition-colors ${favoritePostIds.includes(paper.id) ? "text-yellow-400" : "text-slate-500 hover:text-cyan-400"}`}
                  >
                    <Star size={14} fill={favoritePostIds.includes(paper.id) ? "currentColor" : "none"} />
                  </button>
                  <span className="flex items-center gap-1.5 text-emerald-500/80"><Eye size={14} /> {paper.views || 0}</span>
                  <span className="text-slate-500 font-bold">{date}</span>
                </span>
              </div>
              <h2 className={`mb-3 text-xl font-bold line-clamp-2 uppercase tracking-wide ${dark ? "text-slate-100" : "text-slate-800"}`}>
                {title}
              </h2>
              {/* <p className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-500/80 shadow-[0_0_8px_rgba(217,70,239,0.2)]">
                {author}
              </p> */}
              <p className={`mb-6 text-[13px] leading-relaxed line-clamp-3 font-medium ${dark ? "text-slate-400" : "text-slate-600"}`}>
                {desc}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                as="a"
                href={paper.documentUrl || "#"}
                onClick={() => trackView(paper.id)}
                target="_blank"
                rel="noreferrer"
                variant="primary"
                className="flex-1"
              >
                Access Archive ↗
              </Button>
              <Button
                as="a"
                href={paper.documentUrl || "#"}
                onClick={() => trackView(paper.id)}
                target="_blank"
                rel="noreferrer"
                variant="secondary"
                className="px-4"
              >
                <Download size={18} />
              </Button>
            </div>
          </article>
        );
      }

      return (
        <article key={paper.id || i} className={`rounded-2xl border ${dark ? "border-[#1A2333] bg-[#111622]" : "border-slate-200 bg-white shadow-lg shadow-slate-100"} p-5 relative overflow-hidden hover-cyber-lift`}>
          <button
            onClick={() => toggleFavorite(paper.id)}
            className={`absolute top-5 right-5 transition-colors ${favoritePostIds.includes(paper.id) ? "text-yellow-400" : "text-slate-500 hover:text-cyan-400"}`}
          >
            <Star size={20} fill={favoritePostIds.includes(paper.id) ? "currentColor" : "none"} />
          </button>
          <div className="flex gap-4 mb-4 pr-8">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${dark ? "bg-[#0B0F19] border-[#1A2333] text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)]" : "bg-cyan-50 border-cyan-100 text-cyan-600 shadow-sm"}`}>
              {getDummyIcon(i)}
            </div>
            <div>
              <h2 className={`text-[15px] font-bold leading-snug mb-1 uppercase tracking-tight ${dark ? "text-slate-100" : "text-slate-800"}`}>
                {title}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.05em] text-slate-500">
                BY <span className="text-fuchsia-400/80">{author}</span> • {date}
              </p>
            </div>
          </div>
          <p className={`mb-5 text-[12px] leading-relaxed line-clamp-2 font-medium ${dark ? "text-slate-400" : "text-slate-600"}`}>
            {desc}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500/80 mr-2"><Eye size={12} /> {paper.views || 0}</span>
              {mobileTags.slice(0, 1).map((t, idx) => (
                <span key={idx} className={`rounded-lg border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${idx === 0 && i % 2 === 0 ? "border-fuchsia-900/50 text-fuchsia-400 bg-fuchsia-900/10" : "border-cyan-900/50 text-cyan-400 bg-cyan-900/10"}`}>
                  {t}
                </span>
              ))}
            </div>
            <Button
              as="a"
              href={paper.documentUrl || "#"}
              onClick={() => trackView(paper.id)}
              target="_blank"
              rel="noreferrer"
              variant="primary"
              className="px-4"
            >
              <Download size={14} className="inline mr-2" /> PDF
            </Button>
          </div>
        </article>
      );
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-[#0B0F19] text-slate-200" : "bg-slate-50 text-slate-900"} font-sans tracking-wide relative overflow-hidden`}>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDesc} />
        {researchItems.length > 0 && (
          <meta name="keywords" content={researchItems.map(p => (p.keywords || []).join(", ")).join(", ")} />
        )}
        <script type="application/ld+json">{JSON.stringify(scholarlySchema)}</script>
      </Helmet>
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
        <header className={`flex items-center justify-between border-b px-4 py-4 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300 ${dark ? "border-[#3b494b] bg-[#10131a]/90" : "border-slate-200 bg-white/90"}`}>
          <div className="flex items-center gap-3">
            <Radio size={16} className={dark ? "text-[#00dbe9]" : "text-blue-600"} />
            <h1 className={`text-[13px] font-black tracking-[0.15em] uppercase ${dark ? "text-[#00dbe9] shadow-[#00dbe9] drop-shadow-[0_0_8px_rgba(0,219,233,0.4)]" : "text-blue-600"}`}>
              NEURAL ARCHIVE
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className={dark ? "!bg-[#161b22] !border-[#3b494b]" : "!bg-slate-100 !border-slate-200"} />
            <Search size={18} className="text-slate-400" />
          </div>
        </header>

        <main className="px-4 py-6 animate-fade-in-up">
          <div className={`mb-4 flex items-center gap-2 rounded-xl border ${dark ? "border-[#3b494b] bg-[#161b22]" : "border-slate-200 bg-white"} px-4 py-3 focus-within:border-[#00dbe9]/50 transition-all shadow-sm`}>
            <Search size={16} className="text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="QUERY_RESEARCH ID..."
              className="w-full bg-transparent text-[12px] font-bold text-slate-300 outline-none placeholder:text-slate-600 uppercase tracking-wider"
            />
          </div>

          <div className="mb-8 flex gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar -mx-4 px-4">
            <Button
              variant="filter"
              active={activeFilter === "ALL"}
              onClick={() => setActiveFilter("ALL")}
            >
              ALL ARCHIVES
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

          <div className="mb-6 flex items-end justify-between">
            <div>
              <h3 className="text-[10px] font-black tracking-[0.3em] text-cyan-400 mb-1 uppercase">DATASTREAM</h3>
              <h2 className="text-3xl font-black text-slate-100 leading-tight uppercase tracking-tighter">Research<br />Archives</h2>
            </div>
            <div className="text-right pb-1">
              <span className="block text-[10px] font-black tracking-widest text-slate-500 uppercase">{researchPayload.total || "0"} ENTRIES</span>
              <span className="block text-[10px] font-black tracking-widest text-slate-500 uppercase">INDEXED</span>
            </div>
          </div>

          <div className="space-y-4">
            {renderCards(false)}
          </div>

          {researchPayload.page < researchPayload.totalPages && (
            <div className="mt-8 text-center">
              <Button
                variant="secondary"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? "Decrypting..." : "Load More Archives"}
              </Button>
            </div>
          )}
        </main>

        <button className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-fuchsia-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.5)] z-20 hover:scale-105 transition-transform animate-fuchsia-pulse">
          <SlidersHorizontal size={24} />
        </button>

        <nav className={`fixed bottom-0 left-0 w-full border-t backdrop-blur-md z-30 pb-safe ${dark ? "border-[#1A2333] bg-[#0B0F19]/95" : "border-slate-200 bg-white/95 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]"}`}>
          <ul className="flex justify-around px-2 py-3">
            <li className="flex flex-col items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-300">
              <Link to="/" className="flex flex-col items-center gap-1.5">
                <Compass size={18} />
                <span className="text-[8px] font-black tracking-[0.15em] uppercase">Explore</span>
              </Link>
            </li>
            {settings.tabs?.repos !== false && (
              <li className="flex flex-col items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-300">
                <Link to="/repos" className="flex flex-col items-center gap-1.5">
                  <Database size={18} />
                  <span className="text-[8px] font-black tracking-[0.15em] uppercase">Repos</span>
                </Link>
              </li>
            )}
            {settings.tabs?.websites !== false && (
              <li className="flex flex-col items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-300">
                <Link to="/websites" className="flex flex-col items-center gap-1.5">
                  <BookOpen size={18} />
                  <span className="text-[8px] font-black tracking-[0.15em] uppercase">Websites</span>
                </Link>
              </li>
            )}
            <li className="flex flex-col items-center gap-1.5 cursor-pointer text-cyan-400">
              <Radio size={18} />
              <span className="text-[8px] font-black tracking-[0.15em] uppercase">Research</span>
            </li>
          </ul>
        </nav>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className={`mx-auto hidden min-h-screen max-w-[1400px] flex-col lg:flex transition-colors duration-300 bg-transparent`}>

        <main className="flex-1 px-8 py-12 max-w-[1200px] mx-auto w-full animate-fade-in-up">
          <div className="mb-10 text-center">
            <h3 className={`text-[11px] font-black tracking-[0.3em] mb-4 uppercase flex items-center justify-center gap-4 before:content-[''] before:h-[1px] before:w-8 after:content-[''] after:h-[1px] after:w-8 ${dark ? "text-cyan-400 before:bg-cyan-400 after:bg-cyan-400" : "text-cyan-600 before:bg-cyan-600 after:bg-cyan-600"}`}>
              Central Intelligence Repository
            </h3>
            <h2 className={`text-5xl font-black tracking-tight uppercase drop-shadow-md ${dark ? "text-slate-100" : "text-slate-900"}`}>
              KNOWLEDGE ARCHIVE
            </h2>
          </div>

          <div className="mb-10 flex gap-4">
            <div className={`flex h-14 flex-1 items-center gap-3 rounded-xl px-5 border transition-all focus-within:ring-1 ${dark ? "bg-[#161b22] border-[#3b494b] focus-within:border-[#00dbe9]/50 focus-within:ring-[#00dbe9]/20" : "bg-white border-slate-200 focus-within:border-blue-400 focus-within:ring-blue-500/10 shadow-sm"}`}>
              <Search size={18} className="text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="QUERY DATABASE (E.G. QUANTUM ENCRYPTION, NEURAL LATENCY...)"
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
              ALL ARCHIVES
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {renderCards(true)}
          </div>

          {researchPayload.page < researchPayload.totalPages && (
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

        <footer className={`mt-auto flex items-center justify-between border-t py-6 px-8 text-[10px] font-semibold tracking-widest transition-colors duration-300 ${dark ? "border-[#1A2333] text-slate-600 bg-[#0B0F19]" : "border-slate-200 text-slate-400 bg-slate-50"}`}>
          <div className="flex gap-6">
            <span className={dark ? "text-cyan-600/80 shadow-cyan-600 drop-shadow-[0_0_5px_rgba(8,145,178,0.5)]" : "text-blue-400"}>© 2024 NEURAL GRID SYSTEMS. PROTOCOL INITIALIZED.</span>
          </div>
          <div className="flex gap-8">
            <span className="hover:text-cyan-400 cursor-pointer transition-colors uppercase">Privacy</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors uppercase">Security</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors uppercase">API</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors uppercase">Support</span>
          </div>
        </footer>
      </div>

    </div>
  );
}
