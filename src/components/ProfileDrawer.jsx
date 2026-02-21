import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase.js";
import { useCarStore } from "../store/useCarStore.js";
import { useSettingsStore } from "../store/useSettingsStore.js";
import { t } from "../utils/translations.js";

const HISTORY_KEY = "porsche_history";

const PORSCHE_COUNTRIES = [
  { name: "Germany", flag: "\ud83c\udde9\ud83c\uddea", url: "https://www.porsche.com/germany/" },
  { name: "United States", flag: "\ud83c\uddfa\ud83c\uddf8", url: "https://www.porsche.com/usa/" },
  { name: "Canada", flag: "\ud83c\udde8\ud83c\udde6", url: "https://www.porsche.com/canada/" },
  { name: "United Kingdom", flag: "\ud83c\uddec\ud83c\udde7", url: "https://www.porsche.com/uk/" },
  { name: "France", flag: "\ud83c\uddeb\ud83c\uddf7", url: "https://www.porsche.com/france/" },
  { name: "Italy", flag: "\ud83c\uddee\ud83c\uddf9", url: "https://www.porsche.com/italy/" },
  { name: "Spain", flag: "\ud83c\uddea\ud83c\uddf8", url: "https://www.porsche.com/spain/" },
  { name: "Switzerland", flag: "\ud83c\udde8\ud83c\udded", url: "https://www.porsche.com/swiss/" },
  { name: "Austria", flag: "\ud83c\udde6\ud83c\uddf9", url: "https://www.porsche.com/austria/" },
  { name: "Netherlands", flag: "\ud83c\uddf3\ud83c\uddf1", url: "https://www.porsche.com/netherlands/" },
  { name: "Belgium", flag: "\ud83c\udde7\ud83c\uddea", url: "https://www.porsche.com/belgium/" },
  { name: "Portugal", flag: "\ud83c\uddf5\ud83c\uddf9", url: "https://www.porsche.com/portugal/" },
  { name: "Sweden", flag: "\ud83c\uddf8\ud83c\uddea", url: "https://www.porsche.com/sweden/" },
  { name: "Norway", flag: "\ud83c\uddf3\ud83c\uddf4", url: "https://www.porsche.com/norway/" },
  { name: "Denmark", flag: "\ud83c\udde9\ud83c\uddf0", url: "https://www.porsche.com/denmark/" },
  { name: "Finland", flag: "\ud83c\uddeb\ud83c\uddee", url: "https://www.porsche.com/finland/" },
  { name: "Poland", flag: "\ud83c\uddf5\ud83c\uddf1", url: "https://www.porsche.com/poland/" },
  { name: "Czech Republic", flag: "\ud83c\udde8\ud83c\uddff", url: "https://www.porsche.com/czech/" },
  { name: "Russia", flag: "\ud83c\uddf7\ud83c\uddfa", url: "https://www.porsche.com/russia/" },
  { name: "China", flag: "\ud83c\udde8\ud83c\uddf3", url: "https://www.porsche.com/china/" },
  { name: "Japan", flag: "\ud83c\uddef\ud83c\uddf5", url: "https://www.porsche.com/japan/" },
  { name: "South Korea", flag: "\ud83c\uddf0\ud83c\uddf7", url: "https://www.porsche.com/korea/" },
  { name: "Australia", flag: "\ud83c\udde6\ud83c\uddfa", url: "https://www.porsche.com/australia/" },
  { name: "Brazil", flag: "\ud83c\udde7\ud83c\uddf7", url: "https://www.porsche.com/brazil/" },
  { name: "Mexico", flag: "\ud83c\uddf2\ud83c\uddfd", url: "https://www.porsche.com/mexico/" },
  { name: "South Africa", flag: "\ud83c\uddff\ud83c\udde6", url: "https://www.porsche.com/south-africa/" },
  { name: "India", flag: "\ud83c\uddee\ud83c\uddf3", url: "https://www.porsche.com/india/" },
  { name: "Singapore", flag: "\ud83c\uddf8\ud83c\uddec", url: "https://www.porsche.com/singapore/" },
  { name: "Taiwan", flag: "\ud83c\uddf9\ud83c\uddfc", url: "https://www.porsche.com/taiwan/" },
  { name: "Malaysia", flag: "\ud83c\uddf2\ud83c\uddfe", url: "https://www.porsche.com/malaysia/" },
  { name: "Thailand", flag: "\ud83c\uddf9\ud83c\udded", url: "https://www.porsche.com/thailand/" },
  { name: "UAE", flag: "\ud83c\udde6\ud83c\uddea", url: "https://www.porsche.com/middle-east/" },
  { name: "Saudi Arabia", flag: "\ud83c\uddf8\ud83c\udde6", url: "https://www.porsche.com/middle-east/" },
  { name: "Turkey", flag: "\ud83c\uddf9\ud83c\uddf7", url: "https://www.porsche.com/turkey/" },
  { name: "Uzbekistan", flag: "\ud83c\uddfa\ud83c\uddff", url: "https://dealer.porsche.com/uz/tashkent/ru-RU/" },
];

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
  </svg>
);

export default function ProfileDrawer({ open, onClose }) {
  const { lang } = useSettingsStore();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsub;
    try {
      unsub = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({ name: firebaseUser.displayName || "User", email: firebaseUser.email || "", photo: firebaseUser.photoURL || "" });
        } else {
          setUser(null);
        }
      });
    } catch { /* Firebase not ready */ }
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (!open) return;
    setHistory(readJson(HISTORY_KEY, []));
  }, [open]);

  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [history]
  );

  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try { await signInWithPopup(auth, googleProvider); }
    catch (err) { console.error("Google login error:", err); setError(err.code || err.message || "Login failed"); }
    finally { setLoading(false); }
  };

  const handleLogout = async () => { await signOut(auth); setUser(null); };

  const handleOpenSaved = (item) => {
    if (!item?.config) return;
    const store = useCarStore.getState();
    store.setConfig(item.config);
    if (item.image) store.setSelectedImage(item.image);
    const slug = item.config.model.toLowerCase().replace(/\s+/g, "-");
    navigate(`/configurator/${slug}`);
    onClose();
  };

  const toggleSection = (section) => setActiveSection((prev) => (prev === section ? null : section));

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" role="button" tabIndex={0} onClick={onClose} onKeyDown={(e) => e.key === "Escape" && onClose()} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-700">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">{t(lang, "profile")}</p>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{user?.name || t(lang, "guest")}</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-neutral-300 px-3 py-2 text-xs uppercase tracking-wide text-neutral-700 dark:border-neutral-600 dark:text-neutral-300">
            {t(lang, "close")}
          </button>
        </div>

        <div className="flex h-[calc(100%-76px)] flex-col gap-0 overflow-y-auto">
          <div className="px-6 py-5">
            {!user ? (
              <>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-neutral-400 hover:shadow-md disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-500"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  {loading ? t(lang, "signingIn") : t(lang, "signInGoogle")}
                </button>
                {error && <p className="mt-2 text-center text-xs text-red-500">{error}</p>}
              </>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl bg-neutral-100 px-4 py-3 dark:bg-neutral-800">
                {user.photo && <img src={user.photo} alt="" className="h-10 w-10 rounded-full" referrerPolicy="no-referrer" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{user.name}</p>
                  <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
                </div>
                <button type="button" onClick={handleLogout} className="text-xs uppercase tracking-wide text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                  {t(lang, "logout")}
                </button>
              </div>
            )}
          </div>

          {/* Official Website */}
          <a href="https://www.porsche.com/international/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 border-t border-neutral-200 px-6 py-4 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 dark:bg-white">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white dark:text-neutral-900">
                <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900 dark:text-white">{t(lang, "officialSite")}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">porsche.com</p>
            </div>
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-neutral-400">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </a>

          {/* Configuration History */}
          <div className="border-t border-neutral-200 dark:border-neutral-700">
            <button type="button" onClick={() => toggleSection("history")} className="flex w-full items-center gap-3 px-6 py-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-neutral-600 dark:text-neutral-300">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{t(lang, "configHistory")}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{sortedHistory.length} {t(lang, "nSaved")}</p>
              </div>
              <ChevronIcon open={activeSection === "history"} />
            </button>

            {activeSection === "history" && (
              <div className="flex flex-col gap-3 px-6 pb-4">
                {sortedHistory.length ? (
                  sortedHistory.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
                      className="flex flex-col gap-3 rounded-2xl border border-neutral-200 p-3 text-left transition-colors hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                    >
                      <div className="overflow-hidden rounded-xl">
                        <img src={encodeURI(item.image)} alt={item.model} className="h-32 w-full object-cover" />
                      </div>
                      {expandedId === item.id ? (
                        <div className="text-xs text-neutral-600 dark:text-neutral-400">
                          <div className="font-semibold text-neutral-900 dark:text-white">{item.model}</div>
                          <div>{t(lang, "color")}: {item.config?.bodyColor}</div>
                          <div>{t(lang, "savedAt")}: {new Date(item.createdAt).toLocaleString()}</div>
                          <button
                            type="button"
                            onClick={(event) => { event.stopPropagation(); handleOpenSaved(item); }}
                            className="mt-3 rounded-full bg-neutral-900 px-4 py-2 text-[10px] uppercase tracking-wide text-white dark:bg-white dark:text-neutral-900"
                          >
                            {t(lang, "openConfig")}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-neutral-800 dark:text-neutral-200">{item.model}</span>
                          <span className="text-neutral-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-neutral-200 px-4 py-6 text-center text-xs text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                    {t(lang, "noSavedYet")}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Porsche Countries */}
          <div className="border-t border-neutral-200 dark:border-neutral-700">
            <button type="button" onClick={() => toggleSection("countries")} className="flex w-full items-center gap-3 px-6 py-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-neutral-600 dark:text-neutral-300">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM2.458 10A7.545 7.545 0 003.1 7.3a8.02 8.02 0 001.228 1.608A9.05 9.05 0 002.458 10zm.58 1.5a9.05 9.05 0 001.86 1.092A8.02 8.02 0 003.67 14.2a7.545 7.545 0 01-.632-2.7zm1.742 3.921a6.52 6.52 0 001.558-1.748A10.54 10.54 0 0010 14.5c1.376 0 2.69-.248 3.662-.827a6.52 6.52 0 001.558 1.748A7.462 7.462 0 0110 17.5a7.462 7.462 0 01-5.22-2.079zM16.34 14.2a8.02 8.02 0 00-1.228-1.608A9.05 9.05 0 0017.542 10a7.544 7.544 0 01-.632 2.7.756.756 0 01-.57 1.5zm.581-5.7a9.05 9.05 0 00-1.86-1.092A8.02 8.02 0 0016.33 5.8a7.545 7.545 0 01.632 2.7h-.041z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">{t(lang, "porscheCountries")}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{t(lang, "storesWorldwide")}</p>
              </div>
              <ChevronIcon open={activeSection === "countries"} />
            </button>

            {activeSection === "countries" && (
              <div className="flex flex-col gap-1 px-6 pb-4">
                {PORSCHE_COUNTRIES.map((country) => (
                  <a key={country.name} href={country.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800">
                    <span className="text-lg">{country.flag}</span>
                    <span className="flex-1 text-sm text-neutral-800 dark:text-neutral-200">{country.name}</span>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-neutral-400">
                      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
                    </svg>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
