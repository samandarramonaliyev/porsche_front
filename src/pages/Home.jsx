import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useCarStore } from "../store/useCarStore.js";
import { useSettingsStore } from "../store/useSettingsStore.js";
import ProfileDrawer from "../components/ProfileDrawer.jsx";
import HeaderControls from "../components/HeaderControls.jsx";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase.js";
import { t } from "../utils/translations.js";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Porsche 718 Cayman GT4 RS Configurator",
  description:
    "Configure the Porsche 718 Cayman GT4 RS with curated gallery and realtime pricing.",
  brand: {
    "@type": "Brand",
    name: "Porsche",
  },
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
};

export default function Home() {
  const { setModel } = useCarStore();
  const { lang } = useSettingsStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [loadBuildOpen, setLoadBuildOpen] = useState(false);
  const [porscheCode, setPorscheCode] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [user, setUser] = useState(null);
  const [loadedCar, setLoadedCar] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

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

  const parsePorscheCode = (code) => {
    // Mock parsing - in real app this would decode the actual Porsche code
    const carConfigs = {
      'CAYMANRS': {
        model: '718 Cayman GT4 RS',
        color: 'Guards Red',
        image: '/gallery/718%20Cayman%20GT4%20RS/red/iris%20(18).webp'
      },
      'CARRERAS': {
        model: '911 Carrera S',
        color: 'Red',
        image: '/gallery/911%20Carrera%20S/color/red/red1.jpg'
      }
    };
    
    return carConfigs[code] || null;
  };

  const handleOrderSubmit = () => {
    if (!porscheCode.trim()) {
      return;
    }
    
    const carConfig = parsePorscheCode(porscheCode);
    if (carConfig) {
      setLoadedCar(carConfig);
    } else {
      // Show error for invalid code
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    setPorscheCode(value);
  };

  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    setLoginError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Google login error:", err);
      setLoginError(err.code || err.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };
  return (
    <>
      <Helmet>
        <title>Porsche 718 Cayman GT4 RS Configurator</title>
        <meta
          name="description"
          content="Configure the Porsche 718 Cayman GT4 RS with gallery views and realtime pricing."
        />
        <meta property="og:title" content="Porsche 718 Cayman GT4 RS Configurator" />
        <meta
          property="og:description"
          content="Craft your 718 Cayman GT4 RS with gallery views and instant price updates."
        />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <main className="flex min-h-screen flex-col bg-neutral-100 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-12 lg:px-20">
            <div className="text-xs uppercase tracking-[0.4em] text-neutral-500 dark:text-neutral-400">
              Porsche
            </div>
            <div className="flex items-center gap-3">
              <HeaderControls />
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-neutral-500"
                aria-label="Profile"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M4 20c1.8-3.5 5-5 8-5s6.2 1.5 8 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <section className="px-6 py-12 md:px-12 lg:px-20">
          <div className="mx-auto flex max-w-6xl flex-col gap-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-semibold">{t(lang, "selectModel")}</h1>
              <button
                type="button"
                onClick={() => setLoadBuildOpen(true)}
                className="rounded-full bg-neutral-900 px-4 py-2 text-xs uppercase tracking-wide text-white hover:bg-neutral-800"
              >
                {t(lang, "loadConfig")}
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Link
                to="/configurator/718-cayman-gt4-rs"
                onClick={() => setModel("718 Cayman GT4 RS")}
                className="group relative overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                <img
                  src="/gallery/718%20Cayman%20GT4%20RS/red/iris%20(18).webp"
                  alt="718 Cayman GT4 RS"
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:blur-sm"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute left-5 top-5 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-900">
                  718 Cayman GT4 RS
                </div>
                <div className="relative z-10 flex h-full flex-col justify-end p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="inline-flex w-max rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-700 self-end">
                    {t(lang, "petrol")}
                  </div>
                  <div className="mt-4 text-sm text-white/90">
                    {t(lang, "desc718")}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-white/80">
                    <div>
                      <div className="font-semibold text-white">{t(lang, "coupe")}</div>
                      <div>{t(lang, "bodyType")}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">2</div>
                      <div>{t(lang, "seats")}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{t(lang, "automatic")}</div>
                      <div>{t(lang, "transmission")}</div>
                    </div>
                  </div>
                <span className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-xs uppercase tracking-wide text-white">
                  {t(lang, "configure718")}
                </span>
                </div>
              </Link>

              <Link
                to="/configurator/911-carrera-s"
                onClick={() => setModel("911 Carrera S")}
                className="group relative overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                <img
                  src="/gallery/911%20Carrera%20S/color/red/red1.jpg"
                  alt="911 Carrera S"
                  className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:blur-sm"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="absolute left-5 top-5 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-900">
                  911 Carrera S
                </div>
                <div className="relative z-10 flex h-full flex-col justify-end p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="inline-flex w-max rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-neutral-700 self-end">
                    {t(lang, "petrol")}
                  </div>
                  <div className="mt-4 text-sm text-white/90">
                    {t(lang, "desc911")}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-white/80">
                    <div>
                      <div className="font-semibold text-white">{t(lang, "coupe")}</div>
                      <div>{t(lang, "bodyType")}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">4</div>
                      <div>{t(lang, "seats")}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-white">{t(lang, "automatic")}</div>
                      <div>{t(lang, "transmission")}</div>
                    </div>
                  </div>
                  <span className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-xs uppercase tracking-wide text-white">
                    {t(lang, "configure911")}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white px-6 py-10 text-sm text-neutral-500 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p>{t(lang, "copyright")}</p>
          <div className="flex gap-6">
            <a href="#configurator" className="hover:text-neutral-700">
              {t(lang, "configurator")}
            </a>
          </div>
        </div>
      </footer>
      
      {/* Load Saved Build Modal */}
      {loadBuildOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60" 
            onClick={() => setLoadBuildOpen(false)}
          />
          <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setLoadBuildOpen(false)}
              className="absolute top-6 right-6 rounded-full p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
                <path stroke="currentColor" strokeWidth="2" d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            
            <div className="p-8 space-y-8">
              {/* Porsche ID Login Section */}
              {!user && (
                <div className="border-b border-neutral-200 pb-8">
                  <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
                    {t(lang, "modalTitle")}
                  </h2>
                  <p className="text-neutral-600 mb-6 max-w-lg">
                    {t(lang, "codeDesc")}
                  </p>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loginLoading}
                    className="flex items-center justify-center gap-3 bg-neutral-900 text-white px-8 py-3 rounded-md font-medium hover:bg-neutral-800 transition-colors disabled:opacity-60"
                  >
                    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    {loginLoading ? t(lang, "signingIn") : t(lang, "signInGoogle")}
                  </button>
                  {loginError && (
                    <p className="mt-2 text-sm text-red-500">{loginError}</p>
                  )}
                </div>
              )}
              
              {/* Porsche Code Section */}
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900 mb-3">
                  {t(lang, "enterCode")}
                </h2>
                <p className="text-neutral-600 mb-6 max-w-lg">
                  {t(lang, "codeDesc")}
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Insert Porsche Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={porscheCode}
                        onChange={handleCodeChange}
                        placeholder="Enter 8-digit code"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent uppercase font-mono text-lg"
                        maxLength={8}
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-neutral-500">
                        {porscheCode.length}/8
                      </span>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleOrderSubmit}
                    disabled={porscheCode.length !== 8}
                    className="bg-neutral-900 text-white px-8 py-3 rounded-md font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t(lang, "order")}
                  </button>
                </div>
                
                {/* Display loaded car image */}
                {loadedCar && (
                  <div className="mt-8 p-6 bg-neutral-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                      Loaded Configuration
                    </h3>
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={loadedCar.image}
                        alt={loadedCar.model}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded-md">
                        <p className="font-semibold text-neutral-900">{loadedCar.model}</p>
                        <p className="text-sm text-neutral-600">{t(lang, "color")}: {loadedCar.color}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setModel(loadedCar.model);
                        setLoadBuildOpen(false);
                        setLoadedCar(null);
                        setPorscheCode("");
                        setShowNotification(true);
                        setTimeout(() => setShowNotification(false), 3000);
                      }}
                      className="mt-4 w-full bg-neutral-900 text-white py-3 px-6 rounded-md font-medium hover:bg-neutral-800 transition-colors"
                    >
                      {t(lang, "configureYour")} {loadedCar.model}
                    </button>
                  </div>
                )}
                
                <p className="text-sm text-neutral-500 mt-6">
                  {t(lang, "codeInvalidMsg")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Notification */}
      {showNotification && (
        <div className="fixed top-8 right-8 z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 transform transition-all duration-300 ease-out">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
              <path stroke="currentColor" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{t(lang, "orderSuccess")}</span>
          </div>
        </div>
      )}
      
      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
