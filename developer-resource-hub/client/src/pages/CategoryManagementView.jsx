import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Beaker,
  FlaskConical,
  Gamepad2,
  Hammer,
  Newspaper,
  Plus,
  Pencil,
  Trash2,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Search,
  Filter,
} from "lucide-react";
import client from "../api/client";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";

const iconForCategory = (name) => {
  const n = String(name || "").toLowerCase();
  if (n.includes("news")) return Newspaper;
  if (n.includes("research")) return FlaskConical;
  if (n.includes("tech")) return Activity;
  if (n.includes("science")) return Beaker;
  if (n.includes("entertain")) return Gamepad2;
  if (n.includes("health")) return Activity;
  return Hammer;
};

export default function CategoryManagementView() {
  const PAGE_SIZE = 20;
  const [categories, setCategories] = useState([]);
  const [postCounts, setPostCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", type: "repo" });
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(c => 
      String(c.name || "").toLowerCase().includes(q) || 
      String(c.type || "").toLowerCase().includes(q)
    );
  }, [categories, query]);

  async function loadData(mounted = true, pageToLoad = 1) {
    setLoading(true);
    try {
      const [catRes, postRes] = await Promise.all([
        client.get("/categories", { params: { page: pageToLoad, limit: PAGE_SIZE } }),
        client.get("/posts", { params: { page: 1, limit: 500 } }),
      ]);
      if (!mounted) return;
      const catItems = catRes.data?.data || [];
      const posts = postRes.data?.data || [];
      const counts = {};
      posts.forEach((p) => {
        const id = p.category?.id || p.category;
        if (id) counts[id] = (counts[id] || 0) + 1;
      });
      setCategories(catItems);
      setPostCounts(counts);
      setPage(catRes.data?.page || pageToLoad);
      setTotalPages(catRes.data?.totalPages || 1);
    } finally {
      if (mounted) setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    loadData(mounted, 1);
    return () => { mounted = false; };
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newCat.name.trim()) return;
    try {
      setMessage("");
      await client.post("/categories", newCat, { authType: "admin" });
      setNewCat({ name: "", type: "repo" });
      setIsAdding(false);
      await loadData(true, 1);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create category.");
    }
  }

  async function toggleStatus(category) {
    try {
      const nextActive = !category.active;
      await client.put(`/categories/${category.id}`, { active: nextActive }, { authType: "admin" });
      await loadData(true, page);
    } catch (err) {
      setMessage("Failed to update status.");
    }
  }

  async function onDeleteCategory(categoryId) {
    const ok = window.confirm("Delete this category?");
    if (!ok) return;
    try {
      setMessage("");
      await client.delete(`/categories/${categoryId}`, { authType: "admin" });
      await loadData(true, page);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete category.");
    }
  }

  async function onEditCategory(category) {
    const nextName = window.prompt("Update category name", category.name || "");
    if (!nextName || !nextName.trim() || nextName.trim() === category.name) return;
    try {
      setMessage("");
      await client.put(`/categories/${category.id}`, { name: nextName.trim() }, { authType: "admin" });
      await loadData(true, page);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update category.");
    }
  }

  return (
    <div className="min-h-screen bg-[#10131a] text-[#e1e2eb] font-sans relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#84949510_1px,transparent_1px),linear-gradient(to_bottom,#84949510_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="mx-auto hidden min-h-screen grid-cols-[280px_1fr] lg:grid relative z-10">
        <AdminSidebar active="categories" />

        <section className="min-w-0 flex flex-col">
          <AdminHeader title="Category Management" />

          <main className="p-6 lg:p-10">
            <div className="mx-auto">
              <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-[#e1e2eb]">TAXONOMY_CTRL</h1>
                  <p className="mt-1 text-sm font-bold text-[#b9cacb]">
                    System-wide category hierarchy and resource mapping.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 items-center gap-2 border border-[#3b494b] bg-[#161b22]/70 px-4 transition-all focus-within:border-[#00dbe9] focus-within:shadow-[0_0_10px_rgba(0,219,233,0.2)]">
                    <Search size={16} className="text-[#849495]" />
                    <input 
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search taxonomy..."
                      className="bg-transparent text-sm font-bold outline-none placeholder:text-[#849495]/50 text-[#e1e2eb] uppercase tracking-widest w-48 md:w-64"
                    />
                  </div>
                  {!isAdding ? (
                    <button
                      onClick={() => setIsAdding(true)}
                      className="flex h-11 items-center justify-center gap-2 bg-[#00dbe9]/10 hover:bg-[#00dbe9]/20 border border-[#00dbe9] px-6 py-2.5 text-sm font-bold text-[#00dbe9] uppercase tracking-widest transition-all"
                    >
                      <Plus size={18} /> NEW_CAT
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsAdding(false)}
                      className="h-11 px-6 py-2.5 text-sm font-bold uppercase tracking-widest border border-[#3b494b] bg-transparent hover:bg-[#272a31] text-[#849495] hover:text-[#e1e2eb]"
                    >
                      CANCEL
                    </button>
                  )}
                </div>
              </div>

              {isAdding && (
                <form onSubmit={handleCreate} className="mb-10 p-6 border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#00dbe9] mb-4">Create New Taxonomy</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-1">
                       <label className="text-[11px] font-bold uppercase tracking-widest text-[#849495] mb-1.5 block">Category Name</label>
                       <input 
                         value={newCat.name}
                         onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                         placeholder="e.g. Artificial Intelligence"
                         className="w-full px-4 py-2.5 border border-[#3b494b] bg-transparent text-[#e1e2eb] text-sm outline-none transition-all focus:border-[#ebb2ff] font-mono"
                         required
                       />
                    </div>
                    <div className="sm:col-span-1">
                       <label className="text-[11px] font-bold uppercase tracking-widest text-[#849495] mb-1.5 block">Resource Type</label>
                       <select 
                         value={newCat.type}
                         onChange={(e) => setNewCat({ ...newCat, type: e.target.value })}
                         className="w-full px-4 py-2.5 border border-[#3b494b] bg-[#10131a] text-[#e1e2eb] text-sm outline-none transition-all focus:border-[#ebb2ff] font-mono"
                       >
                         <option value="repo">Repository</option>
                         <option value="website">Website</option>
                         <option value="research">Research</option>
                       </select>
                    </div>
                    <div className="flex items-end">
                       <button type="submit" className="w-full bg-[#ebb2ff]/10 hover:bg-[#ebb2ff]/20 border border-[#ebb2ff] text-[#ebb2ff] font-bold uppercase tracking-widest py-2.5 transition-colors text-xs">
                          Confirm & Save
                       </button>
                    </div>
                  </div>
                </form>
              )}

              {message && (
                <div className="mb-8 border border-[#ffb4ab]/50 bg-[#93000a]/20 text-[#ffb4ab] px-4 py-3 text-sm flex items-center gap-3">
                  <XCircle size={18} /> {message}
                </div>
              )}

              <div className="border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl">
                <div className="px-6 py-4 border-b border-[#3b494b] flex items-center justify-between">
                   <h2 className="text-lg font-bold text-[#e1e2eb]">Category Registry</h2>
                   <div className="flex items-center gap-2">
                      <button className="p-2 text-[#849495] hover:text-[#00dbe9] hover:bg-[#272a31] transition-all">
                         <Filter size={18} />
                      </button>
                      <button className="p-2 text-[#849495] hover:text-[#00dbe9] hover:bg-[#272a31] transition-all">
                         <Search size={18} />
                      </button>
                   </div>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead className="text-[11px] uppercase tracking-[0.15em] font-bold bg-[#10131a] text-[#849495]">
                    <tr>
                      <th className="px-6 py-4">Name & Type</th>
                      <th className="px-6 py-4">Associated Items</th>
                      <th className="px-6 py-4">Visibility</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3b494b]">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center text-sm text-[#849495] italic">
                          <div className="flex flex-col items-center gap-2">
                             <div className="h-6 w-6 border-2 border-[#00dbe9]/20 border-t-[#00dbe9] rounded-full animate-spin" />
                             Synchronizing directory...
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((c) => {
                        const Icon = iconForCategory(c.name);
                        const count = postCounts[c.id] || 0;
                        const active = c.active !== false;
                        return (
                          <tr key={c.id} className="group transition-all hover:bg-[#272a31]/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center bg-[#00dbe9]/10 text-[#00dbe9] border border-[#00dbe9]/30 group-hover:border-[#00dbe9] transition-all">
                                  <Icon size={22} />
                                </div>
                                <div>
                                   <p className="font-bold text-[15px] text-[#e1e2eb]">{c.name}</p>
                                   <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#849495] mt-0.5">{c.type || 'REPO'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono font-bold text-[#e1e2eb]">{count}</span>
                                <span className="text-[10px] text-[#849495] font-bold uppercase tracking-widest">Resources</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => toggleStatus(c)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] transition-all border ${
                                  active 
                                    ? "bg-[#00dbe9]/10 text-[#00dbe9] border-[#00dbe9] hover:bg-[#00dbe9]/20" 
                                    : "bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#ffb4ab] hover:bg-[#ffb4ab]/20"
                                }`}
                              >
                                {active ? <CheckCircle2 size={12} strokeWidth={3} /> : <XCircle size={12} strokeWidth={3} />}
                                {active ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => onEditCategory(c)}
                                  className="p-2 transition-all text-[#849495] hover:text-[#ebb2ff] hover:bg-[#ebb2ff]/10 border border-transparent hover:border-[#ebb2ff]"
                                >
                                  <Pencil size={18} />
                                </button>
                                <button
                                  onClick={() => onDeleteCategory(c.id)}
                                  className="p-2 transition-all text-[#849495] hover:text-[#ffb4ab] hover:bg-[#93000a]/20 border border-transparent hover:border-[#ffb4ab]"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
                <div className="flex items-center justify-between px-6 py-3 border-t border-[#3b494b] text-xs font-bold text-[#849495]">
                  <span>Page {page} of {totalPages}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadData(true, page - 1)}
                      disabled={loading || page <= 1}
                      className="px-3 py-1 border border-[#3b494b] disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => loadData(true, page + 1)}
                      disabled={loading || page >= totalPages}
                      className="px-3 py-1 border border-[#3b494b] disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <AdminFooter />
        </section>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen relative z-10">
        <AdminHeader title="Categories" />
        <main className="flex-1 p-4 pb-28">
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#e1e2eb]">Directory</h1>
                    <p className="text-[10px] font-bold text-[#849495] uppercase tracking-[0.15em] mt-1">Taxonomy Hub</p>
                  </div>
                  <button
                    onClick={() => setIsAdding(!isAdding)}
                    className={`h-12 w-12 flex items-center justify-center transition-all border ${isAdding ? "bg-[#272a31] text-[#849495] border-[#3b494b] rotate-45" : "bg-[#00dbe9]/10 text-[#00dbe9] border-[#00dbe9]"}`}
                  >
                    <Plus size={24} />
                  </button>
                </div>

                <div className="flex h-12 items-center gap-3 border border-[#3b494b] bg-[#161b22]/70 px-4 transition-all focus-within:border-[#00dbe9]">
                  <Search size={18} className="text-[#849495]" />
                  <input 
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="SEARCH TAXONOMY..."
                    className="bg-transparent text-sm font-bold outline-none placeholder:text-[#849495]/50 text-[#e1e2eb] uppercase tracking-widest w-full"
                  />
                </div>
              </div>

              {isAdding && (
                 <form onSubmit={handleCreate} className="mb-6 p-5 border border-[#3b494b] bg-[#161b22]/70 space-y-4 backdrop-blur-md">
                    <input 
                       value={newCat.name}
                       onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                       placeholder="Category Name"
                       className="w-full px-4 py-3 border border-[#3b494b] bg-transparent text-[#e1e2eb] font-mono text-sm focus:outline-none focus:border-[#ebb2ff]"
                    />
                    <select 
                       value={newCat.type}
                       onChange={(e) => setNewCat({ ...newCat, type: e.target.value })}
                       className="w-full px-4 py-3 border border-[#3b494b] bg-[#10131a] text-[#e1e2eb] font-mono text-sm focus:outline-none focus:border-[#ebb2ff]"
                    >
                       <option value="repo">Repository</option>
                       <option value="website">Website</option>
                       <option value="research">Research</option>
                    </select>
                    <button className="w-full bg-[#ebb2ff]/10 border border-[#ebb2ff] text-[#ebb2ff] font-bold uppercase tracking-widest py-3 text-xs">
                       Add Category
                    </button>
                 </form>
              )}

              <div className="space-y-3">
                {loading ? (
                   <div className="py-20 text-center text-[#849495] text-sm font-mono italic">Loading directory...</div>
                ) : (
                  filteredCategories.map((c) => {
                    const Icon = iconForCategory(c.name);
                    const count = postCounts[c.id] || 0;
                    const active = c.active !== false;
                    return (
                      <div key={c.id} className="p-4 border border-[#3b494b] flex items-center justify-between transition-all bg-[#161b22]/70 backdrop-blur-md">
                        <div className="flex items-center gap-3 min-w-0">
                           <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#00dbe9]/10 text-[#00dbe9] border border-[#00dbe9]/30">
                              <Icon size={20} />
                            </div>
                            <div className="min-w-0 truncate">
                               <p className="font-bold text-[15px] truncate text-[#e1e2eb]">{c.name}</p>
                               <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#849495]">{c.type || 'REPO'}</span>
                                  <span className={`h-1.5 w-1.5 ${active ? "bg-[#00dbe9]" : "bg-[#ffb4ab]"}`} />
                                  <span className={`text-[9px] font-bold uppercase tracking-[0.15em] ${active ? "text-[#00dbe9]" : "text-[#ffb4ab]"}`}>
                                     {active ? "Active" : "Inactive"}
                                  </span>
                               </div>
                            </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                           <button onClick={() => toggleStatus(c)} className={`p-2 ${active ? "text-[#00dbe9]" : "text-[#ffb4ab]"}`}>
                              <CheckCircle2 size={18} />
                           </button>
                           <button onClick={() => onEditCategory(c)} className="p-2 text-[#849495] hover:text-[#ebb2ff]"><Pencil size={18} /></button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
