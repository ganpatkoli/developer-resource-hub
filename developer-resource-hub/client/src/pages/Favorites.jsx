import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Star, Database, Globe, BookOpen, User, ChevronRight, Search, Trash2, ExternalLink } from "lucide-react";
import client, { getUserToken } from "../api/client";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { dark } = useTheme();
  const navigate = useNavigate();

  const loadFavorites = useCallback(async () => {
    if (!getUserToken()) {
      navigate("/login");
      return;
    }
    try {
      setLoading(true);
      const { data } = await client.get("/user/favorites", { authType: "user" });
      setFavorites(data || []);
    } catch (err) {
      console.error("Failed to load favorites", err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const removeFavorite = async (kind, itemId) => {
    const endpoint = kind === "post" ? "/user/favorites/post/toggle" : "/user/favorites/resource/toggle";
    const body = kind === "post" ? { postId: itemId } : { resourceId: itemId };
    try {
      await client.post(endpoint, body, { authType: "user" });
      setFavorites(prev => prev.filter(f => f.item?.id !== itemId));
    } catch (err) {
      console.error("Failed to remove favorite", err);
    }
  };

  const filteredFavs = useMemo(() => {
    if (!search.trim()) return favorites;
    const s = search.toLowerCase();
    return favorites.filter(f =>
      f.item?.title?.toLowerCase().includes(s) ||
      f.item?.description?.toLowerCase().includes(s)
    );
  }, [favorites, search]);

  const grouped = useMemo(() => {
    return {
      REPOS: filteredFavs.filter(f => f.kind === "post" && f.item?.type === "repo"),
      WEBSITES: filteredFavs.filter(f => f.kind === "post" && f.item?.type === "website"),
      RESEARCH: filteredFavs.filter(f => f.kind === "post" && f.item?.type === "research"),
      CUSTOM: filteredFavs.filter(f => f.kind === "userResource"),
    };
  }, [filteredFavs]);

  const renderSection = (title, items, Icon, colorClass) => {
    if (items.length === 0) return null;
    return (
      <section className="mb-10">
        <h3 className={`mb-4 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase ${colorClass}`}>
          <Icon size={14} />
          {title} ({items.length})
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((fav) => (
            <div key={fav.id} className={`group relative rounded-xl border p-4 transition-all hover:scale-[1.02] ${dark ? "border-slate-800 bg-slate-900/50 hover:bg-slate-900" : "border-slate-200 bg-white shadow-sm hover:shadow-md"}`}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className={`text-sm font-bold truncate uppercase tracking-tight ${dark ? "text-slate-100" : "text-slate-900"}`}>
                  {fav.item?.title || "Untitled Resource"}
                </h4>
                <button
                  onClick={() => removeFavorite(fav.kind, fav.item?.id)}
                  className="text-slate-500 hover:text-rose-500 transition-colors p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className={`text-[11px] leading-relaxed line-clamp-2 mb-4 ${dark ? "text-slate-400" : "text-slate-600"}`}>
                {fav.item?.description || "No description provided."}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded border ${dark ? "border-slate-700 bg-slate-800 text-slate-400" : "border-slate-100 bg-slate-50 text-slate-500"}`}>
                  {fav.item?.category?.name || (fav.kind === "userResource" ? "PRIVATE" : "PUBLIC")}
                </span>
                <a
                  href={fav.item?.link}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-1.5 text-[9px] font-black tracking-widest uppercase transition-colors ${dark ? "text-cyan-400 hover:text-cyan-300" : "text-blue-600 hover:text-blue-700"}`}
                >
                  Open <ExternalLink size={10} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className={`min-h-screen font-sans tracking-wide transition-colors duration-300 ${dark ? "bg-[#0B0F19] text-slate-200" : "bg-slate-50 text-slate-900"}`}>
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md ${dark ? "border-slate-800 bg-[#0B0F19]/90" : "border-slate-200 bg-white/90"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${dark ? "bg-cyan-500/10 text-cyan-400" : "bg-blue-500/10 text-blue-600"}`}>
              <Star size={18} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-[0.2em] uppercase">Security_Vault</h1>
              <p className="text-[9px] font-bold text-slate-500 tracking-widest">FAVORITE_RESOURCES_INDEX</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/" className={`text-[10px] font-black tracking-widest border rounded-lg px-3 py-1.5 transition-all ${dark ? "border-slate-800 hover:border-slate-700 text-slate-400" : "border-slate-200 hover:border-slate-300 text-slate-500"}`}>
              EXIT_VAULT
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all focus-within:ring-1 ${dark ? "border-slate-800 bg-slate-900 focus-within:border-cyan-500/50 focus-within:ring-cyan-500/20" : "border-slate-200 bg-white focus-within:border-blue-400 focus-within:ring-blue-500/10 shadow-sm"}`}>
            <Search size={18} className="text-slate-500" />
            <input
              type="text"
              placeholder="SEARCH VAULT DATA..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs font-bold tracking-widest outline-none placeholder:text-slate-600 uppercase"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="h-10 w-10 rounded-full border-2 border-t-cyan-400 border-transparent animate-spin mb-4" />
            <span className="text-[10px] font-black tracking-widest text-slate-500">DECRYPTING_FAVORITES...</span>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-800">
            <Star size={40} className="mx-auto text-slate-700 mb-4" />
            <h2 className="text-sm font-bold text-slate-500 mb-2">VAULT_EMPTY</h2>
            <p className="text-[10px] text-slate-600 tracking-widest mb-6">No resources have been tagged for offline persistence.</p>
            <Link to="/repos" className="inline-block bg-cyan-500 text-[#0B0F19] text-[10px] font-black tracking-widest px-6 py-3 rounded-lg hover:bg-cyan-400 transition-colors">
              BROWSE_SYSTEMS
            </Link>
          </div>
        ) : (
          <>
            {renderSection("Core Repositories", grouped.REPOS, Database, "text-cyan-400")}
            {renderSection("Network Platforms", grouped.WEBSITES, Globe, "text-blue-400")}
            {renderSection("Research Papers", grouped.RESEARCH, BookOpen, "text-fuchsia-400")}
            {renderSection("Private Records", grouped.CUSTOM, User, "text-emerald-400")}
          </>
        )}
      </main>

      {/* Mobile Footer Spacing */}
      <div className="h-24 lg:hidden" />
    </div>
  );
}
