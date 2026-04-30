import { createContext, useContext, useState, useEffect } from "react";
import client from "../api/client";

const SettingsContext = createContext({
  settings: { tabs: { repos: true, websites: true, research: true }, customSections: [] },
  loading: true,
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({ tabs: { repos: true, websites: true, research: true }, customSections: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    client.get("/settings")
      .then(res => {
        if (!cancelled && res.data) {
          setSettings(res.data);
        }
      })
      .catch(err => console.error("Failed to fetch settings", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
