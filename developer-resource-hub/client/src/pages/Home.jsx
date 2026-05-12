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

const PAGE_SIZE = 9;

// RSS Feed URLs
const RSS_FEEDS = [
  { url: "https://techcrunch.com/feed/", category: "TECH" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", category: "CRYPTO" },
  { url: "https://openai.com/news/rss.xml", category: "AI" }
];

const trackPostView = (id) => {
  if (!id) return;
  client.patch(`/posts/${id}/view`).catch(() => {});
};

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
              <Button variant="primary">
                {slide.btn1.split(" ")[0]}
              </Button>
              <Button variant="secondary">
                {slide.btn2.split(" ")[0]}
              </Button>
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
  const { dark } = useTheme();
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-4">
        {/* <span className="text-cyan-500 font-black text-xl">/</span> */}
        <h2 className={`text-[13px] font-black tracking-[0.2em] uppercase ${dark ? "text-white" : "text-slate-900"}`}>{title}</h2>
        {live && (
          <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
            </span>
            <span className="text-cyan-400 text-[8px] font-black tracking-widest uppercase">LIVE FEED</span>
          </div>
        )}
        {count && <span className={`hidden sm:block text-[10px] px-2 py-0.5 rounded border font-black ${dark ? "bg-[#161b22] text-slate-500 border-[#3b494b]" : "bg-slate-100 text-slate-500 border-slate-200"}`}>{count} ACTIVE</span>}
      </div>
      <Link to={link || "#"} className="text-[10px] font-black tracking-widest text-slate-500 hover:text-cyan-400 transition-colors uppercase flex items-center gap-2 group">
        View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

import React from "react";

const RepoCard = React.memo(({ item }) => {
  const { dark } = useTheme();
  const parsed = parseGithubRepo(item.link);
  const owner = parsed?.owner || "unknown";
  const repoName = parsed?.repo || item.title || "repository";

  const normalizeExternalUrl = (link) => {
    if (!link) return "#";
    if (/^https?:\/\//i.test(link)) return link;
    return `https://${link}`;
  };

  return (
    <div className={`flex flex-col p-6 rounded-2xl border transition-all duration-300 group h-full ${dark ? "bg-[#111622]/80 backdrop-blur-xl border-[#1A2333] hover:border-cyan-500/30" : "bg-white border-slate-200 shadow-lg"}`}>
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full border border-[#1A2333] overflow-hidden flex items-center justify-center bg-black shadow-[0_0_15px_rgba(249,115,22,0.1)]">
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
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">v2.4.1 // PRODUCTION READY</span>
          </div>
        </div>
        <button className="text-slate-500 hover:text-cyan-400 transition-colors">
          <Star size={20} />
        </button>
      </div>

      <div className="flex-1 mb-8">
        <p className={`text-[13px] leading-relaxed line-clamp-3 ${dark ? "text-slate-400" : "text-slate-600"}`}>
          {item.description || "No description available."}
        </p>
      </div>

      <div className="flex items-center gap-5 mb-8 text-[11px] font-black tracking-widest text-slate-500 uppercase">
        <div className="flex items-center gap-1.5"><Star size={16} className="text-cyan-400/60" /> {item.stars || 0}</div>
        <div className="flex items-center gap-1.5"><GitFork size={16} className="text-cyan-400/60" /> {item.forks || 0}</div>
        <div className="flex items-center gap-1.5"><Eye size={16} className="text-cyan-400/60" /> {item.views || 0}</div>
        <div className="flex items-center gap-2.5 ml-auto px-4 py-1.5 rounded-full border border-[#1A2333] bg-[#0B0F19] text-white">
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          <span>{item.language || "N/A"}</span>
        </div>
      </div>

      <Button
        as="a"
        href={normalizeExternalUrl(item.link)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackPostView(item.id)}
        variant="primary"
        className="w-full"
      >
        View Repository
      </Button>
    </div>
  );
});

const WebsiteCard = React.memo(({ item }) => {
  const { dark } = useTheme();
  let domain = "website";
  try {
    domain = new URL(item.link || "").hostname.replace("www.", "");
  } catch {
    domain = "website";
  }

  const normalizeExternalUrl = (link) => {
    if (!link) return "#";
    if (/^https?:\/\//i.test(link)) return link;
    return `https://${link}`;
  };

  return (
    <div className={`flex flex-col p-4 rounded-xl border transition-all duration-300 group h-full ${dark ? "bg-[#121a24]/80 backdrop-blur-xl border-[#2a3a4f] hover:border-cyan-400/40" : "bg-white border-slate-200 shadow-lg"}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg border border-cyan-900/40 overflow-hidden flex items-center justify-center bg-cyan-950/30 text-cyan-400">
            <Globe size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className={`font-black text-[13px] tracking-tight truncate max-w-[180px] ${dark ? "text-white" : "text-slate-900"}`}>
              {item.title || "Website"}
            </h3>
            <span className="text-[9px] font-bold text-cyan-500/80 uppercase tracking-widest truncate">{domain}</span>
          </div>
        </div>
        <button className="text-slate-500 hover:text-cyan-400 transition-colors">
          <ExternalLink size={16} />
        </button>
      </div>

      <div className="flex-1 mb-5">
        <p className={`text-[12px] leading-relaxed line-clamp-2 ${dark ? "text-slate-400" : "text-slate-600"}`}>
          {item.description || "No description available."}
        </p>
      </div>

      <div className="flex items-center gap-3 mb-5 text-[10px] font-black tracking-widest text-slate-500 uppercase">
        <div className="flex items-center gap-1.5"><Layout size={14} className="text-cyan-400/70" /> Platform</div>
        <div className="flex items-center gap-1.5"><Eye size={14} className="text-cyan-400/70" /> {item.views || "0"}</div>
        <div className="flex items-center gap-2 ml-auto px-2.5 py-1 rounded-full border border-cyan-900/40 bg-cyan-950/20 text-cyan-300">
          <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          <span>WEBSITE</span>
        </div>
      </div>

      <Button
        as="a"
        href={normalizeExternalUrl(item.link)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackPostView(item.id)}
        variant="primary"
        className="w-full"
      >
        Visit Website
      </Button>
    </div>
  );
});

const KnowledgeCard = React.memo(({ item }) => {
  const { dark } = useTheme();
  const date = item.dateOfSubmission ? new Date(item.dateOfSubmission).toLocaleDateString() : "RECENT";
  const categoryName = item.Category?.name || item.category || "RESEARCH";
  
  return (
    <div className={`p-4 rounded-2xl border transition-all group flex items-center gap-5 ${dark ? "bg-[#161b22] border-[#3b494b] hover:border-cyan-500/50" : "bg-white border-slate-200 shadow-lg shadow-slate-100 hover:border-cyan-400"}`}>
      <div className={`h-14 w-14 shrink-0 rounded-xl flex items-center justify-center border transition-colors ${dark ? "bg-[#0B0F19] border-[#3b494b] text-cyan-400" : "bg-slate-50 border-slate-200 text-cyan-600"}`}>
        <BookOpen size={24} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-black text-[14px] leading-tight mb-1 group-hover:text-cyan-400 transition-colors uppercase ${dark ? "text-white" : "text-slate-900"}`}>
          {item.title}
        </h3>
        <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="text-cyan-500">{categoryName}</span>
          <span className="h-1 w-1 rounded-full bg-slate-700" />
          <span>{date}</span>
        </div>
      </div>
      <a 
        href={item.documentUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-all ${dark ? "bg-slate-800 text-slate-400 hover:bg-cyan-500 hover:text-[#0B0F19]" : "bg-slate-100 text-slate-600 hover:bg-cyan-600 hover:text-white"}`}
      >
        <Eye size={18} />
      </a>
    </div>
  );
});

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

const ToolkitCard = React.memo(({ item }) => {
  const { dark } = useTheme();
  return (
    <Link
      to={`/toolkits/${item.slug}`}
      className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 group h-full relative overflow-hidden ${dark ? "bg-transparent border-[#1A2333] hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.05)]" : "bg-white border-slate-200 shadow-lg"}`}
    >
      {/* Background Accent Blur */}
      <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full bg-cyan-500 opacity-5 blur-2xl transition-opacity group-hover:opacity-10`} />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg border border-cyan-500/20 overflow-hidden flex items-center justify-center bg-cyan-500/5 text-cyan-400 group-hover:bg-cyan-500/10 transition-colors">
            <Zap size={18} fill="currentColor" />
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className={`font-black text-[14px] tracking-tight truncate max-w-[150px] uppercase ${dark ? "text-white group-hover:text-cyan-400" : "text-slate-900 group-hover:text-cyan-600"}`}>
              {item.title}
            </h3>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">{item.audience || "DEVELOPER"}</span>
          </div>
        </div>
        <div className="text-slate-500 group-hover:text-cyan-400 transition-colors">
          <ArrowUpRight size={18} />
        </div>
      </div>

      <div className="flex-1 mb-5">
        <p className={`text-[12px] leading-relaxed line-clamp-2 font-medium ${dark ? "text-slate-400" : "text-slate-600"}`}>
          {item.description || "Access curated technical resources and developer intelligence packages."}
        </p>
      </div>

      <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-slate-500 uppercase border-t border-[#3b494b]/20 pt-4">
        <div className="flex items-center gap-1.5">
          <Eye size={14} className="text-cyan-400/60" /> {item.views || 0}
        </div>
        <div className="flex -space-x-1.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-4 w-4 rounded-full border border-[#111622] bg-slate-800" />
          ))}
        </div>
      </div>
    </Link>
  );
});

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
  const [reposTotal, setReposTotal] = useState(0);
  const [websites, setWebsites] = useState([]);
  const [toolkits, setToolkits] = useState([]);
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
          client.get("/posts?limit=12&type=repo").then((res) => {
            setRepos(res.data.data || []);
            setReposTotal(res.data.total || 0);
          }),
          client.get("/posts?limit=12&type=website").then(res => setWebsites(res.data.data)),
          client.get("/toolkits/public?limit=8").then((res) => setToolkits(res.data.data || [])),
          client.get("/research/public", { params: { limit: 12, t: Date.now() } })
            .then(res => {
              console.log("Research API Response:", res.data);
              setResearch(res.data?.data || []);
            })
            .catch(err => console.error("Research API Error:", err)),
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

    const carouselIds = ["news-carousel", "repos-carousel", "websites-carousel", "knowledge-carousel", "resource-carousel", "toolkits-carousel"];
    const scrollSpeed = 0.6; // Reduced speed for better stability
    let animationFrameId;
    
    // Cache elements and set initial positions
    const carousels = carouselIds.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      
      const isReverse = id === "repos-carousel" || id === "resource-carousel" || id === "toolkits-carousel";
      const halfWidth = el.scrollWidth / 2;
      
      if (isReverse) {
        el.scrollLeft = halfWidth / 2;
      }

      return {
        el,
        id,
        isReverse,
        isPaused: false
      };
    }).filter(Boolean);

    const animate = () => {
      carousels.forEach(c => {
        if (c.isPaused) return;

        const el = c.el;
        const halfWidth = el.scrollWidth / 2;

        if (c.isReverse) {
          if (el.scrollLeft <= 0) {
            el.scrollLeft = halfWidth;
          } else {
            el.scrollLeft -= scrollSpeed;
          }
        } else {
          if (el.scrollLeft >= halfWidth) {
            el.scrollLeft = 0;
          } else {
            el.scrollLeft += scrollSpeed;
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    // Attach event listeners to cached items
    carousels.forEach(c => {
      const el = c.el;
      let scrollTimer = null;

      const setPaused = (val) => { c.isPaused = val; };

      el.onmouseenter = () => setPaused(true);
      el.onmouseleave = () => setPaused(false);
      el.ontouchstart = () => setPaused(true);
      el.ontouchend = () => setPaused(false);
      
      // Detect manual scrolling (trackpad/mousewheel)
      el.onwheel = () => {
        setPaused(true);
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => setPaused(false), 2000);
      };

      // Ensure manual scroll also pauses the auto-animation
      el.onscroll = (e) => {
        // Only trigger if it's a manual scroll (no animation frame active or user interaction)
        if (e.isTrusted) { // true if triggered by user
          setPaused(true);
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(() => setPaused(false), 2000);
        }
      };
    });

    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      carousels.forEach(c => {
        if (c.el) {
          c.el.onmouseenter = null;
          c.el.onmouseleave = null;
          c.el.ontouchstart = null;
          c.el.ontouchend = null;
        }
      });
    };
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
                <SectionHeader title="LATEST INTEL" count={news.length} link="/news" live />



                <div className="relative group/carousel">
                  {/* Edge Fades */}
                  <div className={`absolute left-0 top-0 bottom-8 w-20 bg-gradient-to-r ${dark ? "from-[#10131a]" : "from-slate-50"} to-transparent z-10 pointer-events-none`} />
                  <div className={`absolute right-0 top-0 bottom-8 w-20 bg-gradient-to-l ${dark ? "from-[#10131a]" : "from-slate-50"} to-transparent z-10 pointer-events-none`} />

                  <div
                    id="news-carousel"
                    className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide no-scrollbar px-4 md:px-10"
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
                      className={`p-3 rounded-full border shadow-xl transition-all ${dark ? "bg-[#161b22] border-[#3b494b] text-white hover:text-cyan-400" : "bg-white border-slate-200 text-slate-700 hover:text-cyan-600 hover:border-cyan-400"}`}
                    >
                      <ChevronDown size={20} className="rotate-90" />
                    </button>
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                    <button
                      onClick={() => document.getElementById("news-carousel").scrollBy({ left: 400, behavior: "smooth" })}
                      className={`p-3 rounded-full border shadow-xl transition-all ${dark ? "bg-[#161b22] border-[#3b494b] text-white hover:text-cyan-400" : "bg-white border-slate-200 text-slate-700 hover:text-cyan-600 hover:border-cyan-400"}`}
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
            <SectionHeader title="CODE REPOS" link="/repos" count={reposTotal || repos.length || "0"} />
            <div className="relative group/carousel">
              <div className={`absolute left-0 top-0 bottom-8 w-20 bg-gradient-to-r ${dark ? "from-[#10131a]" : "from-slate-50"} to-transparent z-10 pointer-events-none`} />
              <div className={`absolute right-0 top-0 bottom-8 w-20 bg-gradient-to-l ${dark ? "from-[#10131a]" : "from-slate-50"} to-transparent z-10 pointer-events-none`} />

              <div
                id="repos-carousel"
                className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide no-scrollbar px-4 md:px-10"
              >
                {[...repos, ...repos].map((repo, idx) => (
                  <div key={`${repo.id}-${idx}`} className="min-w-[300px] md:min-w-[400px]">
                    <RepoCard item={repo} />
                  </div>
                ))}
                {repos.length === 0 && (
                  <div className="min-w-full text-center py-10 text-slate-500 font-bold uppercase tracking-widest text-xs">
                    No repositories available.
                  </div>
                )}
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                <button onClick={() => document.getElementById("repos-carousel").scrollBy({ left: -400, behavior: "smooth" })} className={`p-3 rounded-full border shadow-xl transition-all ${dark ? "bg-[#161b22] border-[#3b494b] text-white hover:text-cyan-400" : "bg-white border-slate-200 text-slate-700 hover:text-cyan-600 hover:border-cyan-400"}`}>
                  <ChevronDown size={20} className="rotate-90" />
                </button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                <button onClick={() => document.getElementById("repos-carousel").scrollBy({ left: 400, behavior: "smooth" })} className={`p-3 rounded-full border shadow-xl transition-all ${dark ? "bg-[#161b22] border-[#3b494b] text-white hover:text-cyan-400" : "bg-white border-slate-200 text-slate-700 hover:text-cyan-600 hover:border-cyan-400"}`}>
                  <ChevronDown size={20} className="-rotate-90" />
                </button>
              </div>
            </div>
            {/* </section> */}

            <SectionHeader title="WEBSITE DIRECTORY" link="/websites" count={websites.length || "0"} />
            <div className="relative group/carousel">
              <div className={`absolute left-0 top-0 bottom-8 w-20 bg-gradient-to-r ${dark ? "from-[#10131a]" : "from-slate-50"} to-transparent z-10 pointer-events-none`} />
              <div className={`absolute right-0 top-0 bottom-8 w-20 bg-gradient-to-l ${dark ? "from-[#10131a]" : "from-slate-50"} to-transparent z-10 pointer-events-none`} />

              <div
                id="websites-carousel"
                className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide no-scrollbar px-4 md:px-10"
              >
                {[...websites, ...websites].map((site, idx) => (
                  <div key={`${site.id}-${idx}`} className="min-w-[240px] md:min-w-[300px]">
                    <WebsiteCard item={site} />
                  </div>
                ))}
                {websites.length === 0 && (
                  <div className="min-w-full text-center py-10 text-slate-500 font-bold uppercase tracking-widest text-xs">
                    No websites available.
                  </div>
                )}
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                <button onClick={() => document.getElementById("websites-carousel").scrollBy({ left: -400, behavior: "smooth" })} className={`p-3 rounded-full border shadow-xl transition-all ${dark ? "bg-[#161b22] border-[#3b494b] text-white hover:text-cyan-400" : "bg-white border-slate-200 text-slate-700 hover:text-cyan-600 hover:border-cyan-400"}`}>
                  <ChevronDown size={20} className="rotate-90" />
                </button>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                <button onClick={() => document.getElementById("websites-carousel").scrollBy({ left: 400, behavior: "smooth" })} className={`p-3 rounded-full border shadow-xl transition-all ${dark ? "bg-[#161b22] border-[#3b494b] text-white hover:text-cyan-400" : "bg-white border-slate-200 text-slate-700 hover:text-cyan-600 hover:border-cyan-400"}`}>
                  <ChevronDown size={20} className="-rotate-90" />
                </button>
              </div>
            </div>

            <section>
              <SectionHeader title="TOOLKIT COLLECTIONS" link="/toolkits" count={toolkits.length} />
              
              <div className="relative group/carousel">
                {/* Edge Fades */}
                <div className={`absolute left-0 top-0 bottom-8 w-20 bg-gradient-to-r ${dark ? "from-[#10131a]" : "from-slate-50"} to-transparent z-10 pointer-events-none`} />
                <div className={`absolute right-0 top-0 bottom-8 w-20 bg-gradient-to-l ${dark ? "from-[#10131a]" : "from-slate-50"} to-transparent z-10 pointer-events-none`} />

                <div
                  id="toolkits-carousel"
                  className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide no-scrollbar px-4 md:px-10"
                >
                  {[...toolkits, ...toolkits].map((toolkit, idx) => (
                    <div key={`${toolkit.id}-${idx}`} className="min-w-[280px] md:min-w-[350px]">
                      <ToolkitCard item={toolkit} />
                    </div>
                  ))}
                  {toolkits.length === 0 && (
                    <div className="min-w-full text-center py-10 text-slate-500 font-bold uppercase tracking-widest text-xs">
                      No toolkit collections available.
                    </div>
                  )}
                </div>

                {/* Carousel Controls */}
                <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                  <button
                    onClick={() => document.getElementById("toolkits-carousel").scrollBy({ left: -400, behavior: "smooth" })}
                    className={`p-3 rounded-full border shadow-xl transition-all ${dark ? "bg-[#161b22] border-[#3b494b] text-white hover:text-cyan-400" : "bg-white border-slate-200 text-slate-700 hover:text-cyan-600 hover:border-cyan-400"}`}
                  >
                    <ChevronDown size={20} className="rotate-90" />
                  </button>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                  <button
                    onClick={() => document.getElementById("toolkits-carousel").scrollBy({ left: 400, behavior: "smooth" })}
                    className={`p-3 rounded-full border shadow-xl transition-all ${dark ? "bg-[#161b22] border-[#3b494b] text-white hover:text-cyan-400" : "bg-white border-slate-200 text-slate-700 hover:text-cyan-600 hover:border-cyan-400"}`}
                  >
                    <ChevronDown size={20} className="-rotate-90" />
                  </button>
                </div>
              </div>
            </section>

            {/* Knowledge Stream Carousel */}
            <section className="mt-3">
              <SectionHeader title="KNOWLEDGE STREAM" link="/research" count={research.length || "0"} />
              <div className="relative group/carousel">
                <div className={`absolute left-0 top-0 bottom-8 w-20 bg-gradient-to-r ${dark ? "from-[#10131a]" : "from-slate-50"} to-transparent z-10 pointer-events-none`} />
                <div className={`absolute right-0 top-0 bottom-8 w-20 bg-gradient-to-l ${dark ? "from-[#10131a]" : "from-slate-50"} to-transparent z-10 pointer-events-none`} />

                <div
                  id="knowledge-carousel"
                  className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide no-scrollbar px-4 md:px-10"
                >
                  {(research || []).length > 0 ? [...research, ...research].map((res, idx) => (
                    <div key={`${res.id || idx}-${idx}`} className="min-w-[350px] md:min-w-[500px]">
                      <KnowledgeCard item={res} />
                    </div>
                  )) : null}
                  {research.length === 0 && (
                    <div className="min-w-full text-center py-10 text-slate-500 font-bold uppercase tracking-widest text-xs">
                      No research available.
                    </div>
                  )}
                </div>

                <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                  <button onClick={() => document.getElementById("knowledge-carousel").scrollBy({ left: -500, behavior: "smooth" })} className={`p-3 rounded-full border shadow-xl transition-all ${dark ? "bg-[#161b22] border-[#3b494b] text-white hover:text-cyan-400" : "bg-white border-slate-200 text-slate-700 hover:text-cyan-600 hover:border-cyan-400"}`}>
                    <ChevronDown size={20} className="rotate-90" />
                  </button>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
                  <button onClick={() => document.getElementById("knowledge-carousel").scrollBy({ left: 500, behavior: "smooth" })} className={`p-3 rounded-full border shadow-xl transition-all ${dark ? "bg-[#161b22] border-[#3b494b] text-white hover:text-cyan-400" : "bg-white border-slate-200 text-slate-700 hover:text-cyan-600 hover:border-cyan-400"}`}>
                    <ChevronDown size={20} className="-rotate-90" />
                  </button>
                </div>
              </div>
            </section>

            <AdBanner position="BOTTOM_FULL" />
          </div>
        )}

        {activeTab === "NEWS" && (
          <div className="pb-20">
            <SectionHeader title="GLOBAL TECH INTEL" count={news.length} />
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
            <Button as="Link" to={`/${activeTab.toLowerCase()}`} variant="primary" className="mt-6">
              Open Full Directory
            </Button>
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
