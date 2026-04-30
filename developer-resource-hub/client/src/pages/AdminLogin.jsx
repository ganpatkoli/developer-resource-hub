import { useState } from "react";
import { useNavigate, useLocation, Link, Navigate } from "react-router-dom";
import { Database, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import client, { setAdminToken, getAdminToken } from "../api/client";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { dark } = useTheme();
  const from = location.state?.from?.pathname || "/admin";

  if (getAdminToken()) {
    return <Navigate to="/admin" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await client.post("/auth/login", { email, password });
      setAdminToken(data.token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Admin authorization failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 transition-colors duration-300 ${dark ? "bg-[#0B0F19] text-slate-200" : "bg-slate-50 text-slate-900"}`}>
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 ${dark ? "bg-rose-500/10" : "bg-rose-100/40"}`} />
        <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 ${dark ? "bg-amber-500/10" : "bg-amber-100/40"}`} />
      </div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md z-10">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className={`flex items-center gap-2 text-[10px] font-black tracking-widest uppercase transition-colors ${dark ? "text-slate-500 hover:text-cyan-400" : "text-slate-400 hover:text-blue-600"}`}>
            <ArrowLeft size={14} />
            System_Exit
          </Link>
        </div>

        <div className={`rounded-3xl border p-8 shadow-2xl backdrop-blur-xl transition-all ${dark ? "border-slate-800 bg-slate-900/50" : "border-white bg-white/80"}`}>
          <div className="text-center mb-8">
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${dark ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]" : "bg-rose-600 text-white shadow-lg shadow-rose-200"}`}>
              <Database size={24} />
            </div>
            <h1 className="text-xl font-black tracking-widest uppercase mb-2">Admin_Console</h1>
            <p className={`text-[10px] font-bold tracking-widest uppercase ${dark ? "text-slate-500" : "text-slate-400"}`}>Root level authentication required</p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-[11px] font-bold tracking-wide text-rose-400 text-center uppercase">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className={`text-[9px] font-black tracking-[0.2em] uppercase pl-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>Administrator_ID</label>
              <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all focus-within:ring-1 ${dark ? "border-slate-800 bg-slate-950 focus-within:border-rose-500/50 focus-within:ring-rose-500/20" : "border-slate-200 bg-white focus-within:border-rose-400 shadow-sm"}`}>
                <Mail size={16} className="text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ROOT@HUB.COM"
                  className="w-full bg-transparent text-[11px] font-bold tracking-widest outline-none placeholder:text-slate-700 uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-[9px] font-black tracking-[0.2em] uppercase pl-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>Privilege_Key</label>
              <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all focus-within:ring-1 ${dark ? "border-slate-800 bg-slate-950 focus-within:border-rose-500/50 focus-within:ring-rose-500/20" : "border-slate-200 bg-white focus-within:border-rose-400 shadow-sm"}`}>
                <Lock size={16} className="text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-[11px] font-bold tracking-widest outline-none placeholder:text-slate-700"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-600 hover:text-slate-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl py-4 text-[11px] font-black tracking-[0.3em] uppercase transition-all shadow-lg ${dark ? "bg-rose-500 text-[#0B0F19] hover:bg-rose-400 shadow-rose-500/20" : "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-500/20"} disabled:opacity-50`}
            >
              {loading ? "AUTHENTICATING..." : "EXECUTE_LOGIN"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className={`text-[9px] font-black tracking-widest uppercase underline underline-offset-4 decoration-slate-800 transition-colors ${dark ? "text-slate-500 hover:text-cyan-400" : "text-slate-400 hover:text-blue-600"}`}>
              Standard_Personnel_Portal
            </Link>
          </div>
        </div>

        <p className={`mt-8 text-center text-[9px] font-black tracking-[0.2em] uppercase ${dark ? "text-slate-800" : "text-slate-300"}`}>
          Warning: Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
}
