import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Globe,
  Menu,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import client from "../api/client";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import ThemeToggle from "../components/ThemeToggle";
import { useAdminUI } from "../context/AdminUIContext";

export default function WebsiteManagementView() {
  const { toggleSidebar } = useAdminUI();
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  async function loadData() {
    setLoading(true);
    try {
      const [postRes, catRes] = await Promise.all([
        client.get("/posts", { params: { type: "website", limit: 500 } }),
        client.get("/categories?type=website")
      ]);
      setWebsites(postRes.data?.data || []);
      setCategories(catRes.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredWebsites = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = websites;
    
    if (activeFilter !== "ALL") {
      result = result.filter(site => site.category?._id === activeFilter);
    }
    
    if (q) {
      result = result.filter((site) => {
        const title = String(site.title || "").toLowerCase();
        const description = String(site.description || "").toLowerCase();
        const catName = String(site.category?.name || "").toLowerCase();
        return title.includes(q) || description.includes(q) || catName.includes(q);
      });
    }
    
    return result;
  }, [websites, query, activeFilter]);

  async function onDelete(websiteId) {
    const ok = window.confirm("Delete this website?");
    if (!ok) return;
    try {
      await client.delete(`/posts/${websiteId}`, { authType: "admin" });
      await loadData();
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#10131a] text-[#e1e2eb] font-sans relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#84949510_1px,transparent_1px),linear-gradient(to_bottom,#84949510_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="mx-auto hidden min-h-screen grid-cols-[280px_1fr] lg:grid relative z-10">
        <AdminSidebar active="websites" />

        <section className="min-w-0 flex flex-col">
          <AdminHeader title="System Websites" />

          <main className="px-6 py-8 flex-1">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-[#e1e2eb] uppercase">Site_Registry</h1>
                <p className="mt-1 text-sm font-bold text-[#b9cacb]">External resource indexing and validation.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 items-center gap-2 border border-[#3b494b] bg-[#161b22]/70 px-4 transition-all focus-within:border-[#ebb2ff]">
                  <Search size={16} className="text-[#849495]" />
                  <input 
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search archives..."
                    className="bg-transparent text-sm font-bold outline-none placeholder:text-[#849495]/50 text-[#e1e2eb] uppercase tracking-widest w-48 md:w-64"
                  />
                </div>
                <Link to="/admin/websites/new" className="flex h-11 items-center justify-center gap-2 border border-[#ebb2ff] bg-[#ebb2ff]/10 hover:bg-[#ebb2ff]/20 px-6 py-2.5 text-sm font-bold text-[#ebb2ff] uppercase tracking-widest transition-all">
                  <Plus size={18} /> New_Site
                </Link>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-[#3b494b]/30">
               <button
                  onClick={() => setActiveFilter("ALL")}
                  className={`shrink-0 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                    activeFilter === "ALL" 
                    ? "border-[#ebb2ff] text-[#ebb2ff] bg-[#ebb2ff]/5" 
                    : "border-transparent text-[#849495] hover:text-[#e1e2eb]"
                  }`}
               >
                  All_Stations
               </button>
               {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setActiveFilter(cat._id)}
                    className={`shrink-0 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                      activeFilter === cat._id 
                      ? "border-[#ebb2ff] text-[#ebb2ff] bg-[#ebb2ff]/5" 
                      : "border-transparent text-[#849495] hover:text-[#e1e2eb]"
                    }`}
                  >
                    {cat.name.replace(/ /g, "_")}
                  </button>
               ))}
            </div>

            <section className="border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl">
              <div className="border-b border-[#3b494b] px-6 py-4">
                <h2 className="text-lg font-bold text-[#e1e2eb] uppercase tracking-wider">Website List</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left">
                  <thead className="text-[11px] uppercase tracking-[0.15em] font-bold bg-[#10131a] text-[#849495]">
                    <tr>
                      <th className="px-6 py-4">Website</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3b494b]">
                    {loading && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-sm text-[#849495] italic text-center font-bold uppercase tracking-widest">
                          <div className="flex flex-col items-center gap-2">
                             <div className="h-6 w-6 border-2 border-[#ebb2ff]/20 border-t-[#ebb2ff] rounded-full animate-spin" />
                             Synchronizing archives...
                          </div>
                        </td>
                      </tr>
                    )}
                    {!loading &&
                      filteredWebsites.map((website) => (
                        <tr key={website._id} className="transition-all hover:bg-[#272a31]/50 group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center bg-[#ebb2ff]/10 text-[#ebb2ff] border border-[#ebb2ff]/30 group-hover:border-[#ebb2ff] transition-all">
                                <Globe size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-[#e1e2eb] tracking-wide truncate">{website.title}</p>
                                <a href={website.link} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-[#ebb2ff]/60 hover:text-[#ebb2ff] uppercase tracking-widest transition-colors">
                                  Access_Network
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="max-w-[360px] px-6 py-4 text-sm text-[#b9cacb] leading-relaxed line-clamp-2">{website.description}</td>
                          <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#849495]">
                            <span className="px-2 py-1 border border-[#3b494b] bg-[#10131a]">
                              {website.category?.name || "General"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => navigate(`/admin/websites/${website._id}/edit`)} className="p-2 border border-[#3b494b] bg-[#10131a] text-[#849495] hover:text-[#ebb2ff] hover:border-[#ebb2ff] transition-all">
                                <Pencil size={15} />
                              </button>
                              <button onClick={() => onDelete(website._id)} className="p-2 border border-[#3b494b] bg-[#10131a] text-[#849495] hover:text-[#ffb4ab] hover:border-[#ffb4ab] transition-all">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {!loading && filteredWebsites.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-sm text-[#849495] italic text-center font-bold uppercase tracking-widest">
                          No indexed sites found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </main>
          <AdminFooter />
        </section>
      </div>

      <div className="mx-auto min-h-screen w-full lg:hidden relative z-10 flex flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#3b494b] bg-[#161b22]/90 backdrop-blur-md px-4 sticky top-0 z-10">
           <div className="flex items-center gap-3">
              <button 
                onClick={toggleSidebar}
                className="flex h-10 w-10 items-center justify-center border border-[#ebb2ff]/30 bg-[#ebb2ff]/5 text-[#ebb2ff] hover:bg-[#ebb2ff]/15 hover:border-[#ebb2ff] transition-all"
              >
                <Menu size={20} strokeWidth={2.5} />
              </button>
              <h1 className="text-xs font-bold tracking-[0.15em] uppercase text-[#e1e2eb]">Sites_Ctrl</h1>
           </div>
           <div className="flex items-center gap-3">
              <Search size={20} className="text-[#ebb2ff]" />
           </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-6">
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex h-12 items-center gap-3 border border-[#3b494b] bg-[#161b22]/70 px-4 transition-all focus-within:border-[#ebb2ff]">
              <Search size={18} className="text-[#849495]" />
              <input 
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH_SITES..."
                className="bg-transparent text-sm font-bold outline-none placeholder:text-[#849495]/50 text-[#e1e2eb] uppercase tracking-widest w-full"
              />
            </div>
            <Link to="/admin/websites/new" className="flex items-center justify-center gap-2 border border-[#ebb2ff] bg-[#ebb2ff]/10 text-[#ebb2ff] px-4 py-4 text-[11px] font-bold uppercase tracking-widest transition-all">
              <Plus size={20} /> Publish_New_Link
            </Link>
          </div>

          {/* Category Tabs Mobile */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-[#3b494b]/30 -mx-4 px-4">
             <button
                onClick={() => setActiveFilter("ALL")}
                className={`shrink-0 px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-all border ${
                  activeFilter === "ALL" 
                  ? "border-[#ebb2ff] bg-[#ebb2ff]/10 text-[#ebb2ff]" 
                  : "border-[#3b494b] bg-[#161b22] text-[#849495]"
                }`}
             >
                ALL
             </button>
             {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveFilter(cat._id)}
                  className={`shrink-0 px-5 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-all border ${
                    activeFilter === cat._id 
                    ? "border-[#ebb2ff] bg-[#ebb2ff]/10 text-[#ebb2ff]" 
                    : "border-[#3b494b] bg-[#161b22] text-[#849495]"
                  }`}
                >
                  {cat.name.split(" ")[0]}
                </button>
             ))}
          </div>

          <div className="space-y-4">
            {loading && <p className="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-[#849495]">Accessing network...</p>}
            {!loading &&
              filteredWebsites.map((website) => (
                <article key={website._id} className="border border-[#3b494b] bg-[#161b22]/70 p-5 backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex items-center justify-center bg-[#ebb2ff]/10 text-[#ebb2ff] border border-[#ebb2ff]/30 h-10 w-10 shrink-0">
                      <Globe size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#e1e2eb] text-sm uppercase tracking-wide truncate">{website.title}</p>
                      <p className="mt-2 text-xs text-[#b9cacb] line-clamp-2 leading-relaxed">{website.description}</p>
                      <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.15em] text-[#ebb2ff] border-t border-[#3b494b]/50 pt-3">
                        {website.category?.name || "General"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-end gap-4 border-t border-[#3b494b] pt-4">
                    <button onClick={() => navigate(`/admin/websites/${website._id}/edit`)} className="p-2 border border-[#3b494b] text-[#849495] hover:text-[#ebb2ff]">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => onDelete(website._id)} className="p-2 border border-[#3b494b] text-[#849495] hover:text-[#ffb4ab]">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
