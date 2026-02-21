import { Suspense, lazy, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Loader from "../components/Loader.jsx";
import { useCarStore } from "../store/useCarStore.js";
import { useSettingsStore } from "../store/useSettingsStore.js";
import { t } from "../utils/translations.js";
import ProfileDrawer from "../components/ProfileDrawer.jsx";
import HeaderControls from "../components/HeaderControls.jsx";

const ImageGallery = lazy(() => import("../components/ImageGallery.jsx"));
const ConfiguratorPanel = lazy(() => import("../components/ConfiguratorPanel.jsx"));
const ConfigSummary = lazy(() => import("../components/ConfigSummary.jsx"));

const MODEL_MAP = {
  "718-cayman-gt4-rs": "718 Cayman GT4 RS",
  "911-carrera-s": "911 Carrera S",
};

export default function Configurator() {
  const { model } = useParams();
  const { setModel, config } = useCarStore();
  const { lang } = useSettingsStore();
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const resolved = MODEL_MAP[model] || "718 Cayman GT4 RS";
    if (config.model !== resolved) {
      setModel(resolved);
    }
  }, [model, setModel]);

  return (
    <>
      <Helmet>
        <title>{`${config.model} ${t(lang, "configLabel")}`}</title>
        <meta name="description" content={`${t(lang, "configureYour")} ${config.model}`} />
      </Helmet>

      <main className="min-h-screen bg-[#f5f5f5] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:px-12 lg:px-20">
            <Link to="/" className="text-xs uppercase tracking-[0.4em] text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
              Porsche
            </Link>
            <div className="flex items-center gap-2">
              <HeaderControls />
              <button
                type="button"
                onClick={() => setProfileOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 text-neutral-600 transition-colors hover:border-neutral-400 dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-neutral-500"
                aria-label="Profile"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4 20c1.8-3.5 5-5 8-5s6.2 1.5 8 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-16 md:px-12 lg:px-20">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
              {t(lang, "threeDConfig")}
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{`${t(lang, "configureYour")} ${config.model}`}</h1>
          </div>
          <div className="grid items-start gap-10 lg:grid-cols-[1.8fr_1fr]">
            <div className="rounded-[24px] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:bg-neutral-900 dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <Suspense fallback={<Loader />}>
                <ImageGallery />
              </Suspense>
            </div>
            <div className="flex justify-center lg:sticky lg:top-24 lg:h-fit">
              <Suspense fallback={<Loader />}>
                <ConfiguratorPanel />
              </Suspense>
            </div>
          </div>
          <Suspense fallback={<Loader />}>
            <ConfigSummary />
          </Suspense>
        </div>
      </main>
      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
