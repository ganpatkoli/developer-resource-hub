import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Radio, Eye, ChevronDown, Rocket, Layout, ArrowUpRight  ,Terminal, Briefcase, Zap, Star } from "lucide-react";
import client, { getUserToken } from "../api/client";
import { useSettings } from "../context/SettingsContext";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import AdBanner from "../components/AdBanner";
import Button from "../components/Button";

export default function ToolkitsPublic() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [toolkitPayload, setToolkitPayload] = useState({ data: [], page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const { dark } = useTheme();

  const fetchToolkits = useCallback(async (pageToLoad = 1, append = false) => {
    try {
      setLoading(true);
      const { data } = await client.get("/toolkits/public", { 
        params: { limit: 12, page: pageToLoad } 
      });
      setToolkitPayload(prev => ({
        ...data,
        data: append ? [...prev.data, ...(data.data || [])] : (data.data || []),
      }));
    } catch (err) {
      console.error("Failed to fetch toolkits:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToolkits(1, false);
  }, [fetchToolkits]);

  const loadMore = () => {
    if (toolkitPayload.page < toolkitPayload.totalPages && !loading) {
      fetchToolkits(toolkitPayload.page + 1, true);
    }
  };

  const filteredItems = useMemo(() => {
    const items = toolkitPayload.data || [];
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(item => 
      item.title?.toLowerCase().includes(q) || 
      item.description?.toLowerCase().includes(q) ||
      item.audience?.toLowerCase().includes(q)
    );
  }, [toolkitPayload.data, search]);

  const renderCards = (isDesktop = false) => {
    if (filteredItems.length === 0 && !loading) {
      return (
        <div className="col-span-full py-20 text-center">
          <Terminal size={48} className="mx-auto mb-4 text-slate-600 opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">No Resources Indexed</p>
        </div>
      );
    }

    return filteredItems.map((item, i) => {
      const accentClass = item.accentClass || "from-cyan-500 to-blue-400";
      
      if (isDesktop) {
        return (
          <article 
            key={item.id || i} 
            className={`group rounded-2xl border transition-all duration-500 flex flex-col justify-between relative overflow-hidden h-full ${dark ? "border-[#1A2333] bg-transparent hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.05)]" : "border-slate-200 bg-white shadow-lg shadow-slate-100 hover:border-cyan-400/50 hover:shadow-xl"}`}
          >
            {/* Background Accent Blur */}
            <div className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-500 opacity-5 blur-3xl transition-opacity duration-700 group-hover:opacity-15`}></div>
            
            <div className="p-6 relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-xl border flex items-center justify-center transition-all duration-300 ${dark ? "border-cyan-500/20 bg-cyan-500/5 text-cyan-400 group-hover:bg-cyan-500/10 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]" : "border-cyan-200 bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100 group-hover:scale-110"}`}>
                    <Zap size={24} fill="currentColor" className="opacity-90" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black tracking-[0.2em] uppercase mb-1 ${dark ? "text-slate-500" : "text-slate-500"}`}>
                      {item.audience || "DEVELOPER"}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">
                
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-500 group-hover:text-cyan-400 transition-colors">
                  <Eye size={14} /> {item.views || 0}
                </div>
              </div>
              
              <h2 className={`mb-4 text-xl font-black line-clamp-2 uppercase tracking-wide leading-tight group-hover:text-cyan-400 transition-colors ${dark ? "text-slate-100" : "text-slate-800"}`}>
                {item.title}
              </h2>
              
              <p className={`mb-6 text-[13px] leading-relaxed line-clamp-3 font-medium ${dark ? "text-slate-400" : "text-slate-600"}`}>
                {item.description}
              </p>
            </div>

            <div className="px-6 pb-6 mt-auto relative z-10 border-t pt-5 border-[#3b494b]/20">
              <Button
                to={`/toolkits/${item.slug}`}
                variant="primary"
                className="w-full flex items-center justify-center gap-3"
              >
                ACCESS TOOLKIT <ArrowUpRight size={16} />
              </Button>
            </div>
          </article>
        );
      }

      return (
        <article key={item.id || i} className={`rounded-2xl border ${dark ? "border-[#1A2333] bg-transparent" : "border-slate-200 bg-white shadow-lg shadow-slate-100"} p-5 relative overflow-hidden hover-cyber-lift`}>
          <div className="flex gap-4 mb-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0B0F19] border border-[#1A2333] text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.1)]`}>
              <Briefcase size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className={`text-[15px] font-bold leading-snug mb-1 uppercase tracking-tight truncate ${dark ? "text-slate-100" : "text-slate-800"}`}>
                {item.title}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.05em] text-slate-500">
                AUDIENCE: <span className="text-fuchsia-400/80">{item.audience}</span>
              </p>
            </div>
          </div>
          
          <p className={`mb-5 text-[12px] leading-relaxed line-clamp-2 font-medium ${dark ? "text-slate-400" : "text-slate-600"}`}>
            {item.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500/80"><Eye size={12} /> {item.views || 0}</span>
            <Button
              to={`/toolkits/${item.slug}`}
              variant="primary"
              className="px-5"
            >
              OPEN MODULE
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

      {dark && (
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#84949510_1px,transparent_1px),linear-gradient(to_bottom,#84949510_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      )}

      {/* MOBILE LAYOUT */}
      <div className="mx-auto block max-w-md pb-24 lg:hidden">
        <header className={`flex items-center justify-between border-b px-4 py-4 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300 ${dark ? "border-[#3b494b] bg-[#10131a]/90" : "border-slate-200 bg-white/90"}`}>
          <div className="flex items-center gap-3">
            <Layout size={16} className={dark ? "text-[#00dbe9]" : "text-blue-600"} />
            <h1 className={`text-[13px] font-black tracking-[0.15em] uppercase ${dark ? "text-[#00dbe9] shadow-[#00dbe9] drop-shadow-[0_0_8px_rgba(0,219,233,0.4)]" : "text-blue-600"}`}>
              TOOLKIT HUB
            </h1>
          </div>
          <ThemeToggle className={dark ? "!bg-[#161b22] !border-[#3b494b]" : "!bg-slate-100 !border-slate-200"} />
        </header>

        <main className="px-4 py-6 animate-fade-in-up">
          <div className={`mb-8 flex items-center gap-2 rounded-xl border ${dark ? "border-[#3b494b] bg-[#161b22]" : "border-slate-200 bg-white"} px-4 py-3 focus-within:border-[#00dbe9]/50 transition-all shadow-sm`}>
            <Search size={16} className="text-slate-500" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="SEARCH TOOLKITS..."
              className="w-full bg-transparent text-[12px] font-bold text-slate-300 outline-none placeholder:text-slate-600 uppercase tracking-wider"
            />
          </div>

          <div className="mb-6">
            <h3 className="text-[10px] font-black tracking-[0.3em] text-cyan-400 mb-1 uppercase">RESOURCES</h3>
            <h2 className="text-3xl font-black text-slate-100 uppercase tracking-tighter">Toolkit<br />Archive</h2>
          </div>

          <div className="space-y-4">
            {renderCards(false)}
          </div>

          {toolkitPayload.page < toolkitPayload.totalPages && (
            <div className="mt-8 text-center">
              <Button
                variant="secondary"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? "INITIALIZING..." : "LOAD MORE RESOURCES"}
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className={`mx-auto hidden min-h-screen max-w-[1400px] flex-col lg:flex transition-colors duration-300 bg-transparent`}>
        <main className="flex-1 px-8 py-12 max-w-[1200px] mx-auto w-full animate-fade-in-up">
          <div className="mb-12 text-center">
            <h3 className={`text-[11px] font-black tracking-[0.3em] mb-4 uppercase flex items-center justify-center gap-4 before:content-[''] before:h-[1px] before:w-8 after:content-[''] after:h-[1px] after:w-8 ${dark ? "text-cyan-400 before:bg-cyan-400 after:bg-cyan-400" : "text-cyan-600 before:bg-cyan-600 after:bg-cyan-600"}`}>
              Technical Resource Ecosystem
            </h3>
            <h2 className={`text-5xl font-black tracking-tight uppercase drop-shadow-md ${dark ? "text-slate-100" : "text-slate-900"}`}>
              TOOLKIT VAULT
            </h2>
          </div>

          <div className="mb-10 flex gap-4">
            <div className={`flex h-14 flex-1 items-center gap-3 rounded-xl px-5 border transition-all focus-within:ring-1 ${dark ? "bg-[#161b22] border-[#3b494b] focus-within:border-[#00dbe9]/50 focus-within:ring-[#00dbe9]/20" : "bg-white border-slate-200 focus-within:border-blue-400 focus-within:ring-blue-500/10 shadow-sm"}`}>
              <Search size={18} className="text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="QUERY TOOLKITS (E.G. NEXTJS, PROMPT ENGINEERING, DATABASE OPTIMIZATION...)"
                className={`w-full bg-transparent text-[13px] tracking-widest outline-none placeholder:text-slate-600 uppercase font-black ${dark ? "text-slate-300" : "text-slate-800"}`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {renderCards(true)}
          </div>

          {toolkitPayload.page < toolkitPayload.totalPages && (
            <div className="flex flex-col items-center justify-center mt-8 pb-10">
              <Button
                variant="secondary"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? "PROCESSING..." : "ACCESS ADDITIONAL RESOURCES"}
              </Button>
            </div>
          )}
        </main>

        <footer className={`mt-auto flex items-center justify-between border-t py-6 px-8 text-[10px] font-semibold tracking-widest transition-colors duration-300 ${dark ? "border-[#1A2333] text-slate-600 bg-[#0B0F19]" : "border-slate-200 text-slate-400 bg-slate-50"}`}>
          <div className="flex gap-6">
            <span className={dark ? "text-cyan-600/80 shadow-cyan-600 drop-shadow-[0_0_5px_rgba(8,145,178,0.5)]" : "text-blue-400"}>© 2026 AI GUARDIAN CLOUD. ALL RESOURCES VERIFIED.</span>
          </div>
          <div className="flex gap-8">
            <span className="hover:text-cyan-400 cursor-pointer transition-colors uppercase">Documentation</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors uppercase">Registry</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors uppercase">Terminal</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors uppercase">Support</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
