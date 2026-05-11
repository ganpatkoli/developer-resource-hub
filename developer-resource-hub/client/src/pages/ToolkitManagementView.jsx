import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Menu,
  Pencil,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  ShieldCheck,
  EyeOff
} from "lucide-react";
import client from "../api/client";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import { useAdminUI } from "../context/AdminUIContext";

export default function ToolkitManagementView() {
  const PAGE_SIZE = 20;
  const { toggleSidebar } = useAdminUI();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function loadData(pageToLoad = 1) {
    setLoading(true);
    try {
      const { data } = await client.get("/toolkits", {
        authType: "admin",
        params: {
          limit: PAGE_SIZE,
          page: pageToLoad,
          ...(query.trim() ? { search: query.trim() } : {}),
        },
      });
      setItems(data?.data || []);
      setPage(data?.page || pageToLoad);
      setTotalPages(data?.totalPages || 1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData(1);
  }, [query]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const title = String(item.title || "").toLowerCase();
      const audience = String(item.audience || "").toLowerCase();
      const description = String(item.description || "").toLowerCase();
      return title.includes(q) || audience.includes(q) || description.includes(q);
    });
  }, [items, query]);

  async function onDelete(id) {
    const ok = window.confirm("Decommission this toolkit archive?");
    if (!ok) return;
    try {
      await client.delete(`/toolkits/${id}`, { authType: "admin" });
      await loadData(page);
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#10131a] text-[#e1e2eb] font-sans relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#84949510_1px,transparent_1px),linear-gradient(to_bottom,#84949510_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="mx-auto hidden min-h-screen grid-cols-[280px_1fr] lg:grid relative z-10">
        <AdminSidebar active="toolkits" />

        <section className="min-w-0 flex flex-col">
          <AdminHeader title="Resource Management" />

          <main className="px-6 py-8 flex-1">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-[#e1e2eb] uppercase">Toolkit Engine</h1>
                <p className="mt-1 text-sm font-bold text-[#b9cacb]">Integrated resource hubs and technical packages.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 items-center gap-2 border border-[#3b494b] bg-[#161b22]/70 px-4 transition-all focus-within:border-orange-500">
                  <Search size={16} className="text-[#849495]" />
                  <input 
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search archives..."
                    className="bg-transparent text-sm font-bold outline-none placeholder:text-[#849495]/50 text-[#e1e2eb] uppercase tracking-widest w-48 md:w-64"
                  />
                </div>
                <Link to="/admin/toolkits/new" className="flex h-11 items-center justify-center gap-2 border border-orange-500 bg-orange-500/10 hover:bg-orange-500/20 px-6 py-2.5 text-sm font-bold text-orange-500 uppercase tracking-widest transition-all">
                  <Plus size={18} /> New Toolkit
                </Link>
              </div>
            </div>

            <section className="border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl">
              <div className="border-b border-[#3b494b] px-6 py-4 flex justify-between items-center">
                <h2 className="text-lg font-bold text-[#e1e2eb] uppercase tracking-wider">Archive List</h2>
                <span className="text-[10px] font-bold text-[#849495] uppercase tracking-widest">{items.length} Packages Found</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left">
                  <thead className="text-[11px] uppercase tracking-[0.15em] font-bold bg-[#10131a] text-[#849495]">
                    <tr>
                      <th className="px-6 py-4">Toolkit Package</th>
                      <th className="px-6 py-4">Audience</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3b494b]">
                    {loading && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-sm text-[#849495] italic text-center font-bold uppercase tracking-widest">
                           <div className="flex flex-col items-center gap-2">
                             <div className="h-6 w-6 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                             Scanning archives...
                          </div>
                        </td>
                      </tr>
                    )}
                    {!loading && filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-sm text-[#849495] text-center font-bold uppercase tracking-widest">No matching archives found in the vault.</td>
                      </tr>
                    )}
                    {!loading &&
                      filteredItems.map((item) => (
                        <tr key={item.id} className="transition-all hover:bg-[#272a31]/50 group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center bg-orange-500/10 text-orange-500 border border-orange-500/30 group-hover:border-orange-500 transition-all">
                                <Briefcase size={18} />
                              </div>
                              <div>
                                <p className="font-bold text-[#e1e2eb] tracking-wide">{item.title}</p>
                                <p className="text-[10px] text-[#849495] font-mono mt-0.5">/{item.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="px-2 py-1 border border-[#3b494b] bg-[#10131a] text-[10px] font-bold uppercase tracking-widest text-[#b9cacb]">
                                {item.audience || "General"}
                             </span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                                {item.active !== false ? (
                                   <div className="flex items-center gap-1.5 text-emerald-400">
                                      <ShieldCheck size={12} />
                                      <span className="text-[9px] font-black uppercase tracking-widest">Online</span>
                                   </div>
                                ) : (
                                   <div className="flex items-center gap-1.5 text-red-400">
                                      <EyeOff size={12} />
                                      <span className="text-[9px] font-black uppercase tracking-widest">Hidden</span>
                                   </div>
                                )}
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <a 
                                href={`/toolkits/${item.slug}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 border border-[#3b494b] bg-[#10131a] text-[#849495] hover:text-[#00dbe9] hover:border-[#00dbe9] transition-all"
                              >
                                <ExternalLink size={15} />
                              </a>
                              <button onClick={() => navigate(`/admin/toolkits/${item.id}/edit`)} className="p-2 border border-[#3b494b] bg-[#10131a] text-[#849495] hover:text-orange-400 hover:border-orange-400 transition-all">
                                <Pencil size={15} />
                              </button>
                              <button onClick={() => onDelete(item.id)} className="p-2 border border-[#3b494b] bg-[#10131a] text-[#849495] hover:text-[#ffb4ab] hover:border-[#ffb4ab] transition-all">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-6 py-3 border-t border-[#3b494b] text-xs font-bold text-[#849495]">
                <span>Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadData(page - 1)}
                    disabled={loading || page <= 1}
                    className="px-3 py-1 border border-[#3b494b] disabled:opacity-40 hover:bg-white/5"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => loadData(page + 1)}
                    disabled={loading || page >= totalPages}
                    className="px-3 py-1 border border-[#3b494b] disabled:opacity-40 hover:bg-white/5"
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          </main>
          <AdminFooter />
        </section>
      </div>

      {/* Mobile Layout */}
      <div className="mx-auto min-h-screen w-full lg:hidden relative z-10 flex flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#3b494b] bg-[#161b22]/90 backdrop-blur-md px-4 sticky top-0 z-10">
           <div className="flex items-center gap-3">
              <button 
                onClick={toggleSidebar}
                className="flex h-10 w-10 items-center justify-center border border-orange-500/30 bg-orange-500/5 text-orange-500 hover:bg-orange-500/15 hover:border-orange-500 transition-all"
              >
                <Menu size={20} strokeWidth={2.5} />
              </button>
              <h1 className="text-xs font-bold tracking-[0.15em] uppercase text-[#e1e2eb]">Engine Ctrl</h1>
           </div>
           <div className="flex items-center gap-3">
              <Search size={20} className="text-orange-500" />
           </div>
        </header>

        <main className="flex-1 px-4 pb-28 pt-6">
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex h-12 items-center gap-3 border border-[#3b494b] bg-[#161b22]/70 px-4 transition-all focus-within:border-orange-500">
              <Search size={18} className="text-[#849495]" />
              <input 
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH TOOLKITS..."
                className="bg-transparent text-sm font-bold outline-none placeholder:text-[#849495]/50 text-[#e1e2eb] uppercase tracking-widest w-full"
              />
            </div>
            <Link to="/admin/toolkits/new" className="flex items-center justify-center gap-2 border border-orange-500 bg-orange-500/10 text-orange-500 px-4 py-4 text-[11px] font-bold uppercase tracking-widest transition-all">
              <Plus size={20} /> DEPLOY_NEW_ARCHIVE
            </Link>
          </div>

          <div className="space-y-4">
            {loading && <p className="text-center py-10 text-[10px] font-bold uppercase tracking-widest text-[#849495]">Accessing engine...</p>}
            {!loading &&
              filteredItems.map((item) => (
                <article key={item.id} className="border border-[#3b494b] bg-[#161b22]/70 p-5 backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex items-center justify-center bg-orange-500/10 text-orange-500 border border-orange-500/30 h-10 w-10 shrink-0">
                      <Briefcase size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#e1e2eb] text-sm uppercase tracking-wide truncate">{item.title}</p>
                      <p className="mt-1 text-[9px] font-mono text-[#849495]">/{item.slug}</p>
                      <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.15em] text-orange-500">
                         FOR: {item.audience || "Developers"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-end gap-4 border-t border-[#3b494b] pt-4">
                    <button onClick={() => navigate(`/admin/toolkits/${item.id}/edit`)} className="p-2 border border-[#3b494b] text-[#849495] hover:text-orange-500">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="p-2 border border-[#3b494b] text-[#849495] hover:text-[#ffb4ab]">
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
