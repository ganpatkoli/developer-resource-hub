import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, ExternalLink, Eye, EyeOff, BarChart2, Megaphone } from "lucide-react";
import client from "../api/client";
import { useTheme } from "../context/ThemeContext";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";

export default function AdminAds() {
  const { dark } = useTheme();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAd, setCurrentAd] = useState({
    title: "",
    imageUrl: "",
    targetUrl: "",
    position: "HOME_BANNER",
    isActive: false
  });

  const fetchAds = async () => {
    try {
      const res = await client.get("/ads");
      setAds(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentAd._id) {
        await client.put(`/ads/${currentAd._id}`, currentAd);
      } else {
        await client.post("/ads", currentAd);
      }
      setIsEditing(false);
      setCurrentAd({ title: "", imageUrl: "", targetUrl: "", position: "HOME_BANNER", isActive: false });
      fetchAds();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (ad) => {
    try {
      await client.put(`/ads/${ad._id}`, { isActive: !ad.isActive });
      fetchAds();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAd = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await client.delete(`/ads/${id}`);
      fetchAds();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#10131a] text-[#e1e2eb] font-sans relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#84949510_1px,transparent_1px),linear-gradient(to_bottom,#84949510_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="mx-auto hidden min-h-screen grid-cols-[280px_1fr] lg:grid relative z-10">
        <AdminSidebar active="ads" />

        <section className="min-w-0 flex flex-col">
          <AdminHeader title="Ads Management" />

          <main className="p-6">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-[#e1e2eb]">AD_INTEL_SYSTEM</h1>
                <p className="mt-1 text-sm font-bold text-[#b9cacb]">Configure and monitor platform advertisements</p>
              </div>
              <button 
                onClick={() => { setIsEditing(true); setCurrentAd({ title: "", imageUrl: "", targetUrl: "", position: "HOME_BANNER", isActive: false }); }}
                className="flex items-center gap-2 bg-cyan-500 text-[#10131a] px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              >
                <Plus size={16} /> Create New Ad
              </button>
            </div>

            {isEditing && (
              <div className="mb-12 bg-[#161b22] border border-[#3b494b] p-8 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-300 backdrop-blur-xl">
                <h2 className="text-sm font-black uppercase tracking-widest mb-6 text-slate-400 border-b border-[#3b494b] pb-2">
                  {currentAd._id ? "EDIT_CAMPAIGN" : "INITIALIZE_CAMPAIGN"}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Campaign Title</label>
                      <input 
                        value={currentAd.title}
                        onChange={e => setCurrentAd({...currentAd, title: e.target.value})}
                        className="w-full bg-[#10131a] border border-[#3b494b] rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all text-white"
                        placeholder="E.g. Summer Promo 2024"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Image URL</label>
                      <input 
                        value={currentAd.imageUrl}
                        onChange={e => setCurrentAd({...currentAd, imageUrl: e.target.value})}
                        className="w-full bg-[#10131a] border border-[#3b494b] rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all text-white"
                        placeholder="https://images.unsplash.com/..."
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Target URL</label>
                      <input 
                        value={currentAd.targetUrl}
                        onChange={e => setCurrentAd({...currentAd, targetUrl: e.target.value})}
                        className="w-full bg-[#10131a] border border-[#3b494b] rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all text-white"
                        placeholder="https://yourwebsite.com/offer"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Position</label>
                        <select 
                          value={currentAd.position}
                          onChange={e => setCurrentAd({...currentAd, position: e.target.value})}
                          className="w-full bg-[#10131a] border border-[#3b494b] rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all appearance-none text-white"
                        >
                          <option value="HOME_BANNER">Home Banner</option>
                          <option value="SIDEBAR">Sidebar</option>
                          <option value="LEFT_GUTTER">Left Gutter</option>
                          <option value="RIGHT_GUTTER">Right Gutter</option>
                          <option value="BOTTOM_FULL">Bottom Full</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Initial State</label>
                        <button 
                          type="button"
                          onClick={() => setCurrentAd({...currentAd, isActive: !currentAd.isActive})}
                          className={`w-full py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${currentAd.isActive ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" : "bg-slate-800 border-slate-700 text-slate-500"}`}
                        >
                          {currentAd.isActive ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-4 mt-4 pt-6 border-t border-[#3b494b]">
                    <button 
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-8 py-2.5 rounded-xl border border-[#3b494b] text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 text-slate-400"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="bg-cyan-500 text-[#10131a] px-10 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-400 shadow-xl"
                    >
                      Deploy Campaign
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ads.map(ad => (
                <div key={ad._id} className="bg-[#161b22] border border-[#3b494b] rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all group shadow-xl">
                  <div className="h-40 relative">
                    <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase border ${ad.isActive ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-red-500/10 border-red-500/50 text-red-400"}`}>
                        {ad.isActive ? "ACTIVE" : "INACTIVE"}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#161b22] to-transparent">
                      <h3 className="text-white font-black text-sm uppercase tracking-widest">{ad.title}</h3>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Performance</span>
                          <div className="flex items-center gap-1.5 text-cyan-400">
                            <BarChart2 size={12} />
                            <span className="text-xs font-black">{ad.clickCount} CLICKS</span>
                          </div>
                        </div>
                      </div>
                      <span className="bg-slate-800 text-slate-400 text-[8px] font-black px-2 py-1 rounded border border-[#3b494b] uppercase tracking-widest">
                        {ad.position}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#3b494b]/50">
                      <div className="flex gap-2">
                        <button onClick={() => { setCurrentAd(ad); setIsEditing(true); }} className="p-2.5 rounded-lg bg-slate-800 border border-[#3b494b] text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => toggleStatus(ad)} className="p-2.5 rounded-lg bg-slate-800 border border-[#3b494b] text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                          {ad.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button onClick={() => deleteAd(ad._id)} className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-[#10131a] transition-all">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
              {ads.length === 0 && !loading && (
                <div className="col-span-full py-20 text-center border border-dashed border-[#3b494b] rounded-2xl bg-[#161b22]/50">
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest">No active campaigns found in database.</p>
                </div>
              )}
            </div>
          </main>

          <AdminFooter />
        </section>
      </div>

      {/* Mobile Sidebar & Layout handled by AdminSidebar & AdminFooter */}
      <div className="lg:hidden">
        <AdminHeader title="Ads Management" />
        <main className="p-4 pb-32">
           {/* Same content as desktop main */}
           <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-black tracking-tight text-[#e1e2eb]">ADS</h1>
              <button 
                onClick={() => { setIsEditing(true); setCurrentAd({ title: "", imageUrl: "", targetUrl: "", position: "HOME_BANNER", isActive: false }); }}
                className="bg-cyan-500 text-[#10131a] p-2 rounded-xl"
              >
                <Plus size={20} />
              </button>
            </div>
            {/* ... ads map ... */}
            <div className="space-y-6">
              {ads.map(ad => (
                 <div key={ad._id} className="bg-[#161b22] border border-[#3b494b] rounded-2xl overflow-hidden shadow-xl">
                   <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 object-cover" />
                   <div className="p-4">
                      <h3 className="text-white font-black text-sm uppercase mb-4">{ad.title}</h3>
                      <div className="flex justify-between items-center">
                        <div className="text-cyan-400 font-black text-xs">{ad.clickCount} CLICKS</div>
                        <div className="flex gap-2">
                           <button onClick={() => { setCurrentAd(ad); setIsEditing(true); }} className="p-2 text-slate-400"><Edit2 size={16} /></button>
                           <button onClick={() => deleteAd(ad._id)} className="p-2 text-red-400"><Trash2 size={16} /></button>
                        </div>
                      </div>
                   </div>
                 </div>
              ))}
            </div>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
