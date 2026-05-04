import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import client from "../api/client";
import {
  Search,
  Database,
  Globe,
  Eye,
  Zap,
  Bell,
  Settings as SettingsIcon,
  UserCircle,
  ChevronRight,
  ChevronDown,
  Download,
  Terminal,
  Shield,
  Cpu,
  Layout,
  ExternalLink,
  Rss,
  GitFork,
  Star,
  Code,
  Box,
  Clock,
  ArrowUpRight,
  BookOpen
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import { useTheme } from "../context/ThemeContext";
import AdBanner from "../components/AdBanner";

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

const PAGE_SIZE = 9;

// RSS Feed URLs
const RSS_FEEDS = [
  { url: "https://techcrunch.com/feed/", category: "TECH" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", category: "CRYPTO" },
  { url: "https://openai.com/news/rss.xml", category: "AI" }
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const slides = [
    {
      id: 1,
      tag: "CRITICAL ALERT",
      code: "CVE-2024-8552",
      title: "Zero-Day Vulnerability detected in Node.js cluster",
      desc: "A critical remote code execution flaw has been identified in core clustering modules. Immediate patching is required for production environments.",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070",
      btn1: "View Full Report",
      btn2: "Isolate Nodes"
    },
    {
      id: 2,
      tag: "SYSTEM UPDATE",
      code: "VER-4.2.0",
      title: "Neural Network Architecture Optimization",
      desc: "New optimization weights for large language models have been deployed to the central processing unit, reducing latency by 45%.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=2070",
      btn1: "Check Benchmarks",
      btn2: "Download Weights"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrent(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative h-[280px] md:h-[350px] lg:h-[420px] w-full overflow-hidden rounded-2xl border border-[#3b494b] group">
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0F19] via-[#0B0F19]/90 to-transparent z-10" />
          <img src={slide.image} className="h-full w-full object-cover object-right" alt="" />

          <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-12 max-w-3xl">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <span className="bg-red-500/20 text-red-400 text-[8px] md:text-[10px] font-black tracking-widest px-2 md:px-3 py-1 rounded border border-red-500/30 uppercase">
                {slide.tag}
              </span>
              <span className="text-cyan-400 text-[8px] md:text-[10px] font-black tracking-widest uppercase">
                {slide.code}
              </span>
            </div>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-black tracking-tight text-white mb-3 md:mb-4 uppercase leading-tight">
              {slide.title}
            </h1>
            <p className="text-slate-400 text-[11px] md:text-sm mb-6 md:mb-10 leading-relaxed max-w-xl line-clamp-3 md:line-clamp-none">
              {slide.desc}
            </p>
            <div className="flex items-center gap-3">
              <button className="bg-cyan-500 hover:bg-cyan-400 text-[#10131a] font-black text-[9px] md:text-[11px] uppercase tracking-widest px-5 md:px-8 py-2.5 md:py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                {slide.btn1.split(" ")[0]}
              </button>
              <button className="bg-transparent border border-[#3b494b] hover:border-cyan-500/50 text-white font-black text-[9px] md:text-[11px] uppercase tracking-widest px-5 md:px-8 py-2.5 md:py-3.5 rounded-xl transition-all">
                {slide.btn2.split(" ")[0]}
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-6 right-6 md:bottom-10 md:right-12 z-30 flex gap-2 md:gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1 rounded-full transition-all duration-300 ${idx === current ? "w-6 md:w-10 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" : "w-2 md:w-4 bg-slate-700 hover:bg-slate-500"}`}
          />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({ title, count, link, live }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-4">
        {/* <span className="text-cyan-500 font-black text-xl">/</span> */}
        <h2 className="text-[13px] font-black tracking-[0.2em] text-white uppercase">{title}</h2>
        {live && (
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-400 text-[8px] font-black tracking-widest uppercase">LIVE_FEED</span>
          </div>
        )}
        {count && <span className="hidden sm:block bg-[#161b22] text-slate-500 text-[10px] px-2 py-0.5 rounded border border-[#3b494b] font-black">{count} ACTIVE</span>}
      </div>
      <Link to={link || "#"} className="text-[10px] font-black tracking-widest text-slate-500 hover:text-cyan-400 transition-colors uppercase flex items-center gap-2 group">
        View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

function RepoCard({ item }) {
  const { dark } = useTheme();
  const parsed = parseGithubRepo(item.link);
  const owner = parsed?.owner || "cyber-intel";
  const repoName = parsed?.repo || item.title;

  return (
    <div className={`flex flex-col p-6 rounded-2xl border transition-all duration-300 group h-full ${dark ? "bg-[#111622]/80 backdrop-blur-xl border-[#1A2333] hover:border-cyan-500/30" : "bg-white border-slate-200 shadow-lg"}`}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full border border-[#1A2333] overflow-hidden flex items-center justify-center bg-black shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            {/* Mimicking the orange pixel logo from the screenshot */}
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-2 h-2 bg-orange-500" />
              <div className="w-2 h-2 bg-orange-600" />
              <div className="w-2 h-2 bg-orange-400" />
              <div className="w-2 h-2 bg-orange-500" />
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className={`font-black text-[15px] tracking-tight truncate max-w-[180px] ${dark ? "text-white" : "text-slate-900"}`}>
              <span className="text-cyan-400">{owner}</span> <span className="text-slate-500">/</span> {repoName}
            </h3>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">v2.4.1 // PRODUCTION_READY</span>
          </div>
        </div>
        <button className="text-slate-500 hover:text-cyan-400 transition-colors">
          <Star size={20} />
        </button>
      </div>

      <div className="flex-1 mb-8">
        <p className={`text-[13px] leading-relaxed line-clamp-3 ${dark ? "text-slate-400" : "text-slate-600"}`}>
          {item.description || "Low-level diagnostic toolkit for real-time memory inspection and automated kernel-mode threat detection in distributed systems."}
        </p>
      </div>

      <div className="flex items-center gap-5 mb-8 text-[11px] font-black tracking-widest text-slate-500 uppercase">
        <div className="flex items-center gap-1.5"><Star size={16} className="text-cyan-400/60" /> {item.stars || "12.4k"}</div>
        <div className="flex items-center gap-1.5"><GitFork size={16} className="text-cyan-400/60" /> {item.forks || "842"}</div>
        <div className="flex items-center gap-1.5"><Eye size={16} className="text-cyan-400/60" /> {item.views || "0"}</div>
        <div className="flex items-center gap-2.5 ml-auto px-4 py-1.5 rounded-full border border-[#1A2333] bg-[#0B0F19] text-white">
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          <span>{item.language || "C++"}</span>
        </div>
      </div>

      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full py-4 rounded-xl border border-cyan-500/20 font-black text-[11px] tracking-[0.25em] uppercase text-center transition-all ${dark ? "bg-black/40 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:border-cyan-500" : "bg-cyan-50 border-cyan-100 text-cyan-600 hover:bg-cyan-600 hover:text-white"}`}
      >
        View Repository
      </a>
    </div>
  );
}

function KnowledgeCard({ item }) {
  const { dark } = useTheme();
  return (
    <div className={`p-4 rounded-2xl border transition-all group flex items-center gap-5 ${dark ? "bg-[#161b22] border-[#3b494b] hover:border-cyan-500/50" : "bg-white border-slate-200 shadow-lg shadow-slate-100 hover:border-cyan-400"}`}>
      <div className={`h-14 w-14 shrink-0 rounded-xl flex items-center justify-center border transition-colors ${dark ? "bg-[#0B0F19] border-[#3b494b] text-cyan-400" : "bg-slate-50 border-slate-200 text-cyan-600"}`}>
        <BookOpen size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-black text-[14px] leading-tight mb-1 group-hover:text-cyan-400 transition-colors ${dark ? "text-white" : "text-slate-900"}`}>
          {item.title}
        </h3>
        <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          <span>Arxiv: 2311.0942</span>
          <span className="h-1 w-1 rounded-full bg-slate-700" />
          <span>4.2 MB</span>
        </div>
      </div>
      <button className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${dark ? "bg-slate-800 text-slate-400 hover:bg-cyan-500 hover:text-[#0B0F19]" : "bg-slate-100 text-slate-600 hover:bg-cyan-600 hover:text-white"}`}>
        <Download size={18} />
      </button>
    </div>
  );
}

function ResourceHubCard({ title, desc, icon: Icon, color }) {
  const { dark } = useTheme();
  return (
    <div className={`p-4 rounded-2xl border transition-all group flex items-center gap-4 ${dark ? "bg-[#161b22] border-[#3b494b] hover:border-cyan-500/50" : "bg-white border-slate-200 shadow-lg shadow-slate-100 hover:border-cyan-400"}`}>
      <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-colors ${dark ? "bg-[#0B0F19] text-cyan-400" : "bg-slate-50 text-cyan-600"}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <h3 className={`font-black text-[11px] uppercase tracking-widest truncate ${dark ? "text-slate-300" : "text-slate-900"}`}>{title}</h3>
      </div>
    </div>
  );
}

function NewsCard({ item }) {
  const { dark } = useTheme();
  const defaultImg = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800";
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-2xl border transition-all group overflow-hidden h-full ${dark ? "bg-[#161b22] border-[#3b494b] hover:border-cyan-500/50" : "bg-white border-slate-200 shadow-lg shadow-slate-100 hover:border-cyan-400"}`}
    >
      <div className="aspect-video w-full overflow-hidden relative">
        <img
          src={item.enclosure?.link || item.thumbnail || defaultImg}
          alt="intel"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] to-transparent opacity-60" />
      </div>
      <div className="p-4 md:p-5">
        <div className="text-cyan-500 text-[8px] md:text-[9px] font-black tracking-[0.2em] uppercase mb-1 md:mb-2">
          {item.category || "RSS_FEED"}
        </div>
        <h3 className={`font-black text-[13px] md:text-[15px] leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2 ${dark ? "text-white" : "text-slate-900"}`}>
          {item.title}
        </h3>
      </div>
    </a>
  );
}

// AdBanner inline definition was here - removed
export default function Home() {
  const { dark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") || "ALL").toUpperCase();
  const setActiveTab = (tab) => setSearchParams({ tab: tab.toLowerCase() });
  const [search, setSearch] = useState("");
  const [news, setNews] = useState([]);
  const [repos, setRepos] = useState([]);
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNewsCategory, setActiveNewsCategory] = useState("ALL");

  // Fetch RSS news
  const fetchNews = async () => {
    try {
      const allNews = [];
      for (const feed of RSS_FEEDS) {
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
        const data = await res.json();
        if (data.status === "ok") {
          allNews.push(...data.items.map(item => ({
            ...item,
            category: feed.category,
            source: data.feed.title
          })));
        }
      }
      setNews(allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)).slice(0, 12));
    } catch (err) {
      console.error("RSS Fetch Error:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await Promise.allSettled([
          fetchNews(),
          client.get("/posts?limit=12&type=repository").then(res => setRepos(res.data.data)),
          client.get("/research/public?limit=12").then(res => setResearch(res.data.data))
        ]);
      } catch (err) {
        console.error("Initialization Error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Parallel Continuous Auto-scroll logic using requestAnimationFrame for maximum smoothness
  useEffect(() => {
    if (loading) return;

    const carouselIds = ["news-carousel", "repos-carousel", "knowledge-carousel", "resource-carousel"];
    const scrollSpeed = 0.8; // Slightly faster for visibility
    let animationFrameId;
    const pausedState = {
      "news-carousel": false,
      "repos-carousel": false,
      "knowledge-carousel": false,
      "resource-carousel": false
    };

    const animate = () => {
      carouselIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el || pausedState[id]) return;

        const halfWidth = el.scrollWidth / 2;

        // Alternate directions: Repos and Resource Hub move Right-to-Left (Reverse)
        if (id === "repos-carousel" || id === "resource-carousel") {
          if (el.scrollLeft <= 0) {
            el.scrollLeft = halfWidth;
          } else {
            el.scrollLeft -= scrollSpeed;
          }
        } else {
          // Others move Left-to-Right (Forward)
          if (el.scrollLeft >= halfWidth) {
            el.scrollLeft = 0;
          } else {
            el.scrollLeft += scrollSpeed;
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    carouselIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.onmouseenter = () => pausedState[id] = true;
        el.onmouseleave = () => pausedState[id] = false;
        // Touch support for mobile
        el.ontouchstart = () => pausedState[id] = true;
        el.ontouchend = () => pausedState[id] = false;
      }
    });

    // Initial positions for reverse carousels
    carouselIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && (id === "repos-carousel" || id === "resource-carousel")) {
        el.scrollLeft = el.scrollWidth / 4; // Start slightly offset
      }
    });

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [loading]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-[#0B0F19]" : "bg-slate-50"} relative overflow-hidden`}>
      {/* Background Grid Pattern - Only in Dark Mode */}
      {dark && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#84949510_1px,transparent_1px),linear-gradient(to_bottom,#84949510_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
      )}
      {/* Cinematic Gutter Ads (Wallpaper Style) */}
      <div className="hidden 2xl:block fixed left-4 top-1/2 -translate-y-1/2 z-40">
        <AdBanner position="LEFT_GUTTER" variant="skyscraper" />
      </div>
      <div className="hidden 2xl:block fixed right-4 top-1/2 -translate-y-1/2 z-40">
        <AdBanner position="RIGHT_GUTTER" variant="skyscraper" />
      </div>


      <main className="max-w-[1400px] mx-auto px-6 lg:px-8 py-6">
        <HeroSlider />

        {activeTab === "ALL" && (
          <div className="space-y-4 pb-32">
            <div className="flex flex-col gap-24">
              {/* Horizontal News Carousel Section */}
              <section className="min-w-0 mt-4">
                <SectionHeader title="LATEST_INTEL" count={news.length} link="/news" live />



                <div className="relative group/carousel">
                  {/* Edge Fades */}
                  <div className="absolute left-0 top-0 bottom-8 w-20 bg-gradient-to-r from-[#10131a] to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-8 w-20 bg-gradient-to-l from-[#10131a] to-transparent z-10 pointer-events-none" />

                  <div
                    id="news-carousel"
                    className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide no-scrollbar scroll-smooth px-4 md:px-10"
                  >
                    {[...news, ...news]
                      .filter(item => activeNewsCategory === "ALL" || item.category === activeNewsCategory)
                      .map((item, idx) => (
                        <div key={idx} className="min-w-[300px] md:min-w-[450px]">
                          <NewsCard item={item} />
                        </div>
                      ))}
                    {news.length === 0 && [...Array(8)].map((_, i) => (
                      <div key={i} className="min-w-[300px] md:min-w-[450px] h-64 bg-[#161b22] border border-[#3b494b] rounded-2xl animate-pulse" />
                    ))}
                  </div>

                  {/* Carousel Controls */}
                  <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                    <button
                      onClick={() => document.getElementById("news-carousel").scrollBy({ left: -400, behavior: "smooth" })}
                      className="p-3 rounded-full bg-[#161b22] border border-[#3b494b] text-white hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-xl"
                    >
                      <ChevronDown size={20} className="rotate-90" />
                    </button>
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                    <button
                      onClick={() => document.getElementById("news-carousel").scrollBy({ left: 400, behavior: "smooth" })}
                      className="p-3 rounded-full bg-[#161b22] border border-[#3b494b] text-white hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-xl"
                    >
                      <ChevronDown size={20} className="-rotate-90" />
                    </button>
                  </div>
                </div>
              </section>

            </div>

            <AdBanner position="HOME_BANNER" />

            {/* Repos Section Carousel */}
            {/* <section> */}
            <SectionHeader title="CODE_REPOS" link="/repos" count={repos.length || "48"} />
            <div className="relative group/carousel">
              <div className="absolute left-0 top-0 bottom-8 w-20 bg-gradient-to-r from-[#10131a] to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-8 w-20 bg-gradient-to-l from-[#10131a] to-transparent z-10 pointer-events-none" />

              <div
                id="repos-carousel"
                className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide no-scrollbar scroll-smooth px-4 md:px-10"
              >
                {[...repos, ...repos].map((repo, idx) => (
                  <div key={`${repo._id}-${idx}`} className="min-w-[300px] md:min-w-[400px]">
                    <RepoCard item={repo} />
                  </div>
                ))}
                {repos.length === 0 && [...Array(8)].map((_, i) => (
                  <div key={i} className="min-w-[300px] md:min-w-[400px]">
                    <RepoCard item={{ title: `system-module-${i}`, description: "Low-level system module for central processing units." }} />
                  </div>
                ))}
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                <button onClick={() => document.getElementById("repos-carousel").scrollBy({ left: -400, behavior: "smooth" })} className="p-3 rounded-full bg-[#161b22] border border-[#3b494b] text-white hover:text-cyan-400 shadow-xl">
                  <ChevronDown size={20} className="rotate-90" />
                </button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                <button onClick={() => document.getElementById("repos-carousel").scrollBy({ left: 400, behavior: "smooth" })} className="p-3 rounded-full bg-[#161b22] border border-[#3b494b] text-white hover:text-cyan-400 shadow-xl">
                  <ChevronDown size={20} className="-rotate-90" />
                </button>
              </div>
            </div>
            {/* </section> */}

            {/* Knowledge Stream Carousel */}
            <section className="mt-3">
              <SectionHeader title="KNOWLEDGE_STREAM" link="/research" count={research.length || "24"} />
              <div className="relative group/carousel">
                <div className="absolute left-0 top-0 bottom-8 w-20 bg-gradient-to-r from-[#10131a] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-8 w-20 bg-gradient-to-l from-[#10131a] to-transparent z-10 pointer-events-none" />

                <div
                  id="knowledge-carousel"
                  className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide no-scrollbar scroll-smooth px-4 md:px-10"
                >
                  {[...research, ...research].map((res, idx) => (
                    <div key={`${res._id}-${idx}`} className="min-w-[350px] md:min-w-[500px]">
                      <KnowledgeCard item={res} />
                    </div>
                  ))}
                  {research.length === 0 && [1, 2, 3, 4].map(i => (
                    <div key={i} className="min-w-[350px] md:min-w-[500px] snap-start">
                      <KnowledgeCard item={{ title: `Research Protocol ${i}`, description: "Analyzing deep-level neural network latency and optimization." }} />
                    </div>
                  ))}
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                  <button onClick={() => document.getElementById("knowledge-carousel").scrollBy({ left: -500, behavior: "smooth" })} className="p-3 rounded-full bg-[#161b22] border border-[#3b494b] text-white hover:text-cyan-400 shadow-xl">
                    <ChevronDown size={20} className="rotate-90" />
                  </button>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                  <button onClick={() => document.getElementById("knowledge-carousel").scrollBy({ left: 500, behavior: "smooth" })} className="p-3 rounded-full bg-[#161b22] border border-[#3b494b] text-white hover:text-cyan-400 shadow-xl">
                    <ChevronDown size={20} className="-rotate-90" />
                  </button>
                </div>
              </div>
            </section>

            {/* Resource Hub */}
            <section className="pb-32">
              <SectionHeader title="RESOURCE_HUB" count="12" />
              <div className="relative group/carousel">
                <div
                  id="resource-carousel"
                  className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide no-scrollbar scroll-smooth px-4 md:px-10"
                >
                  {[1, 2].map((loop) => (
                    <>
                      <div className="min-w-[200px] md:min-w-[240px]">
                        <ResourceHubCard title="NetSec Tools" icon={Shield} />
                      </div>
                      <div className="min-w-[200px] md:min-w-[240px]">
                        <ResourceHubCard title="Data Vault" icon={Database} color="blue" />
                      </div>
                      <div className="min-w-[200px] md:min-w-[240px]">
                        <ResourceHubCard title="Proxy Hub" icon={Globe} color="green" />
                      </div>
                      <div className="min-w-[200px] md:min-w-[240px]">
                        <ResourceHubCard title="Crypt Library" icon={Shield} color="yellow" />
                      </div>
                      <div className="min-w-[200px] md:min-w-[240px]">
                        <ResourceHubCard title="CLI Tools" icon={Terminal} color="purple" />
                      </div>
                      <div className="min-w-[200px] md:min-w-[240px]">
                        <ResourceHubCard title="Cloud Sec" icon={Zap} color="orange" />
                      </div>
                    </>
                  ))}
                </div>
              </div>
            </section>

            <AdBanner position="BOTTOM_FULL" />
          </div>
        )}

        {activeTab === "NEWS" && (
          <div className="pb-20">
            <SectionHeader title="GLOBAL_TECH_INTEL" count={news.length} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {news.map((item, idx) => (
                <NewsCard key={idx} item={item} />
              ))}
            </div>
          </div>
        )}

        {(activeTab === "REPOS" || activeTab === "PAPERS" || activeTab === "WEBSITES") && (
          <div className="py-20 text-center border border-dashed border-[#3b494b] rounded-2xl bg-[#161b22]/50">
            <h3 className="text-slate-400 font-black text-sm uppercase tracking-widest">Accessing Restricted Archive...</h3>
            <p className="text-slate-600 text-xs mt-2 uppercase">Please use the main navigation to browse full catalogs.</p>
            <Link to={`/${activeTab.toLowerCase()}`} className="mt-6 inline-block bg-cyan-500 text-[#10131a] px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">
              Open Full Directory
            </Link>
          </div>
        )}
      </main>

      {/* Background Decorative Grid */}
      {dark && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#84949510_1px,transparent_1px),linear-gradient(to_bottom,#84949510_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>
      )}
    </div>
  );
}
