import { Menu, Bell, User, LayoutGrid, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../context/ThemeContext";
import { useAdminUI } from "../context/AdminUIContext";

export default function AdminHeader({ title, backTo }) {
  const { dark } = useTheme();
  const { toggleSidebar } = useAdminUI();
  const navigate = useNavigate();

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#3b494b] bg-[#161b22]/90 px-4 lg:px-6 sticky top-0 z-10 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {backTo ? (
          <button 
            onClick={() => navigate(backTo)}
            className="flex h-10 w-10 items-center justify-center border border-[#3b494b] bg-[#161b22] text-[#e1e2eb] hover:border-[#00dbe9] hover:text-[#00dbe9] transition-all active:scale-95"
            aria-label="Go Back"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
        ) : (
          <button 
            onClick={toggleSidebar}
            className="lg:hidden flex h-10 w-10 items-center justify-center border border-[#00dbe9]/30 bg-[#00dbe9]/5 text-[#00dbe9] hover:bg-[#00dbe9]/15 hover:border-[#00dbe9] transition-all active:scale-95 shadow-[0_0_10px_rgba(0,219,233,0.1)]"
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} strokeWidth={2.5} />
          </button>
        )}
        <div className="flex items-center gap-3 text-[#e1e2eb]">
          <LayoutGrid size={18} className="text-[#00dbe9] hidden sm:block" />
          <p className="text-sm font-bold tracking-[0.15em] uppercase">{title || "Admin Panel"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* ThemeToggle removed as we use unified dark UI */}
        <div className="h-8 w-[1px] hidden sm:block bg-[#3b494b]" />
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden md:block">
            <p className="text-[11px] font-bold leading-none uppercase tracking-[0.15em] text-[#e1e2eb]">Admin User</p>
            <p className="text-[9px] text-[#849495] mt-1 uppercase font-bold tracking-[0.15em]">Super Admin</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-[#00dbe9] bg-[#00dbe9]/10 text-[#00dbe9]">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
