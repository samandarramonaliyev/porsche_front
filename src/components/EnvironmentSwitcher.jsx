import { useCarStore } from "../store/useCarStore.js";

export default function EnvironmentSwitcher() {
  const { config, options, setConfigValue } = useCarStore();

  return (
    <div className="flex items-center gap-2">
      {options.environments.map((env) => (
        <button
          key={env}
          type="button"
          onClick={() => setConfigValue("environment", env)}
          className={`rounded-full px-4 py-2 text-xs uppercase tracking-wide ${
            config.environment === env
              ? "bg-white text-black"
              : "bg-white/10 text-white hover:bg-white/20"
          }`}
        >
          {env}
        </button>
      ))}
    </div>
  );
}
