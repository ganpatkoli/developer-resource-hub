import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Radio, ChevronDown, Newspaper, Clock, MessageSquare, Share2, Globe, ArrowUpRight } from "lucide-react";
import client from "../api/client";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import AdBanner from "../components/AdBanner";

const PAGE_SIZE = 12;

const RSS_FEEDS = [
  { url: "https://news.google.com/rss/search?q=technology&hl=en-IN&gl=IN&ceid=IN:en", category: "GOOGLE TECH" },
  { url: "https://github.blog/feed/", category: "GITHUB GLOBAL" },
  { url: "https://openai.com/news/rss.xml", category: "AI ADVERSARIAL" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", category: "CRYPTO DATA" },
  { url: "https://techcrunch.com/feed/", category: "TECH ROOT" }
];

function NewsCard({ item, idx }) {
  const { dark } = useTheme();
  const cleanDescription = item.description?.replace(/<[^>]*>?/gm, '').split(' ').slice(0, 25).join(' ') + '...';
  
  return (
    <article className={`group relative flex flex-col p-6 rounded-2xl border transition-all duration-300 overflow-hidden h-[340px] ${dark ? "bg-[#111622] border-[#1A2333] hover:border-cyan-500/50" : "bg-white border-slate-200 shadow-lg shadow-slate-100 hover:border-blue-400"}`}>
      {/* Decorative Glow */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all" />

      <div className="flex gap-4 mb-5">
        {/* Compact Thumbnail/Icon */}
        <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden border border-[#1A2333] bg-[#0B0F19] flex items-center justify-center relative group-hover:border-cyan-500/50 transition-colors">
          {item.image ? (
            <img src={item.image} alt={item.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
          ) : (
            <Newspaper size={24} className="text-cyan-500/40" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-cyan-500/10 text-cyan-400 text-[8px] font-black px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-[0.1em]">
              {item.category || "TECH INTEL"}
            </span>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate">
               {item.source?.toUpperCase().replace('TECHNOLOGY - GOOGLE NEWS', 'GOOGLE HUB') || "REUTERS INTEL"}
            </span>
          </div>
          <h3 className={`text-[14px] font-black leading-tight group-hover:text-cyan-400 transition-colors line-clamp-2 uppercase tracking-tight ${dark ? "text-slate-100" : "text-slate-900"}`}>
            {item.title}
          </h3>
        </div>
      </div>

      <p className={`text-[11px] leading-relaxed mb-6 line-clamp-4 flex-grow font-medium ${dark ? "text-slate-400" : "text-slate-600"}`}>
        {cleanDescription}
      </p>

      <div className="flex items-center justify-between pt-5 border-t border-[#3b494b]/20">
        <div className="flex items-center gap-3 text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">
          <Clock size={12} className="text-cyan-500/60" /> {new Date(item.pubDate || item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
        </div>
        <a 
          href={item.link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-[10px] font-black tracking-[0.1em] text-[#0B0F19] hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
        >
          SYNC INTEL <ArrowUpRight size={14} />
        </a>
      </div>
    </article>
  );
}

export default function NewsPublic() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeChip, setActiveChip] = useState("ALL");
  const { dark } = useTheme();

  const chips = [
    "ALL",
    "GOOGLE TECH",
    "GITHUB GLOBAL",
    "AI ADVERSARIAL",
    "CRYPTO DATA",
    "TECH ROOT"
  ];

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const allNews = [];
      
      for (const feed of RSS_FEEDS) {
        try {
          const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`);
          const data = await res.json();
          if (data.status === "ok") {
            allNews.push(...data.items.map(item => ({
              ...item,
              category: feed.category,
              source: data.feed.title || feed.category,
              image: item.enclosure?.link || item.thumbnail || null
            })));
          }
        } catch (e) {
          console.error(`Failed to fetch ${feed.category}`, e);
        }
      }

      setNews(allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)));
    } catch (err) {
      console.error("Failed to fetch news", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredNews = useMemo(() => {
    const today = new Date();
    const threshold = new Date(today);
    threshold.setDate(today.getDate() - 5);
    threshold.setHours(0, 0, 0, 0);

    return news
      .filter(item => activeChip === "ALL" || item.category === activeChip)
      .filter(item => {
        const itemDate = new Date(item.pubDate || item.date);
        return itemDate >= threshold;
      });
  }, [news, activeChip]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? "bg-[#0B0F19] text-slate-200" : "bg-slate-50 text-slate-900"} font-sans tracking-wide relative overflow-hidden`}>
      {/* Background Grid Pattern - Only in Dark Mode */}
      {dark && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#84949510_1px,transparent_1px),linear-gradient(to_bottom,#84949510_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      )}

      {/* Cinematic Gutter Ads */}
      <div className="hidden xl:block fixed left-4 top-1/2 -translate-y-1/2 z-40">
        <AdBanner position="LEFT_GUTTER" variant="skyscraper" />
      </div>
      <div className="hidden xl:block fixed right-4 top-1/2 -translate-y-1/2 z-40">
        <AdBanner position="RIGHT_GUTTER" variant="skyscraper" />
      </div>


      <main className="relative z-10 max-w-[1400px] mx-auto px-8 py-16">
        <div className="mb-16 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
          <h3 className={`text-[11px] font-black tracking-[0.3em] mb-4 uppercase flex items-center justify-center gap-4 before:content-[''] before:h-[1px] before:w-8 after:content-[''] after:h-[1px] after:w-8 ${dark ? "text-[#00dbe9] before:bg-[#00dbe9] after:bg-[#00dbe9]" : "text-blue-600 before:bg-blue-600 after:bg-blue-600"}`}>
            Intelligence Data Stream
          </h3>
          <h2 className={`text-6xl font-black tracking-tight uppercase ${dark ? "text-slate-100" : "text-slate-900"}`}>
            GLOBAL TECH INTEL
          </h2>
          <p className="mt-4 text-slate-500 text-sm font-medium tracking-widest uppercase">Real-time analysis of the evolving technological landscape</p>
        </div>

        {/* Intelligence Category Chips */}
        <div className="flex flex-wrap justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
          {chips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border ${
                activeChip === chip
                  ? "bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] scale-105"
                  : "bg-transparent border-[#3b494b] text-slate-500 hover:border-slate-400 hover:text-slate-300"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
          {filteredNews.map((item, idx) => (
            <NewsCard key={idx} item={item} idx={idx} />
          ))}
        </div>

        {news.length > 0 && (
          <div className="flex flex-col items-center justify-center pb-20">
            <button className="group text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase hover:text-cyan-400 transition-colors flex flex-col items-center gap-2">
              Sync More Intel
              <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform duration-300" />
            </button>
          </div>
        )}
      </main>

      <footer className="relative z-10 border-t border-[#3b494b] py-8 px-8 text-[10px] font-black tracking-widest text-slate-600 bg-[#10131a]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-8">
            <span className="text-cyan-600/50">SYSTEM_STREAM: ACTIVE</span>
            <span>DATA_LATENCY: 12ms</span>
            <span>SECURE_NODE: DHUB_INTEL_01</span>
          </div>
          <div className="flex gap-8 uppercase">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link to="/news" className="text-cyan-400">News Feed</Link>
            <Link to="/repos" className="hover:text-cyan-400 transition-colors">Repos</Link>
            <Link to="/websites" className="hover:text-cyan-400 transition-colors">Websites</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
