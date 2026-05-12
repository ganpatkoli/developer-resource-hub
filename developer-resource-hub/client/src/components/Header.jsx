import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { getUserToken, getUserInfo, setUserToken, getAdminToken, setAdminToken } from "../api/client";
import { Bell, Search, Settings, User, UserCircle, LogOut } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function Header() {
  const { dark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [userLabel, setUserLabel] = useState(null);

  useEffect(() => {
    const adminToken = getAdminToken();
    const userToken = getUserToken();
    if (adminToken || userToken) {
      setUserLabel(getUserInfo()?.email || "Authenticated");
    } else {
      setUserLabel(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    setUserToken(null);
    setAdminToken(null);
    setUserLabel(null);
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${
      isActive 
      ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" 
      : "text-slate-500 hover:text-slate-300"
    }`;

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`flex h-16 shrink-0 items-center justify-between px-6 lg:px-8 sticky top-0 z-50 backdrop-blur-md transition-colors duration-300 border-b ${dark ? "border-[#3b494b] bg-[#10131a]/90" : "border-slate-200 bg-white/90"}`}>
      <div className="lg:hidden">
        <Search size={20} className="text-cyan-400" />
      </div>

      <div className="flex items-center gap-12 flex-1 lg:flex-none justify-center lg:justify-start">
        <Link to="/" className="flex items-center">
          <img src="/LOGO.png" alt="AI Guardian Cloud logo" className="h-10 w-auto max-w-[160px] object-contain" />
        </Link>
        
        <nav className="hidden lg:flex items-center gap-8">
          <NavLink to="/" className={navLinkClass}>
            Home
            {isActive("/") && <span className="absolute -bottom-[25px] left-0 h-[2px] w-full bg-[#00dbe9] shadow-[0_0_8px_rgba(0,219,233,0.8)]" />}
          </NavLink>
          <NavLink to="/news" className={navLinkClass}>
            GLOBAL NEWS
            {isActive("/news") && <span className="absolute -bottom-[25px] left-0 h-[2px] w-full bg-[#00dbe9] shadow-[0_0_8px_rgba(0,219,233,0.8)]" />}
          </NavLink>
          <NavLink to="/repos" className={navLinkClass}>
            REPOSITORIES
            {isActive("/repos") && <span className="absolute -bottom-[25px] left-0 h-[2px] w-full bg-[#00dbe9] shadow-[0_0_8px_rgba(0,219,233,0.8)]" />}
          </NavLink>
          <NavLink to="/websites" className={navLinkClass}>
            WEBSITES
            {isActive("/websites") && <span className="absolute -bottom-[25px] left-0 h-[2px] w-full bg-[#00dbe9] shadow-[0_0_8px_rgba(0,219,233,0.8)]" />}
          </NavLink>
          <NavLink to="/research" className={navLinkClass}>
            RESEARCH
            {isActive("/research") && <span className="absolute -bottom-[25px] left-0 h-[2px] w-full bg-[#00dbe9] shadow-[0_0_8px_rgba(0,219,233,0.8)]" />}
          </NavLink>
          <NavLink to="/toolkits" className={navLinkClass}>
            TOOLKITS
            {isActive("/toolkits") && <span className="absolute -bottom-[25px] left-0 h-[2px] w-full bg-[#00dbe9] shadow-[0_0_8px_rgba(0,219,233,0.8)]" />}
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className={`hidden md:flex h-9 w-64 items-center gap-3 rounded-lg border px-4 transition-all focus-within:ring-1 ${dark ? "bg-[#161b22] border-[#3b494b] focus-within:border-cyan-500/50" : "bg-slate-50 border-slate-200"}`}>
          <Search size={14} className="text-slate-500" />
          <input
            type="text"
            placeholder="QUERY_SYSTEM_ROOT..."
            className="bg-transparent text-[10px] font-black tracking-widest outline-none w-full text-slate-300 placeholder:text-slate-600"
          />
        </div>

        <div className="flex items-center gap-4 lg:gap-5 lg:border-l lg:pl-6 border-[#3b494b]">
          {/* <div className="hidden lg:block">
            <ThemeToggle className={dark ? "!bg-[#161b22] !border-[#3b494b]" : "!bg-slate-50 !border-slate-200"} />
          </div>
          <Settings size={18} className="hidden lg:block text-slate-500 cursor-pointer hover:text-cyan-400 transition-colors" /> */}
          
          {userLabel ? (
            <div className="flex items-center gap-3">
              <span className={`hidden md:block text-[9px] font-bold tracking-widest uppercase ${dark ? "text-slate-500" : "text-slate-400"}`}>
                {userLabel}
              </span>
              <button 
                onClick={handleLogout}
                className={`p-1.5 transition-all border ${dark ? "text-rose-400 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10" : "text-rose-600 border-rose-100 bg-rose-50 hover:bg-rose-100"}`}
                title="Secure Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login">
              <UserCircle size={22} className={`cursor-pointer transition-colors ${dark ? "text-slate-400 hover:text-[#00dbe9]" : "text-slate-500 hover:text-cyan-600"}`} />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
