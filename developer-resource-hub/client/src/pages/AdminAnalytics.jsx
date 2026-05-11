import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import AdminFooter from "../components/AdminFooter";
import { useTheme } from "../context/ThemeContext";
import {
  Database, Globe, BookOpen, Tag, TrendingUp, Star, GitFork, Users,
  ArrowUp, BarChart2, ExternalLink, Menu, User, Activity, ShieldCheck, Cpu, Zap, Eye
} from "lucide-react";
import { useAdminUI } from "../context/AdminUIContext";

function formatCount(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function StatCard({ icon: Icon, label, value, sub, color, dark }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-lg ${dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-full opacity-10 ${color}`} />
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${color} bg-opacity-15`}>
        <Icon size={20} className={`${color.replace("bg-", "text-")}`} />
      </div>
      <p className={`text-3xl font-bold tracking-tight ${dark ? "text-slate-100" : "text-slate-900"}`}>{value}</p>
      <p className={`mt-1 text-sm font-medium ${dark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
      {sub && (
        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-500">
          <ArrowUp size={11} /> {sub} this week
        </div>
      )}
    </div>
  );
}

export default function AdminAnalytics() {
  const { toggleSidebar } = useAdminUI();
  const { dark } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await client.get("/stats", { authType: "admin" });
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats", err);
      setError(err?.response?.data?.message || "Failed to load analytics. Check that the server is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = stats?.counts || {};
  const recentWeek = stats?.recentWeek || {};
  const trendingRepos = stats?.trending?.repos || [];
  const topWebsites = stats?.trending?.websites || [];
  const popularItems = stats?.trending?.popular || [];
  const breakdown = stats?.categoryBreakdown || [];
  const maxBreakdown = Math.max(...breakdown.map((b) => b.count), 1);

  return (
    <div className="min-h-screen bg-[#10131a] text-[#e1e2eb] font-sans relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#84949510_1px,transparent_1px),linear-gradient(to_bottom,#84949510_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="mx-auto hidden min-h-screen grid-cols-[280px_1fr] lg:grid relative z-10">
        <AdminSidebar active="analytics" />

        <section className="min-w-0 flex flex-col">
          <AdminHeader title="Analytics Dashboard" />

          <main className="p-6">
            <div className="mx-auto">
              <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight text-[#e1e2eb]">SYSTEM_METRICS</h1>
                <p className="mt-1 text-sm font-bold text-[#b9cacb]">Real-time content statistics and trending insights</p>
              </div>

              {error ? (
                <div className="rounded-xl border border-[#ffb4ab]/50 bg-[#690005]/20 p-6 text-center text-[#ffb4ab] backdrop-blur-xl">
                  <p className="font-bold mb-1 uppercase tracking-widest text-sm">Could not load analytics</p>
                  <p className="text-[11px] font-mono opacity-80">{error}</p>
                  <button onClick={load} className="mt-4 border border-[#ffb4ab] bg-[#ffb4ab]/10 hover:bg-[#ffb4ab]/20 text-[#ffb4ab] px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors">Retry</button>
                </div>
              ) : loading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 animate-pulse border border-[#3b494b] bg-[#161b22]/50" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <StatCard icon={Database} label="Repositories" value={formatCount(counts.repos)} sub={recentWeek.repos} color="bg-[#00dbe9]" dark={true} />
                    <StatCard icon={Globe} label="Websites" value={formatCount(counts.websites)} sub={recentWeek.websites} color="bg-[#ebb2ff]" dark={true} />
                    <StatCard icon={BookOpen} label="Research" value={formatCount(counts.research)} sub={recentWeek.research} color="bg-[#00dbe9]" dark={true} />
                    <StatCard icon={Tag} label="Categories" value={formatCount(counts.categories)} color="bg-[#ebb2ff]" dark={true} />
                  </div>

                  <div className="mb-8 flex items-center justify-between border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl p-5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#849495]">Total Resources in Hub</p>
                      <p className="text-4xl font-bold text-[#00dbe9]">{formatCount(counts.total)}</p>
                    </div>
                    <BarChart2 size={48} className="text-[#00dbe9]/20" />
                  </div>

                  <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* System Diagnostic Panel */}
                    <section className="border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl p-5 lg:col-span-1">
                      <div className="mb-6 flex items-center gap-2">
                        <Cpu size={16} className="text-[#00dbe9]" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[#e1e2eb]">System_Health</h2>
                        <div className="ml-auto flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-[#00dbe9] animate-pulse" />
                          <span className="text-[10px] font-mono text-[#00dbe9]">ONLINE</span>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-[#849495]" />
                            <span className="text-[10px] font-bold text-[#849495] uppercase">Firewall</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#e1e2eb]">ENCRYPTED</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap size={14} className="text-[#849495]" />
                            <span className="text-[10px] font-bold text-[#849495] uppercase">Latency</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#00dbe9]">24ms</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Activity size={14} className="text-[#849495]" />
                            <span className="text-[10px] font-bold text-[#849495] uppercase">Sync_Rate</span>
                          </div>
                          <span className="text-[10px] font-mono text-[#e1e2eb]">99.8%</span>
                        </div>
                      </div>

                      <div className="mt-8 border-t border-[#3b494b] pt-5">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#849495] mb-3">Database Distribution</p>
                        <div className="flex gap-1">
                          <div className="h-1.5 flex-1 bg-[#00dbe9]" style={{ width: '40%' }} />
                          <div className="h-1.5 flex-1 bg-[#ebb2ff]" style={{ width: '30%' }} />
                          <div className="h-1.5 flex-1 bg-[#3b494b]" style={{ width: '30%' }} />
                        </div>
                        <div className="mt-3 flex justify-between text-[8px] font-bold text-[#849495] uppercase tracking-widest">
                          <span>Repos</span>
                          <span>Web</span>
                          <span>Papers</span>
                        </div>
                      </div>
                    </section>

                    {/* Popular Content */}
                    <section className="border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl p-5 lg:col-span-2">
                      <div className="mb-4 flex items-center gap-2">
                        <Star size={16} className="text-[#ebb2ff]" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[#e1e2eb]">Popular_Resources</h2>
                        <span className="ml-auto text-[10px] font-mono text-[#849495]">Global Views</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {popularItems.slice(0, 4).map((item, i) => (
                          <div key={item.id} className="flex items-center gap-3 border border-[#3b494b]/50 bg-[#10131a]/50 p-3 hover:bg-[#272a31]/50 transition-all group">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#ebb2ff]/10 text-[#ebb2ff] border border-[#ebb2ff]/20 group-hover:border-[#ebb2ff]">
                              {item.type === 'repo' ? <GitFork size={16} /> : <Globe size={16} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-[#e1e2eb] uppercase tracking-wide">{item.title}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="flex items-center gap-1 text-[10px] font-bold text-[#00dbe9]">
                                  <Eye size={10} /> {formatCount(item.views || 0)}
                                </span>
                                <span className="text-[9px] font-bold uppercase text-[#849495]">{item.type}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <section className="border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <TrendingUp size={16} className="text-[#00dbe9]" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[#e1e2eb]">Trending Repos</h2>
                        <span className="ml-auto text-[10px] font-mono text-[#849495]">by GitHub stars</span>
                      </div>
                      <div className="space-y-3">
                        {trendingRepos.map((repo, i) => (
                          <div key={repo.id} className="flex items-center gap-3 border border-[#3b494b]/50 bg-[#10131a]/50 p-3 hover:border-[#00dbe9]/50 transition-colors">
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center text-[10px] font-bold border ${i === 0 ? "bg-[#ebb2ff]/20 text-[#ebb2ff] border-[#ebb2ff]/50" : i === 1 ? "bg-[#00dbe9]/20 text-[#00dbe9] border-[#00dbe9]/50" : "bg-[#849495]/20 text-[#849495] border-[#849495]/50"}`}>
                              {i + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-[#e1e2eb] uppercase tracking-wide">{repo.title}</p>
                              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#849495]">{repo.category?.name || "—"}</p>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold">
                              <span className="flex items-center gap-1 text-[#ebb2ff]">
                                <Star size={11} /> {formatCount(repo.githubMeta?.stars)}
                              </span>
                              <a href={repo.link} target="_blank" rel="noreferrer">
                                <ExternalLink size={12} className="text-[#00dbe9] hover:text-[#e1e2eb] transition-colors" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <Globe size={16} className="text-[#ebb2ff]" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[#e1e2eb]">Latest Websites</h2>
                      </div>
                      <div className="space-y-3">
                        {topWebsites.map((site) => (
                          <div key={site.id} className="flex items-center gap-3 border border-[#3b494b]/50 bg-[#10131a]/50 p-3 hover:border-[#ebb2ff]/50 transition-colors">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#ebb2ff]/10 text-[#ebb2ff] border border-[#ebb2ff]/30">
                              <Globe size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-[#e1e2eb] uppercase tracking-wide">{site.title}</p>
                              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#849495]">{site.category?.name || "—"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  <section className="border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-xl p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <BarChart2 size={16} className="text-[#00dbe9]" />
                      <h2 className="text-sm font-bold uppercase tracking-widest text-[#e1e2eb]">Inventory_Breakdown</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {breakdown.map((item) => (
                        <div key={item.id} className="space-y-1.5">
                          <div className="flex justify-between items-end">
                            <p className="truncate text-[10px] font-bold uppercase tracking-widest text-[#849495]">{item.name || "Unknown"}</p>
                            <span className="text-[10px] font-mono text-[#e1e2eb]">{item.count}</span>
                          </div>
                          <div className="h-1 bg-[#10131a] border border-[#3b494b]">
                            <div
                              className="h-full bg-[linear-gradient(90deg,#00dbe9,#ebb2ff)] transition-all duration-1000"
                              style={{ width: `${Math.round((item.count / maxBreakdown) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          </main>
          <AdminFooter />
        </section>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col min-h-screen relative z-10">
        <header className="flex h-16 items-center justify-between border-b border-[#3b494b] bg-[#161b22]/90 backdrop-blur-md px-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="flex h-10 w-10 items-center justify-center border border-[#00dbe9]/30 bg-[#00dbe9]/5 text-[#00dbe9] hover:bg-[#00dbe9]/15 hover:border-[#00dbe9] transition-all"
            >
              <Menu size={20} strokeWidth={2.5} />
            </button>
            <h1 className="text-xs font-bold tracking-[0.15em] uppercase text-[#e1e2eb]">Analytics_Ctrl</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border border-[#ebb2ff]/30 bg-[#ebb2ff]/10 text-[#ebb2ff]">
              <User size={18} />
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 pb-28">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="h-8 w-8 border-2 border-[#00dbe9]/20 border-t-[#00dbe9] animate-spin" />
              <p className="text-[11px] font-mono text-[#849495] uppercase tracking-widest">Syncing insights...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-md">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#849495]">Total Items</p>
                  <p className="text-2xl font-bold mt-1 text-[#00dbe9]">{formatCount(counts.total)}</p>
                </div>
                <div className="p-4 border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-md">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#849495]">Categories</p>
                  <p className="text-2xl font-bold mt-1 text-[#ebb2ff]">{formatCount(counts.categories)}</p>
                </div>
              </div>

              <section className="p-5 border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-md">
                <h2 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 text-[#e1e2eb]">
                  <TrendingUp size={14} className="text-[#00dbe9]" /> Trending Repos
                </h2>
                <div className="space-y-3">
                  {trendingRepos.slice(0, 3).map((repo, i) => (
                    <div key={repo.id} className="flex items-center justify-between border-b border-[#3b494b]/50 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-[#849495]">#{i + 1}</span>
                        <p className="text-[11px] font-bold uppercase tracking-wide truncate max-w-[150px] text-[#e1e2eb]">{repo.title}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#ebb2ff]">★ {formatCount(repo.githubMeta?.stars)}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-5 border border-[#3b494b] bg-[#161b22]/70 backdrop-blur-md">
                <h2 className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4 text-[#e1e2eb]">
                  <Users size={14} className="text-[#ebb2ff]" /> Most Popular
                </h2>
                <div className="space-y-3">
                  {popularItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-[#3b494b]/50 pb-2 last:border-0 last:pb-0">
                      <p className="text-[11px] font-bold uppercase tracking-wide truncate max-w-[180px] text-[#e1e2eb]">{item.title}</p>
                      <p className="text-[10px] font-bold text-[#00dbe9]">{formatCount(item.views)} v</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
