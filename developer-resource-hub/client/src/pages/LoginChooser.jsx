import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, Compass } from "lucide-react";
import client, { API_BASE_URL, setUserToken, setUserInfo } from "../api/client";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

export default function LoginChooser() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { dark } = useTheme();

  function getOAuthUrl(path) {
    return `${API_BASE_URL}${path}`;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await client.post("/auth/user/login", { email, password });
      setUserToken(data.token);
      setUserInfo({ email: data.user.email, id: data.user.id });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 px-4 py-8 ${dark ? "bg-[#0f172a] text-white" : "bg-[#f8f9fc] text-slate-900"}`}>
      {/* Theme Toggle in top right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Brand Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto w-10 h-10 bg-[#38bdf8] rounded-full flex items-center justify-center mb-3">
          <Compass className="text-white" size={20} fill="currentColor" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] dark:text-white mb-1">Midnight Discovery</h1>
        <p className="text-sm font-medium text-slate-500">Precision Data Analytics</p>
      </div>

      {/* Login Card */}
      <div className={`w-full max-w-[440px] rounded-lg border p-10 transition-all ${dark ? "bg-[#1e293b] border-slate-700 shadow-xl" : "bg-white border-slate-200 shadow-sm"}`}>
        <h2 className="text-xl font-bold mb-3">Sign in</h2>
        <p className="text-sm text-slate-500 mb-8 font-medium">Sign in to your professional workspace</p>

        {error && (
          <div className="mb-6 p-3 rounded bg-red-50 text-red-600 text-xs font-bold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5">Email Address</label>
            <div className={`flex items-center gap-3 px-4 py-3 rounded border transition-all ${dark ? "bg-[#0f172a] border-slate-600 focus-within:border-sky-500" : "bg-white border-slate-300 focus-within:border-slate-400"}`}>
              <Mail className="text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-transparent outline-none text-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-0.5">Password</label>
              <button type="button" className="text-xs font-bold text-[#0284c7] hover:underline">Forgot password?</button>
            </div>
            <div className={`flex items-center gap-3 px-4 py-3 rounded border transition-all ${dark ? "bg-[#0f172a] border-slate-600 focus-within:border-sky-500" : "bg-white border-slate-300 focus-within:border-slate-400"}`}>
              <Lock className="text-slate-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent outline-none text-sm placeholder:text-slate-400"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400">
                <Eye size={18} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded font-bold text-sm transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 ${dark ? "bg-[#38bdf8] text-[#0f172a] hover:bg-[#7dd3fc]" : "bg-[#0f172a] text-white hover:bg-[#1e293b]"}`}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className={`px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${dark ? "bg-[#1e293b]" : "bg-white"}`}>Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => (window.location.href = getOAuthUrl("/auth/google/start"))}
            className={`flex items-center justify-center gap-3 py-3.5 rounded border font-bold text-xs transition-all ${dark ? "border-slate-600 bg-[#0f172a] text-white hover:bg-slate-800" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-4 h-4" /> Google
          </button>
          <button
            type="button"
            onClick={() => (window.location.href = getOAuthUrl("/auth/github/start"))}
            className={`flex items-center justify-center gap-3 py-3.5 rounded border font-bold text-xs transition-all ${dark ? "border-slate-600 bg-[#0f172a] text-white hover:bg-slate-800" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> GitHub
          </button>
        </div>

        <p className="mt-10 text-center text-sm font-medium text-slate-500">
          Don't have an account? <Link to="/signup" className="text-[#0284c7] font-bold hover:underline">Sign up</Link>
        </p>

        <p className="mt-4 text-center">
          <Link to="/admin/login" className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-tighter">Admin Access Portal</Link>
        </p>
      </div>

      <footer className="mt-12 text-center text-[11px] font-medium text-slate-400 tracking-tight">
        <div className="flex justify-center gap-6 uppercase">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Support</span>
        </div>
        <p className="mt-3">© 2024 Midnight Discovery Inc.</p>
      </footer>
    </div>
  );
}
