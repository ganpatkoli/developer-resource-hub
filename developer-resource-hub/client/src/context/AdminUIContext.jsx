import { createContext, useContext, useState } from "react";

const AdminUIContext = createContext();

export function AdminUIProvider({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);
  const openSidebar = () => setIsSidebarOpen(true);

  return (
    <AdminUIContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar, openSidebar }}>
      {children}
    </AdminUIContext.Provider>
  );
}

export const useAdminUI = () => {
  const context = useContext(AdminUIContext);
  if (!context) {
    throw new Error("useAdminUI must be used within an AdminUIProvider");
  }
  return context;
};
