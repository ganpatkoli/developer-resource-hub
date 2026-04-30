import { Link, useLocation } from "react-router-dom";
import { 
  Compass, 
  Rss, 
  Box, 
  BookOpen, 
  Bookmark 
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function MobileNav() {
  const { dark } = useTheme();
  const location = useLocation();

  const NAV_ITEMS = [
    { label: "EXPLORE", icon: Compass, to: "/" },
    { label: "REPOS", icon: Box, to: "/repos" },
    { label: "FEED", icon: Rss, to: "/news" },
    { label: "PAPERS", icon: BookOpen, to: "/research" },
    { label: "SAVED", icon: Bookmark, to: "/saved" },
  ];

  return (
    <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 h-20 px-4 border-t backdrop-blur-xl flex items-center justify-between transition-colors duration-300 ${dark ? "bg-[#10131a]/95 border-[#3b494b]" : "bg-white/95 border-slate-200"}`}>
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.to;
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.label}
            to={item.to}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? "text-cyan-400" : "text-slate-500"}`}
          >
            <div className={`p-2 rounded-full transition-all duration-300 ${isActive ? "bg-cyan-500/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]" : ""}`}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[8px] font-black tracking-widest transition-opacity ${isActive ? "opacity-100" : "opacity-60"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
