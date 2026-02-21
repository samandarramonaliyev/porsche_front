import { motion } from "framer-motion";
import { useCarStore } from "../store/useCarStore.js";
import { useSettingsStore } from "../store/useSettingsStore.js";
import { t } from "../utils/translations.js";
import { getLineItems } from "../utils/pricing.js";

const fmt = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function ConfigSummary() {
  const { config, price } = useCarStore();
  const { lang } = useSettingsStore();
  const items = getLineItems(config);

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-[24px] bg-white p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] dark:bg-neutral-900 dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
        {t(lang, "yourConfig")}
      </h2>

      <div className="mt-6 flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800">
        {items.map((item, i) => (
          <div
            key={item.label}
            className="flex items-center justify-between py-3 text-sm"
          >
            <span className={i === 0 ? "font-semibold text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300"}>
              {item.label}
            </span>
            <span
              className={
                i === 0
                  ? "font-semibold text-neutral-900 dark:text-white"
                  : item.value === 0
                    ? "text-neutral-400"
                    : "text-neutral-700 dark:text-neutral-300"
              }
            >
              {i === 0 ? fmt(item.value) : item.value === 0 ? t(lang, "included") : `+ ${fmt(item.value)}`}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t-2 border-neutral-900 pt-4 dark:border-white">
        <span className="text-base font-semibold text-neutral-900 dark:text-white">{t(lang, "total")}</span>
        <motion.span
          key={price}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-xl font-bold text-neutral-900 dark:text-white"
        >
          {fmt(price)}
        </motion.span>
      </div>
    </motion.section>
  );
}
