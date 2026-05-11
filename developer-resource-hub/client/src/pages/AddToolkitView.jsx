import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  Link as LinkIcon,
  Layout,
  Briefcase
} from "lucide-react";
import client from "../api/client";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";

const initialForm = {
  title: "",
  audience: "",
  slug: "",
  description: "",
  content: "",
  tableOfContents: "",
  coverImage: "",
  accentClass: "from-orange-500 to-amber-400",
  active: true,
};

export default function AddToolkitView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!isEdit) return;
      try {
        const { data } = await client.get(`/toolkits/${id}`, { authType: "admin" });
        if (!mounted) return;
        if (data) {
          setForm({
            title: data.title || "",
            audience: data.audience || "",
            slug: data.slug || "",
            description: data.description || "",
            content: data.content || "",
            tableOfContents: Array.isArray(data.tableOfContents) ? data.tableOfContents.join("\n") : "",
            coverImage: data.coverImage || "",
            accentClass: data.accentClass || "from-orange-500 to-amber-400",
            active: data.active !== false,
          });
        }
      } catch (err) {
        if (mounted) setMessage("Failed to load toolkit data.");
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
    if (!form.title.trim() || !form.audience.trim() || !form.content.trim()) {
      setMessage("Title, audience, and content are required.");
      return;
    }
    try {
      setSaving(true);
      setMessage("");
      const payload = {
        ...form,
        tableOfContents: form.tableOfContents.split("\n").map(s => s.trim()).filter(Boolean),
      };
      if (isEdit) {
        await client.put(`/toolkits/${id}`, payload, { authType: "admin" });
      } else {
        await client.post("/toolkits", payload, { authType: "admin" });
      }
      navigate("/admin/toolkits", { replace: true });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save toolkit.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#10131a] text-[#e1e2eb] font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#84949510_1px,transparent_1px),linear-gradient(to_bottom,#84949510_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="mx-auto hidden min-h-screen grid-cols-[280px_1fr] lg:grid relative z-10">
        <AdminSidebar active="toolkits" />

        <section className="min-w-0 flex flex-col">
          <AdminHeader title={isEdit ? "Edit Toolkit" : "New Toolkit"} backTo="/admin/toolkits" />

          <main className="p-10">
            <div className="mx-auto max-w-5xl">
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-[#e1e2eb] uppercase">{isEdit ? "Modify_Toolkit" : "Deploy_Toolkit"}</h1>
                  <p className="mt-2 text-sm font-bold text-[#b9cacb]">
                    Configure technical resource hubs and intelligence packages.
                  </p>
                </div>
                {!isEdit && (
                   <div className="hidden sm:flex items-center gap-2 px-4 py-2 border border-orange-500/30 bg-orange-500/10 text-orange-500">
                      <Briefcase size={16} />
                      <span className="text-[11px] font-bold uppercase tracking-widest">Resource Archive</span>
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
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Toolkit Title</label>
                        <input
                          value={form.title}
                          onChange={(e) => onChange("title", e.target.value)}
                          placeholder="e.g. AI Prompt Engineering Masterclass"
                          className="w-full border border-[#3b494b] bg-[#10131a]/80 px-5 py-4 text-sm font-bold outline-none transition-all focus:border-[#00dbe9] text-[#e1e2eb] placeholder:text-[#849495]/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Target Audience</label>
                        <div className="relative">
                          <input
                            value={form.audience}
                            onChange={(e) => onChange("audience", e.target.value)}
                            placeholder="e.g. Developers, Data Scientists"
                            className="w-full border border-[#3b494b] bg-[#10131a]/80 pl-12 pr-5 py-4 text-sm font-bold outline-none transition-all focus:border-[#00dbe9] text-[#e1e2eb] placeholder:text-[#849495]/50"
                          />
                          <Users size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00dbe9]" />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                       <div>
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Custom Slug (Auto-generated if empty)</label>
                          <div className="relative">
                            <input
                              value={form.slug}
                              onChange={(e) => onChange("slug", e.target.value)}
                              placeholder="ai-masterclass-2026"
                              className="w-full border border-[#3b494b] bg-[#10131a]/80 pl-12 pr-5 py-4 text-sm font-bold outline-none transition-all focus:border-[#00dbe9] text-[#e1e2eb] placeholder:text-[#849495]/50"
                            />
                            <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00dbe9]" />
                          </div>
                       </div>
                       <div>
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Status</label>
                          <select
                            value={form.active}
                            onChange={(e) => onChange("active", e.target.value === "true")}
                            className="w-full border border-[#3b494b] bg-[#10131a]/80 px-5 py-4 text-sm font-bold outline-none transition-all focus:border-[#00dbe9] text-[#e1e2eb]"
                          >
                            <option value="true">ACTIVE_DEPLOYMENT</option>
                            <option value="false">ARCHIVED_OFFLINE</option>
                          </select>
                       </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Short Description</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => onChange("description", e.target.value)}
                        placeholder="Brief overview of the toolkit capabilities..."
                        rows={2}
                        className="w-full border border-[#3b494b] bg-[#10131a]/80 px-5 py-4 text-sm font-bold outline-none transition-all resize-none focus:border-[#00dbe9] text-[#e1e2eb] placeholder:text-[#849495]/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                       <div className="lg:col-span-1">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500 mb-2 block">Neural Index (TOC)</label>
                          <p className="text-[9px] text-[#849495] mb-4 font-bold uppercase tracking-wider italic">Enter one heading per line. Must match content headings.</p>
                          <textarea
                            value={form.tableOfContents}
                            onChange={(e) => onChange("tableOfContents", e.target.value)}
                            placeholder={"Introduction\nGetting Started\nAdvanced Protocols"}
                            rows={15}
                            className="w-full border border-[#3b494b] bg-[#10131a]/80 px-5 py-4 text-xs font-mono outline-none transition-all resize-none focus:border-orange-500 text-[#e1e2eb] placeholder:text-[#849495]/30"
                          />
                       </div>
                       <div className="lg:col-span-2">
                          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Intelligence Content (Markdown)</label>
                          <p className="text-[9px] text-[#849495] mb-4 font-bold uppercase tracking-wider italic">Write your full resource content here. Use headings matching the TOC.</p>
                          <textarea
                            value={form.content}
                            onChange={(e) => onChange("content", e.target.value)}
                            placeholder={"## Introduction\nWelcome to the AI vault..."}
                            rows={15}
                            className="w-full border border-[#3b494b] bg-[#10131a]/80 px-5 py-4 text-sm font-bold outline-none transition-all resize-none focus:border-[#00dbe9] text-[#e1e2eb] placeholder:text-[#849495]/30"
                          />
                       </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-6 border-t border-[#3b494b] flex gap-4">
                    <button
                       onClick={() => navigate("/admin/toolkits")}
                       className="flex-1 border border-[#3b494b] bg-transparent hover:bg-white/5 py-4 text-sm font-bold uppercase tracking-widest text-[#849495] transition-all"
                    >
                       Abort_Changes
                    </button>
                    <button
                      onClick={onSave}
                      disabled={saving || loading}
                      className="flex-[2] flex items-center justify-center gap-3 border border-orange-500 bg-orange-500/10 hover:bg-orange-500/20 py-4 text-sm font-bold uppercase tracking-widest text-orange-500 transition-all disabled:opacity-50"
                    >
                      <Save size={20} />
                      {saving ? "Processing..." : isEdit ? "Sync_Data" : "Deploy_Now"}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </main>
          <AdminFooter />
        </section>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen relative z-10">
        <AdminHeader title={isEdit ? "Edit Toolkit" : "New Toolkit"} backTo="/admin/toolkits" />
        <main className="flex-1 p-4 pb-28">
           <div className="mb-6">
              <h1 className="text-xl font-bold uppercase tracking-wide text-[#e1e2eb]">{isEdit ? "Modify" : "New"} Toolkit</h1>
              <p className="text-[10px] font-bold text-[#849495] uppercase tracking-widest mt-1">Resource Archive Setup</p>
           </div>

           <div className="space-y-6">
              <div className="p-5 border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-md">
                 <div className="space-y-5">
                    <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-[#00dbe9] mb-2 block">Title</label>
                       <input 
                          value={form.title}
                          onChange={(e) => onChange("title", e.target.value)}
                          placeholder="Toolkit Name"
                          className="w-full border border-[#3b494b] bg-[#10131a]/80 px-4 py-3 text-xs font-bold focus:border-[#00dbe9] outline-none text-[#e1e2eb] placeholder:text-[#849495]/50"
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-[#00dbe9] mb-2 block">Audience</label>
                       <input 
                          value={form.audience}
                          onChange={(e) => onChange("audience", e.target.value)}
                          placeholder="Target Users"
                          className="w-full border border-[#3b494b] bg-[#10131a]/80 px-4 py-3 text-xs font-bold focus:border-[#00dbe9] outline-none text-[#e1e2eb] placeholder:text-[#849495]/50"
                       />
                    </div>
                 </div>
              </div>

              <div className="p-5 border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-md">
                 <label className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-2 block">Intelligence Content</label>
                 <textarea
                   value={form.content}
                   onChange={(e) => onChange("content", e.target.value)}
                   placeholder="Content here..."
                   className="w-full border border-[#3b494b] bg-[#10131a]/80 px-4 py-3 text-xs font-bold outline-none h-48 focus:border-orange-500 text-[#e1e2eb] placeholder:text-[#849495]/50"
                 />
              </div>

              <button 
                onClick={onSave}
                disabled={saving || loading}
                className="w-full border border-orange-500 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 font-bold uppercase tracking-widest py-4 text-xs transition-colors"
              >
                {saving ? "Syncing..." : isEdit ? "Update Toolkit" : "Deploy Toolkit"}
              </button>
              
              <button 
                onClick={() => navigate("/admin/toolkits")}
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
