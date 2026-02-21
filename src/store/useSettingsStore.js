import { create } from "zustand";

const SETTINGS_KEY = "porsche_settings";

const saved = (() => {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch {
    return {};
  }
})();

if (saved.theme === "dark") {
  document.documentElement.classList.add("dark");
}

const persist = (patch) => {
  try {
    const prev = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...prev, ...patch }));
  } catch {
    /* ignore */
  }
};

export const useSettingsStore = create((set) => ({
  lang: saved.lang || "en",
  theme: saved.theme || "light",

  setLang: (lang) => {
    persist({ lang });
    set({ lang });
  },

  setTheme: (theme) => {
    persist({ theme });
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    set({ theme });
  },
}));
