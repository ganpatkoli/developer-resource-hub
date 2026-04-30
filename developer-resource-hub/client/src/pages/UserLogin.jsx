import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import client, { API_BASE_URL, setUserToken, getUserToken, setUserInfo, setAdminToken, getAdminToken } from "../api/client";
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from "../config/demoUser";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const navigate = useNavigate();

  function getOAuthUrl(path) {
    return `${API_BASE_URL}${path}`;
  }

  if (getUserToken() || getAdminToken()) {
    return <Navigate to="/" replace />;
  }

  async function submitLogin(body) {
    setError("");
    setLoading(true);
    try {
      const { data } = await client.post("/auth/user/login", body);
      if (data.user.role === "admin") {
        setAdminToken(data.token);
        setUserInfo({ email: data.user.email, id: data.user.id, role: data.user.role });
        navigate("/admin/settings", { replace: true });
      } else {
        setUserToken(data.token);
        setUserInfo({ email: data.user.email, id: data.user.id, role: data.user.role });
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    await submitLogin({ email, password });
  }

  async function onDemoClick() {
    setDemoLoading(true);
    setError("");
    setEmail(DEMO_USER_EMAIL);
    setPassword(DEMO_USER_PASSWORD);
    try {
      const { data } = await client.post("/auth/user/login", {
        email: DEMO_USER_EMAIL,
        password: DEMO_USER_PASSWORD,
      });
      if (data.user.role === "admin") {
        setAdminToken(data.token);
        setUserInfo({ email: data.user.email, id: data.user.id, role: data.user.role });
        navigate("/admin/settings", { replace: true });
      } else {
        setUserToken(data.token);
        setUserInfo({ email: data.user.email, id: data.user.id, role: data.user.role });
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Demo login failed. Run server seed: npm run seed in /server");
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#10131a] relative overflow-hidden font-sans">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#84949510_1px,transparent_1px),linear-gradient(to_bottom,#84949510_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00dbe9]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ebb2ff]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative w-full max-w-[440px] p-8 md:p-10 bg-[#161b22]/70 backdrop-blur-xl border border-[#3b494b] shadow-2xl z-10 m-4">
        {/* Logo area */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 flex items-center justify-center bg-[#00dbe9]/10 border border-[#00dbe9] text-[#00dbe9]">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </div>
          <span className="font-bold tracking-[0.15em] text-[#e1e2eb] uppercase text-sm">Synthetic Intel</span>
        </div>

        <h1 className="text-3xl font-bold text-[#e1e2eb] mb-2 tracking-tight">Welcome back</h1>
        <p className="text-[#b9cacb] mb-8 text-sm">Please enter your details to sign in.</p>

        <form onSubmit={onSubmit} className="space-y-5">
          {error && (
            <div className="border border-[#ffb4ab] bg-[#93000a]/20 px-4 py-3 text-sm text-[#ffb4ab] flex items-start gap-2">
              <span className="font-bold uppercase tracking-widest text-[10px] bg-[#ffb4ab] text-[#93000a] px-1 py-0.5 mr-1">ERR</span>
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#849495] tracking-[0.15em] uppercase mb-2">
              Email Address
            </label>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-[#3b494b] rounded-none px-4 py-3 text-[#e1e2eb] focus:outline-none focus:border-[#00dbe9] focus:ring-1 focus:ring-[#00dbe9] transition-all placeholder:text-[#849495]/50 font-mono text-sm"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-bold text-[#849495] tracking-[0.15em] uppercase">
                Password
              </label>
              <a href="#" className="text-[11px] text-[#00dbe9] hover:text-[#7df4ff] tracking-wider transition-colors">
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-[#3b494b] rounded-none px-4 py-3 pr-10 text-[#e1e2eb] focus:outline-none focus:border-[#ebb2ff] focus:ring-1 focus:ring-[#ebb2ff] transition-all placeholder:text-[#849495]/50 font-mono text-sm"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#849495] hover:text-[#00dbe9] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || demoLoading}
            className="w-full bg-[#00dbe9]/10 border border-[#00dbe9] text-[#00dbe9] uppercase tracking-[0.2em] font-bold py-3.5 mt-2 hover:bg-[#00dbe9]/20 hover:shadow-[0_0_15px_rgba(0,219,233,0.3)] transition-all disabled:opacity-50 disabled:hover:shadow-none"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 mb-6 flex items-center">
          <div className="flex-1 border-t border-[#3b494b]"></div>
          <span className="px-4 text-[10px] tracking-[0.2em] font-bold text-[#849495] uppercase">
            Or Continue With
          </span>
          <div className="flex-1 border-t border-[#3b494b]"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => (window.location.href = getOAuthUrl("/auth/google/start"))}
            className="flex justify-center items-center gap-2 border border-[#3b494b] bg-transparent py-3 text-[#e1e2eb] text-sm font-bold tracking-wide hover:bg-[#272a31] hover:border-[#849495] transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => (window.location.href = getOAuthUrl("/auth/github/start"))}
            className="flex justify-center items-center gap-2 border border-[#3b494b] bg-transparent py-3 text-[#e1e2eb] text-sm font-bold tracking-wide hover:bg-[#272a31] hover:border-[#849495] transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub
          </button>
        </div>

        <p className="mt-8 text-center text-[13px] text-[#b9cacb]">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#00dbe9] font-bold hover:text-[#7df4ff] hover:underline transition-colors">
            Sign up
          </Link>
        </p>

        <div className="mt-8 pt-6 border-t border-[#3b494b]/50 text-center">
          <button
            type="button"
            onClick={onDemoClick}
            disabled={loading || demoLoading}
            className="text-[10px] text-[#849495] tracking-[0.2em] font-bold uppercase hover:text-[#00dbe9] transition-colors disabled:opacity-50"
          >
            [ Initialize Demo Sequence ]
          </button>
        </div>
      </div>
    </div>
  );
}
