import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  FlaskConical, 
  Save, 
  FileJson,
  CheckCircle2,
  XCircle,
  Calendar,
  Link as LinkIcon,
  FileText
} from "lucide-react";
import client from "../api/client";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import { useTheme } from "../context/ThemeContext";

const initialForm = {
  title: "",
  description: "",
  dateOfSubmission: "",
  publishUrl: "",
  documentUrl: "",
  keywords: "",
  category: "",
};

export default function AddResearchView() {
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
        const [catRes, researchRes] = await Promise.all([
          client.get("/categories?type=research"),
          isEdit ? client.get(`/research/${id}`) : Promise.resolve({ data: null }),
        ]);
        if (!mounted) return;
        setCategories(catRes.data || []);
        if (isEdit && researchRes.data?.data) {
          const research = researchRes.data.data;
          setForm({
            title: research.title || "",
            description: research.description || "",
            dateOfSubmission: research.dateOfSubmission ? new Date(research.dateOfSubmission).toISOString().split("T")[0] : "",
            publishUrl: research.publishUrl || "",
            documentUrl: research.documentUrl || "",
            keywords: (research.keywords || []).join(", "),
            category: research.category?._id || research.category || "",
          });
        }
      } catch (err) {
        if (mounted) setMessage("Failed to load research data.");
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
    if (!form.title.trim() || !form.description.trim() || !form.publishUrl.trim() || !form.documentUrl.trim() || !form.dateOfSubmission) {
      setMessage("Please fill in all required fields.");
      return;
    }
    try {
      setSaving(true);
      setMessage("");
      const payload = {
        ...form,
        keywords: form.keywords.split(",").map(k => k.trim()).filter(k => k),
      };
      if (isEdit) {
        await client.put(`/research/${id}`, payload, { authType: "admin" });
      } else {
        await client.post("/research", payload, { authType: "admin" });
      }
      navigate("/admin/research", { replace: true });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save research.");
    } finally {
      setSaving(false);
    }
  }

  async function onImportJson() {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("Must be an array");
      setImporting(true);
      const { data } = await client.post("/research/import", { items: parsed }, { authType: "admin" });
      setImportResult(data);
      setImportMessage("Import success!");
      setJsonInput("");
      setTimeout(() => navigate("/admin/research"), 1500);
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
        <AdminSidebar active="research" />

        <section className="min-w-0 flex flex-col">
          <AdminHeader title={isEdit ? "Edit Research" : "New Submission"} backTo="/admin/research" />

          <main className="p-10">
            <div className="mx-auto max-w-4xl">
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-[#e1e2eb] uppercase">{isEdit ? "Modify Paper" : "Publish Thesis"}</h1>
                  <p className="mt-2 text-sm font-bold text-[#b9cacb]">
                    Submit technical documents and research insights to the hub.
                  </p>
                </div>
                {!isEdit && (
                   <div className="hidden sm:flex items-center gap-2 px-4 py-2 border border-[#00dbe9]/30 bg-[#00dbe9]/10 text-[#00dbe9]">
                      <FlaskConical size={16} />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#00dbe9]">Research Paper</span>
                   </div>
                )}
              </div>

              {message && (
                <div className="mb-8 flex items-center gap-3 border border-[#ffb4ab]/50 bg-[#690005]/20 p-4 text-[#ffb4ab] backdrop-blur-xl">
                  <XCircle size={20} /> <span className="text-xs font-bold uppercase tracking-widest">{message}</span>
                </div>
              )}

              <div className="grid gap-8">
                <section className="border border-[#3b494b] bg-[#161b22]/70 p-8 backdrop-blur-xl">
                  <div className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Paper Title</label>
                        <input
                          value={form.title}
                          onChange={(e) => onChange("title", e.target.value)}
                          placeholder="e.g. Analysis of Neural Networks"
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
                          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                       <div>
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Submission Date</label>
                          <div className="relative">
                            <input
                              type="date"
                              value={form.dateOfSubmission}
                              onChange={(e) => onChange("dateOfSubmission", e.target.value)}
                              className="w-full border border-[#3b494b] bg-[#10131a]/80 pl-12 pr-5 py-4 text-sm font-bold outline-none transition-all focus:border-[#00dbe9] text-[#e1e2eb] [color-scheme:dark]"
                            />
                            <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00dbe9]" />
                          </div>
                       </div>
                       <div>
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Keywords (Comma separated)</label>
                          <input
                            value={form.keywords}
                            onChange={(e) => onChange("keywords", e.target.value)}
                            placeholder="AI, ML, Research"
                            className="w-full border border-[#3b494b] bg-[#10131a]/80 px-5 py-4 text-sm font-bold outline-none transition-all focus:border-[#00dbe9] text-[#e1e2eb] placeholder:text-[#849495]/50"
                          />
                       </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                       <div>
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Publishing URL</label>
                          <div className="relative">
                            <input
                              value={form.publishUrl}
                              onChange={(e) => onChange("publishUrl", e.target.value)}
                              placeholder="https://doi.org/..."
                              className="w-full border border-[#3b494b] bg-[#10131a]/80 pl-12 pr-5 py-4 text-sm font-bold outline-none transition-all focus:border-[#00dbe9] text-[#e1e2eb] placeholder:text-[#849495]/50"
                            />
                            <LinkIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00dbe9]" />
                          </div>
                       </div>
                       <div>
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Document Access URL</label>
                          <div className="relative">
                            <input
                              value={form.documentUrl}
                              onChange={(e) => onChange("documentUrl", e.target.value)}
                              placeholder="https://arxiv.org/pdf/..."
                              className="w-full border border-[#3b494b] bg-[#10131a]/80 pl-12 pr-5 py-4 text-sm font-bold outline-none transition-all focus:border-[#00dbe9] text-[#e1e2eb] placeholder:text-[#849495]/50"
                            />
                            <FileText size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00dbe9]" />
                          </div>
                       </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Abstract / Summary</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => onChange("description", e.target.value)}
                        placeholder="Detail the research findings and conclusions..."
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
                      {saving ? "Processing..." : isEdit ? "Update Paper" : "Publish Paper"}
                    </button>
                  </div>
                </section>

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
                        placeholder='[{"title":"...","description":"...","publishUrl":"..."}]'
                        className="w-full border border-[#3b494b] bg-[#10131a]/80 px-4 py-3 text-xs font-mono outline-none transition-all h-32 focus:border-[#ebb2ff] text-[#e1e2eb] placeholder:text-[#849495]/50"
                      />
                      {importMessage && <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[#00dbe9]">{importMessage}</p>}
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
        <AdminHeader title={isEdit ? "Edit Paper" : "New Paper"} backTo="/admin/research" />
        <main className="flex-1 p-4 pb-28">
           <div className="mb-6">
              <h1 className="text-xl font-bold uppercase tracking-wide text-[#e1e2eb]">{isEdit ? "Edit" : "New"} Research</h1>
              <p className="text-[10px] font-bold text-[#849495] uppercase tracking-widest mt-1">Resource Hub Setup</p>
           </div>

           <div className="space-y-6">
              <div className="p-5 border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-md">
                 <div className="space-y-5">
                    <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-[#00dbe9] mb-2 block">Title</label>
                       <input 
                          value={form.title}
                          onChange={(e) => onChange("title", e.target.value)}
                          placeholder="Paper Name"
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
                          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-[#00dbe9] mb-2 block">Date</label>
                       <input 
                          type="date"
                          value={form.dateOfSubmission}
                          onChange={(e) => onChange("dateOfSubmission", e.target.value)}
                          className="w-full border border-[#3b494b] bg-[#10131a]/80 px-4 py-3 text-xs font-bold focus:border-[#00dbe9] outline-none text-[#e1e2eb] [color-scheme:dark]"
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
                {saving ? "Publishing..." : isEdit ? "Update Paper" : "Publish Paper"}
              </button>
              
              <button 
                onClick={() => navigate("/admin/research")}
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
