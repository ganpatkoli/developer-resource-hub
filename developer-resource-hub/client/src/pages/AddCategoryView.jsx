import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FlaskConical,
  Store,
  ShoppingBag,
  Briefcase,
  BookOpen,
  Gamepad2,
  Home,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  Save,
  Trash2,
} from "lucide-react";
import client from "../api/client";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import { useTheme } from "../context/ThemeContext";

const ICON_OPTIONS = [
  { id: "flask", label: "Research", icon: FlaskConical },
  { id: "store", label: "Store", icon: Store },
  { id: "bag", label: "Shopping", icon: ShoppingBag },
  { id: "briefcase", label: "Business", icon: Briefcase },
  { id: "book", label: "Knowledge", icon: BookOpen },
  { id: "gamepad", label: "Gaming", icon: Gamepad2 },
  { id: "home", label: "Home", icon: Home },
  { id: "grid", label: "General", icon: LayoutGrid },
];

export default function AddCategoryView() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [type, setType] = useState("repo");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function onSave() {
    if (!name.trim()) {
      setMessage("Category name is required");
      return;
    }
    try {
      setSaving(true);
      setMessage("");
      await client.post("/categories", { name: name.trim(), type, active }, { authType: "admin" });
      navigate("/admin/categories", { replace: true });
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#10131a] text-[#e1e2eb] font-sans relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#84949510_1px,transparent_1px),linear-gradient(to_bottom,#84949510_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="mx-auto hidden min-h-screen grid-cols-[280px_1fr] lg:grid relative z-10">
        <AdminSidebar active="categories" />

        <section className="min-w-0 flex flex-col">
          <AdminHeader title="Create Category" />

          <main className="p-10">
            <div className="mx-auto max-w-2xl">
              <button
                onClick={() => navigate("/admin/categories")}
                className="mb-8 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#849495] hover:text-[#00dbe9] transition-colors"
              >
                <ArrowLeft size={16} /> Return_To_Directory
              </button>

              <div className="mb-10">
                <h1 className="text-4xl font-bold tracking-tight text-[#e1e2eb] uppercase">New_Taxonomy</h1>
                <p className="mt-2 text-sm font-bold text-[#b9cacb]">
                  Define a new resource bucket and configure its system behavior.
                </p>
              </div>

              {message && (
                <div className="mb-8 flex items-center gap-3 border border-[#ffb4ab]/50 bg-[#93000a]/20 px-5 py-4 text-sm font-bold text-[#ffb4ab] animate-in fade-in slide-in-from-top-2">
                  <XCircle size={20} /> {message}
                </div>
              )}

              <div className="border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl p-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Taxonomy Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Artificial Intelligence"
                      className="w-full bg-[#10131a] border border-[#3b494b] px-5 py-4 text-sm font-mono outline-none focus:border-[#ebb2ff] text-[#e1e2eb] transition-all"
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">Resource Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-[#10131a] border border-[#3b494b] px-5 py-4 text-sm font-mono outline-none focus:border-[#ebb2ff] text-[#e1e2eb] transition-all"
                      >
                        <option value="repo">GitHub Repository</option>
                        <option value="website">System Website</option>
                        <option value="research">Research Paper</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00dbe9] mb-2 block">System Status</label>
                      <button
                        onClick={() => setActive(!active)}
                        className={`flex w-full items-center justify-between border px-5 py-4 transition-all ${
                          active 
                            ? "bg-[#00dbe9]/10 border-[#00dbe9] text-[#00dbe9]"
                            : "bg-transparent border-[#3b494b] text-[#849495]"
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-widest">{active ? "Active_Protocol" : "Inactive_Protocol"}</span>
                        {active ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-10">
                   <button
                    onClick={onSave}
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-3 bg-[#ebb2ff]/10 border border-[#ebb2ff] py-4 text-sm font-bold text-[#ebb2ff] uppercase tracking-[0.2em] transition-all hover:bg-[#ebb2ff]/20 disabled:opacity-50"
                  >
                    <Save size={20} />
                    {saving ? "Publishing..." : "Commit_Taxonomy"}
                  </button>
                </div>
              </div>
            </div>
          </main>
          <AdminFooter />
        </section>
      </div>

      <div className="lg:hidden flex flex-col min-h-screen relative z-10">
         <AdminHeader title="New_Cat" />
         <main className="p-6 pb-28">
            <div className="mb-8">
               <h1 className="text-3xl font-bold uppercase text-[#e1e2eb]">Add_Cat</h1>
               <p className="text-[10px] font-bold text-[#849495] uppercase tracking-widest mt-1">Directory Setup</p>
            </div>

            <div className="space-y-6">
               <div className="p-6 border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-md">
                  <div className="space-y-5">
                     <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#00dbe9] mb-2 block">Name</label>
                        <input 
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           placeholder="Category Name"
                           className="w-full bg-[#10131a] border border-[#3b494b] px-4 py-3.5 text-sm font-mono text-[#e1e2eb]"
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#00dbe9] mb-2 block">Type</label>
                        <select 
                           value={type}
                           onChange={(e) => setType(e.target.value)}
                           className="w-full bg-[#10131a] border border-[#3b494b] px-4 py-3.5 text-sm font-mono text-[#e1e2eb]"
                        >
                           <option value="repo">Repository</option>
                           <option value="website">Website</option>
                           <option value="research">Research</option>
                        </select>
                     </div>
                     <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#849495]">Status</span>
                        <button 
                           onClick={() => setActive(!active)}
                           className={`h-6 w-11 border transition-all ${active ? "bg-[#00dbe9]/20 border-[#00dbe9]" : "bg-transparent border-[#3b494b]"}`}
                        >
                           <div className={`h-4 w-4 transition-all ml-1 ${active ? "translate-x-5 bg-[#00dbe9]" : "bg-[#849495]"}`} />
                        </button>
                     </div>
                  </div>
               </div>

               <button 
                  onClick={onSave}
                  disabled={saving}
                  className="w-full bg-[#ebb2ff]/10 border border-[#ebb2ff] text-[#ebb2ff] font-bold py-4 text-xs uppercase tracking-widest transition-all"
               >
                  {saving ? "Creating..." : "Confirm_Category"}
               </button>
            </div>
         </main>
         <AdminFooter />
      </div>
    </div>
  );
}
