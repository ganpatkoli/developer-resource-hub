import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  GitBranch, 
  Save, 
  Plus, 
  Trash2, 
  Database,
  Code2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileJson
} from "lucide-react";
import client from "../api/client";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import { useTheme } from "../context/ThemeContext";

const initialForm = {
  title: "",
  description: "",
  link: "",
  category: "",
};

export default function AddRepoView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [message, setMessage] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [catRes, repoRes] = await Promise.all([
          client.get("/categories?type=repo"),
          isEdit ? client.get(`/posts/${id}`) : Promise.resolve({ data: null }),
        ]);
        if (!mounted) return;
        setCategories(catRes.data || []);
        if (isEdit && repoRes.data) {
          const repo = repoRes.data;
          setForm({
            title: repo.title || "",
            description: repo.description || "",
            link: repo.link || "",
            category: repo.category?.id || repo.category || "",
          });
        }
      } catch (err) {
        if (mounted) setMessage("Failed to load resource data.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id, isEdit]);

  function onChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSave() {
    if (!form.title.trim() || !form.description.trim() || !form.link.trim() || !form.category) {
      setMessage("Please fill in all required fields.");
      return;
    }
    try {
      setSaving(true);
      setMessage("");
      const payload = { ...form, type: "repo" };
      if (isEdit) {
        await client.put(`/posts/${id}`, payload, { authType: "admin" });
      } else {
        await client.post("/posts", payload, { authType: "admin" });
      }
      navigate("/admin/repos", { replace: true });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save repository.");
    } finally {
      setSaving(false);
    }
  }

  async function onImportJson() {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("Must be an array");
      setImporting(true);
      const { data } = await client.post("/posts/import", { items: parsed.map(i => ({ ...i, type: "repo" })) }, { authType: "admin" });
      setImportResult(data);
      setImportMessage("Import success!");
      setJsonInput("");
      setTimeout(() => navigate("/admin/repos"), 1500);
    } catch (err) {
      setImportMessage("Import failed: " + (err.message || "Invalid JSON"));
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#10131a] text-[#e1e2eb] font-sans relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#84949510_1px,transparent_1px),linear-gradient(to_bottom,#84949510_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="mx-auto hidden min-h-screen grid-cols-[280px_1fr] lg:grid relative z-10">
        <AdminSidebar active="repos" />

        <section className="min-w-0 flex flex-col">
          <AdminHeader title={isEdit ? "Edit Repository" : "New Repository"} backTo="/admin/repos" />

          <main className="p-10">
            <div className="mx-auto max-w-4xl">
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-[#e1e2eb] uppercase">{isEdit ? "Modify Asset" : "Publish Repo"}</h1>
                  <p className="mt-2 text-sm font-bold text-[#b9cacb]">
                    Configure GitHub metadata and system classification.
                  </p>
                </div>
                {!isEdit && (
                   <div className="hidden sm:flex items-center gap-2 px-4 py-2 border border-[#00dbe9]/30 bg-[#00dbe9]/10 text-[#00dbe9]">
                      <Database size={16} />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#00dbe9]">Public Resource</span>
                   </div>
                )}
              </div>

              {message && (
                <div className="mb-8 flex items-center gap-3 border border-[#ffb4ab]/50 bg-[#690005]/20 p-4 text-[#ffb4ab] backdrop-blur-xl">
                  <XCircle size={20} /> <span className="text-xs font-bold uppercase tracking-widest">{message}</span>
                </div>
              )}

              <div className="grid gap-8">
                {/* Main Form */}
                <section className="border border-[#3b494b] bg-[#161b22]/70 p-8 backdrop-blur-xl">
                  <div className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Repository Title</label>
                        <input
                          value={form.title}
                          onChange={(e) => onChange("title", e.target.value)}
                          placeholder="e.g. React High Performance"
                          className="w-full border border-[#3b494b] bg-[#10131a]/80 px-5 py-4 text-sm font-bold outline-none transition-all focus:border-[#00dbe9] text-[#e1e2eb] placeholder:text-[#849495]/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Taxonomy Category</label>
                        <select
                          value={form.category}
                          onChange={(e) => onChange("category", e.target.value)}
                          className="w-full border border-[#3b494b] bg-[#10131a]/80 px-5 py-4 text-sm font-bold outline-none transition-all focus:border-[#00dbe9] text-[#e1e2eb]"
                        >
                          <option value="">Choose category...</option>
                          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">GitHub URI</label>
                      <div className="relative">
                        <input
                          value={form.link}
                          onChange={(e) => onChange("link", e.target.value)}
                          placeholder="https://github.com/owner/repo"
                          className="w-full border border-[#3b494b] bg-[#10131a]/80 pl-12 pr-5 py-4 text-sm font-bold outline-none transition-all focus:border-[#00dbe9] text-[#e1e2eb] placeholder:text-[#849495]/50"
                        />
                        <GitBranch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00dbe9]" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">System Description</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => onChange("description", e.target.value)}
                        placeholder="Detail the technical capabilities of this resource..."
                        rows={5}
                        className="w-full border border-[#3b494b] bg-[#10131a]/80 px-5 py-4 text-sm font-bold outline-none transition-all resize-none focus:border-[#00dbe9] text-[#e1e2eb] placeholder:text-[#849495]/50"
                      />
                    </div>
                  </div>

                  <div className="mt-10 pt-6 border-t border-[#3b494b]">
                    <button
                      onClick={onSave}
                      disabled={saving || loading}
                      className="flex w-full items-center justify-center gap-3 border border-[#00dbe9] bg-[#00dbe9]/10 hover:bg-[#00dbe9]/20 py-4 text-sm font-bold uppercase tracking-widest text-[#00dbe9] transition-all disabled:opacity-50"
                    >
                      <Save size={20} />
                      {saving ? "Processing..." : isEdit ? "Update Repository" : "Publish Repository"}
                    </button>
                  </div>
                </section>

                {/* JSON Import (Only on New) */}
                {!isEdit && (
                   <section className="border border-[#3b494b] bg-[#161b22]/70 p-8 backdrop-blur-xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                           <FileJson size={20} className="text-[#ebb2ff]" />
                           <h3 className="font-bold text-sm uppercase tracking-widest text-[#e1e2eb]">Bulk Intake</h3>
                        </div>
                        <button 
                           onClick={onImportJson}
                           disabled={importing || !jsonInput}
                           className="text-[10px] font-bold uppercase tracking-widest border border-[#ebb2ff] bg-[#ebb2ff]/10 text-[#ebb2ff] px-4 py-2 hover:bg-[#ebb2ff]/20 disabled:opacity-30 transition-colors"
                        >
                           Run Import
                        </button>
                      </div>
                      <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder='[{"title":"...","description":"...","link":"...","category":"..."}]'
                        className="w-full border border-[#3b494b] bg-[#10131a]/80 px-4 py-3 text-xs font-mono outline-none transition-all h-32 focus:border-[#ebb2ff] text-[#e1e2eb] placeholder:text-[#849495]/50"
                      />
                      {importMessage && (
                        <div className="mt-3 space-y-1">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#00dbe9]">{importMessage}</p>
                          {importResult && (
                            <p className="text-[9px] font-bold text-[#849495] uppercase tracking-tighter">
                              Created: {importResult.created} | Updated: {importResult.updated} | Skipped: {importResult.skipped}
                            </p>
                          )}
                          {importResult?.errors?.length > 0 && (
                            <div className="mt-2 p-2 border border-[#93000a]/30 bg-[#93000a]/10 max-h-32 overflow-y-auto">
                              {importResult.errors.slice(0, 5).map((err, i) => (
                                <p key={i} className="text-[8px] font-mono text-[#ffb4ab]">Row {err.index + 1}: {err.message}</p>
                              ))}
                              {importResult.errors.length > 5 && <p className="text-[8px] font-mono text-[#ffb4ab]">...and {importResult.errors.length - 5} more</p>}
                            </div>
                          )}
                        </div>
                      )}
                   </section>
                )}
              </div>
            </div>
          </main>
          <AdminFooter />
        </section>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen relative z-10">
        <AdminHeader title={isEdit ? "Edit Repo" : "New Repo"} backTo="/admin/repos" />
        <main className="flex-1 p-4 pb-28">
           <div className="mb-6">
              <h1 className="text-xl font-bold uppercase tracking-wide text-[#e1e2eb]">{isEdit ? "Edit" : "New"} Repository</h1>
              <p className="text-[10px] font-bold text-[#849495] uppercase tracking-widest mt-1">Resource Hub Setup</p>
           </div>

           <div className="space-y-6">
              <div className="p-5 border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-md">
                 <div className="space-y-5">
                    <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-[#00dbe9] mb-2 block">Name</label>
                       <input 
                          value={form.title}
                          onChange={(e) => onChange("title", e.target.value)}
                          placeholder="Repo Title"
                          className="w-full border border-[#3b494b] bg-[#10131a]/80 px-4 py-3 text-xs font-bold focus:border-[#00dbe9] outline-none text-[#e1e2eb] placeholder:text-[#849495]/50"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-[#00dbe9] mb-2 block">Category</label>
                       <select 
                          value={form.category}
                          onChange={(e) => onChange("category", e.target.value)}
                          className="w-full border border-[#3b494b] bg-[#10131a]/80 px-4 py-3 text-xs font-bold focus:border-[#00dbe9] outline-none text-[#e1e2eb]"
                       >
                          <option value="">Category...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-[#00dbe9] mb-2 block">URL</label>
                       <input 
                          value={form.link}
                          onChange={(e) => onChange("link", e.target.value)}
                          placeholder="GitHub Link"
                          className="w-full border border-[#3b494b] bg-[#10131a]/80 px-4 py-3 text-xs font-bold focus:border-[#00dbe9] outline-none text-[#e1e2eb] placeholder:text-[#849495]/50"
                       />
                    </div>
                 </div>
              </div>

              {!isEdit && (
                 <div className="p-5 border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-md">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#ebb2ff]">Bulk Import</h3>
                       <button 
                          onClick={onImportJson}
                          disabled={importing || !jsonInput}
                          className="text-[10px] font-bold uppercase tracking-widest border border-[#ebb2ff] bg-[#ebb2ff]/10 text-[#ebb2ff] px-3 py-1.5 hover:bg-[#ebb2ff]/20 disabled:opacity-30 transition-colors"
                       >
                          Import
                       </button>
                    </div>
                    <textarea
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder='[{"title":"..."}]'
                      className="w-full border border-[#3b494b] bg-[#10131a]/80 px-4 py-3 text-[10px] font-mono outline-none h-24 focus:border-[#ebb2ff] text-[#e1e2eb] placeholder:text-[#849495]/50"
                    />
                    {importMessage && <p className="mt-3 text-[10px] font-bold text-[#00dbe9] uppercase tracking-widest">{importMessage}</p>}
                 </div>
              )}

              <button 
                onClick={onSave}
                disabled={saving || loading}
                className="w-full border border-[#00dbe9] bg-[#00dbe9]/10 hover:bg-[#00dbe9]/20 text-[#00dbe9] font-bold uppercase tracking-widest py-4 text-xs transition-colors"
              >
                {saving ? "Publishing..." : isEdit ? "Update Asset" : "Publish Asset"}
              </button>
              
              <button 
                onClick={() => navigate("/admin/repos")}
                className="w-full text-[#849495] hover:text-[#e1e2eb] font-bold uppercase tracking-widest py-2 text-[10px] transition-colors"
              >
                Cancel
              </button>
           </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
