import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BookOpen, Box, FlaskConical, LayoutGrid, Settings, BarChart2, User, Globe, X, AlignLeft, Layers } from "lucide-react";
import { useAdminUI } from "../context/AdminUIContext";

const NAV_ITEMS = [
  { key: "analytics", to: "/admin/analytics", icon: BarChart2, label: "Analytics" },
  { key: "categories", to: "/admin", icon: FlaskConical, label: "Categories" },
  { key: "repos", to: "/admin/repos", icon: Box, label: "GitHub Repos" },
  { key: "websites", to: "/admin/websites", icon: Globe, label: "System Websites" },
  { key: "research", to: "/admin/research", icon: BookOpen, label: "Research" },
  { key: "toolkits", to: "/admin/toolkits", icon: Layers, label: "Toolkits" },
  { key: "ads", to: "/admin/ads", icon: Box, label: "Ads Manager" },
  { key: "settings", to: "/admin/settings", icon: Settings, label: "Settings" },
];

function SidebarContent({ active, onClose }) {
  return (
    <div className="flex h-full flex-col bg-[#10131a] border-[#3b494b] border-r shadow-2xl lg:shadow-none">
      {/* Logo & close */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-[#3b494b]/50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-[#00dbe9]/10 text-[#00dbe9] border border-[#00dbe9]">
            <LayoutGrid size={20} strokeWidth={2.5} />
          </div>
          <div>
             <p className="font-bold text-xl leading-none tracking-[0.2em] text-[#e1e2eb]">HUB</p>
             <p className="text-[10px] font-bold text-[#00dbe9] uppercase tracking-[0.15em] mt-0.5">Admin v2.0</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="lg:hidden flex h-10 w-10 items-center justify-center border border-[#3b494b] text-[#849495] hover:border-[#00dbe9] hover:text-[#00dbe9] hover:bg-[#00dbe9]/5 transition-all"
            aria-label="Close Sidebar"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Admin user card */}
      <div className="mx-6 my-6 flex items-center gap-3 p-4 bg-[#161b22]/70 border border-[#3b494b]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#ebb2ff]/10 text-[#ebb2ff] border border-[#ebb2ff]">
          <User size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold truncate text-[#e1e2eb] uppercase tracking-wider">Admin User</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#849495]">Super Admin</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1.5 px-4 text-sm overflow-y-auto">
        <p className="px-4 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#849495]">Navigation</p>
        {NAV_ITEMS.map(({ key, to, icon: Icon, label }) => {
          const isActive = active === key;
          return (
            <Link
              key={key}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3.5 font-bold uppercase tracking-wider transition-all text-xs ${
                isActive
                  ? "text-[#00dbe9] bg-[#00dbe9]/10 border border-[#00dbe9] shadow-[0_0_15px_rgba(0,219,233,0.15)]"
                  : "text-[#849495] border border-transparent hover:border-[#3b494b] hover:text-[#e1e2eb] hover:bg-[#272a31]"
              }`}
            >
              <Icon size={16} strokeWidth={2.5} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom info */}
      <div className="p-6">
         <div className="p-4 border border-[#3b494b] text-center bg-[#161b22]/70 backdrop-blur-sm">
            <p className="text-[10px] font-bold text-[#849495] uppercase tracking-[0.15em]">Server Uptime</p>
            <p className="text-xs font-mono font-bold mt-1 text-[#00dbe9]">99.9% Online</p>
         </div>
      </div>
    </div>
  );
}

export default function AdminSidebar({ dark, active = "categories" }) {
  const { isSidebarOpen, closeSidebar } = useAdminUI();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block sticky top-0 h-screen overflow-y-auto">
        <SidebarContent dark={dark} active={active} onClose={null} />
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity animate-in fade-in duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-out lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent dark={dark} active={active} onClose={closeSidebar} />
      </aside>
    </>
  );
}
