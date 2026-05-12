import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client, { setAdminToken } from "../api/client";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import { 
  LogOut, 
  ExternalLink, 
  Save, 
  Trash2, 
  Plus, 
  Layout, 
  ToggleRight, 
  Settings as SettingsIcon,
  CheckCircle2,
  XCircle,
  Globe,
  Layers
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ tabs: { repos: true, websites: true, research: true } });

  const showMsg = (type, text) => {
    setMessage({ type, text });
    if (text) setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const loadCategories = useCallback(async () => {
    try {
      const { data } = await client.get("/categories", { authType: "admin" });
      setCategories(data);
    } catch {}
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const { data } = await client.get("/settings", { authType: "admin" });
      if (data) setSettings(data);
    } catch (err) {
      console.error("Failed to load settings", err);
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadCategories(), loadSettings()]);
    } catch {
      showMsg("err", "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [loadCategories, loadSettings]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function logout() {
    setAdminToken(null);
    navigate("/admin/login", { replace: true });
  }

  async function updateTabSetting(tabName, enabled) {
    try {
      const updatedTabs = { ...settings.tabs, [tabName]: enabled };
      const { data } = await client.put("/settings", { tabs: updatedTabs }, { authType: "admin" });
      setSettings(data);
      showMsg("ok", "Settings updated");
    } catch (err) {
      showMsg("err", "Failed to update settings");
    }
  }

  async function updateSecuritySetting(key, enabled) {
    try {
      const updatedSecurity = { ...settings.security, [key]: enabled };
      const { data } = await client.put("/settings", { security: updatedSecurity }, { authType: "admin" });
      setSettings(data);
      showMsg("ok", "Security updated");
    } catch (err) {
      showMsg("err", "Failed to update security settings");
    }
  }

  return (
    <div className="min-h-screen bg-[#10131a] text-[#e1e2eb] font-sans relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#84949510_1px,transparent_1px),linear-gradient(to_bottom,#84949510_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      {/* Desktop */}
      <div className="mx-auto hidden min-h-screen grid-cols-[280px_1fr] lg:grid relative z-10">
        <AdminSidebar active="settings" />

        <section className="min-w-0 flex flex-col">
          <AdminHeader title="System Configuration" />

          <main className="p-10">
            <div className="mx-auto">
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight text-[#e1e2eb]">Setup & Preferences</h1>
                  <p className="mt-2 text-sm text-[#b9cacb]">
                    Global system variables, feature flags, and homepage organization.
                  </p>
                </div>
                <div className="flex gap-3">
                  <a href="/" target="_blank" className="flex items-center gap-2 border border-[#3b494b] bg-[#161b22]/70 hover:bg-[#272a31] px-5 py-2.5 text-sm font-bold text-[#00dbe9] uppercase tracking-widest transition-all">
                    <ExternalLink size={16} /> View Hub
                  </a>
                  <button onClick={logout} className="flex items-center gap-2 bg-[#93000a]/20 border border-[#ffb4ab]/50 hover:bg-[#93000a]/40 px-5 py-2.5 text-sm font-bold text-[#ffb4ab] uppercase tracking-widest transition-all">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>

              {message.text && (
                <div className={`mb-8 flex items-center gap-3 border px-5 py-4 text-sm font-bold animate-in fade-in slide-in-from-top-2 ${message.type === "ok" ? "border-[#00dbe9]/50 bg-[#00dbe9]/10 text-[#00dbe9]" : "border-[#ffb4ab]/50 bg-[#93000a]/20 text-[#ffb4ab]"}`}>
                  {message.type === "ok" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                  {message.text}
                </div>
              )}

              <div className="grid gap-8">
                <section className="border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center bg-[#00dbe9]/10 text-[#00dbe9] border border-[#00dbe9]">
                        <Layers size={20} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-[#e1e2eb]">Toolkit Collections</h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#849495]">Upload and manage homepage toolkits</p>
                      </div>
                    </div>
                    <Link to="/admin/toolkits" className="border border-[#00dbe9] bg-[#00dbe9]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#00dbe9] hover:bg-[#00dbe9]/20 transition-all">
                      Open Manager
                    </Link>
                  </div>
                </section>

                <section className="border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center bg-[#00dbe9]/10 text-[#00dbe9] border border-[#00dbe9]">
                      <ToggleRight size={22} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#e1e2eb]">Feature Toggles</h2>
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#849495]">Navigation Control</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 max-w-md">
                    {["repos", "websites", "research"].map((tab) => (
                      <label key={tab} className="flex items-center justify-between p-4 border border-[#3b494b] bg-transparent cursor-pointer transition-all hover:bg-[#272a31]">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#849495]">{tab === "repos" ? "Repositories" : tab === "websites" ? "Websites" : "Research Papers"}</p>
                          <p className="text-sm font-bold mt-0.5 text-[#e1e2eb]">Enable public access</p>
                        </div>
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={settings.tabs?.[tab] !== false} 
                          onChange={(e) => updateTabSetting(tab, e.target.checked)} 
                        />
                        <div className="w-12 h-6 bg-[#10131a] border border-[#3b494b] rounded-none peer peer-checked:bg-[#00dbe9]/20 peer-checked:border-[#00dbe9] after:content-[''] after:absolute after:top-1 after:left-1 after:bg-[#849495] peer-checked:after:bg-[#00dbe9] after:rounded-none after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 relative"></div>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center bg-rose-500/10 text-rose-400 border border-rose-500">
                      <SettingsIcon size={22} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#e1e2eb]">Security Settings</h2>
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#849495]">Anti-Copy Protection</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 max-w-md">
                    <label className="flex items-center justify-between p-4 border border-[#3b494b] bg-transparent cursor-pointer transition-all hover:bg-[#272a31]">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-rose-400">INSPECT ELEMENT</p>
                        <p className="text-sm font-bold mt-0.5 text-[#e1e2eb]">Disable Right-Click & F12</p>
                      </div>
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={settings.security?.disableInspect === true} 
                        onChange={(e) => updateSecuritySetting("disableInspect", e.target.checked)} 
                      />
                      <div className="w-12 h-6 bg-[#10131a] border border-[#3b494b] rounded-none peer peer-checked:bg-rose-500/20 peer-checked:border-rose-500 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-[#849495] peer-checked:after:bg-rose-500 after:rounded-none after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6 relative"></div>
                    </label>
                  </div>
                </section>

                <section className="border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="flex h-10 w-10 items-center justify-center bg-[#ebb2ff]/10 text-[#ebb2ff] border border-[#ebb2ff]">
                      <Layout size={22} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#e1e2eb]">Homepage Sections</h2>
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#849495]">Dynamic Content Clusters</p>
                    </div>
                  </div>

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const title = e.target.sectionTitle.value;
                    const type = e.target.sectionType.value;
                    const category = e.target.sectionCategory.value;
                    if (!title || !type || !category) return;
                    try {
                      const newSection = { title, type, category, enabled: true };
                      const { data } = await client.put("/settings", { 
                        customSections: [...(settings.customSections || []), newSection] 
                      }, { authType: "admin" });
                      setSettings(data);
                      showMsg("ok", "Section added successfully");
                      e.target.reset();
                    } catch(err) {
                      showMsg("err", "Failed to add section");
                    }
                  }} className="grid gap-4 sm:grid-cols-4 items-end mb-10 p-6 bg-transparent border border-dashed border-[#3b494b]">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#849495] mb-1.5 block">Section Title</label>
                      <input name="sectionTitle" className="w-full bg-transparent border border-[#3b494b] px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#ebb2ff] transition-colors" required placeholder="e.g. Recommended" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#849495] mb-1.5 block">Type</label>
                      <select name="sectionType" className="w-full bg-[#10131a] border border-[#3b494b] px-4 py-2.5 text-sm font-mono text-[#e1e2eb] focus:outline-none focus:border-[#ebb2ff] transition-colors" required>
                        <option value="repo">Repo</option>
                        <option value="website">Web</option>
                        <option value="research">Paper</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#849495] mb-1.5 block">Category</label>
                      <select name="sectionCategory" className="w-full bg-[#10131a] border border-[#3b494b] px-4 py-2.5 text-sm font-mono text-[#e1e2eb] focus:outline-none focus:border-[#ebb2ff] transition-colors" required>
                        <option value="">Select...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-[#ebb2ff]/10 border border-[#ebb2ff] text-[#ebb2ff] hover:bg-[#ebb2ff]/20 font-bold uppercase tracking-[0.15em] py-2.5 text-[11px] transition-all">
                      Add Section
                    </button>
                  </form>

                  <div className="space-y-3">
                    {(settings.customSections || []).map((sec, idx) => (
                      <div key={idx} className="flex items-center justify-between p-5 border border-[#3b494b] bg-transparent">
                        <div className="flex items-center gap-4">
                           <div className="h-10 w-10 flex items-center justify-center bg-[#849495]/10 text-[#849495] border border-[#3b494b]">
                              {sec.type === 'repo' ? <Layout size={18}/> : <Globe size={18}/>}
                           </div>
                           <div>
                            <p className="text-sm font-bold text-[#e1e2eb] uppercase tracking-wide">{sec.title}</p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#00dbe9] mt-1">{sec.type} • Active</p>
                          </div>
                        </div>
                        <button onClick={async () => {
                          const updated = settings.customSections.filter((_, i) => i !== idx);
                          try {
                            const { data } = await client.put("/settings", { customSections: updated }, { authType: "admin" });
                            setSettings(data);
                            showMsg("ok", "Section removed");
                          } catch(err) {
                            showMsg("err", "Failed to remove section");
                          }
                        }} className="p-2 text-[#ffb4ab] hover:bg-[#93000a]/20 border border-transparent hover:border-[#ffb4ab]/50 transition-all">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </main>
          <AdminFooter />
        </section>
      </div>

      {/* Mobile */}
      <div className="lg:hidden flex flex-col min-h-screen relative z-10">
        <AdminHeader title="Setup" />
        <main className="flex-1 p-6 pb-28">
           <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#e1e2eb]">System</h1>
                <p className="text-[10px] font-bold text-[#849495] uppercase tracking-[0.15em] mt-1">Global Config</p>
              </div>
              <button onClick={logout} className="p-3 bg-[#93000a]/20 border border-[#ffb4ab]/50 text-[#ffb4ab] hover:bg-[#93000a]/40 transition-all">
                 <LogOut size={20} />
              </button>
           </div>

           <section className="space-y-6">
              <div className="p-6 border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl">
                  <h2 className="text-lg font-bold text-[#e1e2eb] mb-5">Feature Flags</h2>
                  <div className="space-y-4">
                    {["repos", "websites", "research"].map((tab) => (
                      <div key={tab} className="flex items-center justify-between py-2 border-b border-[#3b494b] last:border-0 pb-4 last:pb-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#849495]">{tab}</p>
                          <p className="text-sm font-bold text-[#e1e2eb] mt-1">Public Visibility</p>
                        </div>
                        <button 
                          onClick={() => updateTabSetting(tab, settings.tabs?.[tab] === false)}
                          className={`h-6 w-11 relative transition-all border ${settings.tabs?.[tab] !== false ? "bg-[#00dbe9]/20 border-[#00dbe9]" : "bg-[#10131a] border-[#3b494b]"}`}
                        >
                          <div className={`absolute top-1 h-4 w-4 rounded-none transition-all ${settings.tabs?.[tab] !== false ? "left-6 bg-[#00dbe9]" : "left-1 bg-[#849495]"}`} />
                        </button>
                      </div>
                    ))}
                  </div>
              </div>

              <div className="p-6 border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl">
                  <h2 className="text-lg font-bold text-[#e1e2eb] mb-4">Homepage Sections</h2>
                  <div className="space-y-3">
                     {(settings.customSections || []).map((sec, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 border-b last:border-0 border-[#3b494b]">
                           <div>
                              <p className="text-sm font-bold text-[#e1e2eb] uppercase tracking-wide">{sec.title}</p>
                              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#00dbe9] mt-1">{sec.type}</p>
                           </div>
                           <button onClick={async () => {
                              const updated = settings.customSections.filter((_, i) => i !== idx);
                              await client.put("/settings", { customSections: updated }, { authType: "admin" });
                              refresh();
                           }} className="text-[#ffb4ab] hover:text-[#ffdad6]"><Trash2 size={18} /></button>
                        </div>
                     ))}
                  </div>
              </div>
           </section>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
