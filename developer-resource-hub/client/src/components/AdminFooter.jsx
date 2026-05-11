import { Link, useLocation } from "react-router-dom";
import {
  BarChart2,
  FlaskConical,
  Box,
  Globe,
  BookOpen,
  Settings,
  Layers,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const TABS = [
  { key: "analytics", to: "/admin/analytics", icon: BarChart2, label: "Stats" },
  { key: "categories", to: "/admin", icon: FlaskConical, label: "Cats" },
  { key: "repos", to: "/admin/repos", icon: Box, label: "Repos" },
  { key: "websites", to: "/admin/websites", icon: Globe, label: "Webs" },
  { key: "research", to: "/admin/research", icon: BookOpen, label: "Papers" },
  { key: "toolkits", to: "/admin/toolkits", icon: Layers, label: "Tools" },
  { key: "ads", to: "/admin/ads", icon: Box, label: "Ads" },
  { key: "settings", to: "/admin/settings", icon: Settings, label: "Setup" },
];

export default function AdminFooter() {
  const location = useLocation();

  return (
    <>
      {/* Desktop Footer - subtle terminal style */}
      <footer className="mt-auto border-t border-[#3b494b] py-8 px-8 hidden lg:block bg-[#10131a]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mx-auto">
          <div className="flex items-center gap-6 text-[10px] font-bold tracking-[0.2em] text-[#849495] uppercase">
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-[#00dbe9] animate-pulse" />
               <span className="text-[#00dbe9]/80">System Online</span>
            </div>
            <span className="text-[#3b494b]">|</span>
            <span>© 2026 Developer Resource Hub // CORE V2.5</span>
          </div>
          <div className="flex items-center gap-6 text-[10px] font-bold tracking-[0.2em] text-[#849495] uppercase">
            <span className="text-[#ebb2ff]/50">Status: Secure</span>
            <span className="text-[#3b494b]">|</span>
            <span className="hover:text-[#00dbe9] transition-colors cursor-default">Cloud Sync: Active</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Tabs - Compact & Scrollable */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#3b494b] px-2 py-2 flex items-center overflow-x-auto no-scrollbar gap-2 backdrop-blur-xl bg-[#161b22]/90">
        {TABS.map((tab) => {
          const isActive = location.pathname === tab.to;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.key}
              to={tab.to}
              className={`flex flex-col items-center justify-center gap-1 px-4 min-w-[64px] shrink-0 transition-all ${
                isActive ? "text-[#00dbe9]" : "text-[#849495]"
              }`}
            >
              <div className={`relative transition-transform duration-300 ${isActive ? "scale-110" : "scale-90"}`}>
                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                  <div className="absolute -top-1 -right-1 h-1 w-1 bg-[#00dbe9] rounded-full shadow-[0_0_8px_rgba(0,219,233,0.6)]" />
                )}
              </div>
              <span className={`text-[7px] font-bold uppercase tracking-widest truncate w-full text-center transition-opacity ${
                isActive ? "opacity-100" : "opacity-60"
              }`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
