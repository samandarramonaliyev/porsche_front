import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCarStore } from "../store/useCarStore.js";
import { useSettingsStore } from "../store/useSettingsStore.js";
import { t } from "../utils/translations.js";

const sectionClasses = "flex flex-col gap-4 border-b border-neutral-200 dark:border-neutral-700 pb-6";

const HISTORY_KEY = "porsche_history";
const CODES_KEY = "porsche_codes";

function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function ConfiguratorPanel() {
  const { config, options, setConfigValue, selectedImage } = useCarStore();
  const { lang } = useSettingsStore();
  const [saved, setSaved] = useState(false);
  const [codeModal, setCodeModal] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const bodyColors =
    options.bodyColorsByModel?.[config.model] ||
    options.bodyColorsByModel?.["718 Cayman GT4 RS"] ||
    [];
  const wheelStyles = options.wheelStylesByModel?.[config.model] || [];
  const interiorColors = options.interiorColorsByModel?.[config.model] || [];
  const seatStyles = options.seatStylesByModel?.[config.model] || [];

  const handleSave = () => {
    if (!selectedImage) return;
    const history = (() => {
      try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
      catch { return []; }
    })();
    const entry = {
      id: crypto.randomUUID(),
      model: config.model,
      config: { ...config },
      image: selectedImage,
      createdAt: new Date().toISOString(),
    };
    const nextHistory = [entry, ...history].slice(0, 30);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCreateCode = () => {
    if (!selectedImage) return;
    const code = generateCode();
    const codes = (() => {
      try { return JSON.parse(localStorage.getItem(CODES_KEY)) || {}; }
      catch { return {}; }
    })();
    codes[code] = {
      config: { ...config },
      image: selectedImage,
      model: config.model,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(CODES_KEY, JSON.stringify(codes));
    setCodeModal({ code });
    setCopiedCode(false);
    setCopiedLink(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeModal.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://porsche-code.com/${codeModal.code}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const activeBtn = "border border-neutral-900 bg-white text-neutral-900 dark:border-white dark:bg-transparent dark:text-white";
  const inactiveBtn = "border border-neutral-200 text-neutral-700 hover:border-neutral-400 dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-neutral-500";

  return (
    <>
    <motion.aside
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="relative flex w-full max-w-md flex-col gap-8 rounded-[24px] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:bg-neutral-900 dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
    >
      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute -top-16 left-0 right-0 mx-auto flex w-fit items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-xs text-white shadow-lg dark:bg-white dark:text-neutral-900"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-400 dark:text-emerald-600">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {t(lang, "configSaved")}
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
          {t(lang, "configLabel")}
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-neutral-900 dark:text-white">
          {config.model}
        </h2>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {t(lang, "configDesc")}
        </p>
      </div>

      <div className={sectionClasses}>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
          {t(lang, "bodyColor")}
        </h3>
        <div className="flex flex-wrap gap-3">
          {bodyColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setConfigValue("bodyColor", color)}
              className={`rounded-full px-4 py-2 text-xs ${config.bodyColor === color ? activeBtn : inactiveBtn}`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {wheelStyles.length ? (
        <div className={sectionClasses}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            {t(lang, "wheels")}
          </h3>
          <div className="flex flex-wrap gap-3">
            {wheelStyles.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setConfigValue("wheelStyle", style)}
                className={`rounded-full px-4 py-2 text-xs ${config.wheelStyle === style ? activeBtn : inactiveBtn}`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {interiorColors.length ? (
        <div className={sectionClasses}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            {t(lang, "interiorColour")}
          </h3>
          <div className="flex flex-wrap gap-3">
            {interiorColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setConfigValue("interiorColor", color)}
                className={`rounded-full px-4 py-2 text-xs ${config.interiorColor === color ? activeBtn : inactiveBtn}`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {seatStyles.length ? (
        <div className={sectionClasses}>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
            {t(lang, "seatsLabel")}
          </h3>
          <div className="flex flex-wrap gap-3">
            {seatStyles.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setConfigValue("seatStyle", style)}
                className={`rounded-full px-4 py-2 text-xs ${config.seatStyle === style ? activeBtn : inactiveBtn}`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex gap-3">
        <motion.button
          type="button"
          onClick={handleSave}
          whileTap={{ scale: 0.96 }}
          animate={saved ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 0.3 }}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-3 text-xs uppercase tracking-wide transition-colors duration-300 ${
            saved
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-neutral-900"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {saved ? t(lang, "saved") : t(lang, "save")}
        </motion.button>
        <motion.button
          type="button"
          onClick={handleCreateCode}
          whileTap={{ scale: 0.96 }}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-neutral-900 px-4 py-3 text-xs uppercase tracking-wide text-neutral-900 transition-colors hover:bg-neutral-900 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-neutral-900"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
            <path d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3v11.25" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t(lang, "createCode")}
        </motion.button>
      </div>
    </motion.aside>

    <AnimatePresence>
      {codeModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50" role="button" tabIndex={0} onClick={() => setCodeModal(null)} onKeyDown={(e) => e.key === "Escape" && setCodeModal(null)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-800"
          >
            <button type="button" onClick={() => setCodeModal(null)} className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-neutral-600 hover:bg-white dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>

            <div className="bg-neutral-700">
              <img src={encodeURI(selectedImage)} alt={config.model} className="h-52 w-full object-cover" />
            </div>

            <div className="flex flex-col gap-5 p-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{t(lang, "codeTitle")}</h3>
                <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{t(lang, "codeModalDesc")}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  {codeModal.code.split("").map((char, i) => (
                    <div key={i} className="flex h-10 w-9 items-center justify-center rounded border border-neutral-300 text-sm font-bold text-neutral-900 dark:border-neutral-600 dark:text-white">
                      {char}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={handleCopyCode} className="ml-auto flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                    <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                  </svg>
                  {copiedCode ? t(lang, "copied") : t(lang, "copyCode")}
                </button>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-600 dark:bg-neutral-700/50">
                <span className="flex-1 truncate text-xs text-neutral-700 dark:text-neutral-300">
                  https://porsche-code.com/<strong>{codeModal.code}</strong>
                </span>
                <button type="button" onClick={handleCopyLink} className="flex shrink-0 items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                    <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                  </svg>
                  {copiedLink ? t(lang, "copied") : t(lang, "copyLink")}
                </button>
              </div>

              <p className="text-[10px] leading-relaxed text-neutral-400">{t(lang, "codeSaveNote")}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
