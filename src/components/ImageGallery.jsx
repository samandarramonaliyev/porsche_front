import { useEffect, useMemo, useRef, useState } from "react";
import { useCarStore } from "../store/useCarStore.js";

const MODEL_CONFIG = {
  "718 Cayman GT4 RS": {
    basePath: "/gallery/718 Cayman GT4 RS",
    colorFolders: {
      "Racing Yellow": "yellow",
      "Guards Red": "red",
      "Carrara White": "white",
      "Jet Black": "black",
    },
    ranges: {
      white: [1, 50],
      red: [1, 50],
      yellow: [1, 50],
      black: [1, 50],
    },
    format: "iris",
    extensions: ["webp"],
    intriorSuffixes: {
      "Leather Arctic Grey": "- leather and Race-Tex, black-arctic grey",
      "Leather Deep Sea Blue": "-leather and Race-Tex, black-deep sea blue",
    },
    viewRanges: { interior: [1, 50], seats: [1, 50] },
  },
  "911 Carrera S": {
    basePath: "/gallery/911 Carrera S",
    colorFolders: {
      Black: "black",
      Red: "red",
      Green: "green",
    },
    filePrefixes: {
      black: "black",
      red: "red",
      green: "grenn",
    },
    ranges: { black: [1, 10], red: [1, 10], green: [1, 10] },
    format: "numbered",
    extensions: ["jpg"],
  },
};

const VIEW_INDICES = { color: 0, wheels: 1, interior: 7, seats: 7 };

function buildImageDir(modelConfig, colorFolder, galleryView, config) {
  const base = modelConfig.basePath;

  if (config.model === "911 Carrera S") {
    if (galleryView === "interior" && config.interiorColor && config.wheelStyle) {
      return `${base}/interior/${colorFolder}/${config.interiorColor}-${config.wheelStyle}`;
    }
    if (galleryView === "wheels" && config.wheelStyle) {
      return `${base}/${colorFolder}-wheels/${config.wheelStyle}`;
    }
    return `${base}/color/${colorFolder}`;
  }

  if (config.model === "718 Cayman GT4 RS") {
    if (galleryView === "interior" && config.interiorColor) {
      const suffix = modelConfig.intriorSuffixes?.[config.interiorColor] || "";
      return `${base}/intrior/${colorFolder}${suffix}`;
    }
    if (galleryView === "seats" && config.seatStyle) {
      return `${base}/seats/${colorFolder}-${config.seatStyle}`;
    }
  }

  return `${base}/${colorFolder}`;
}

function getRange(modelConfig, colorFolder, galleryView) {
  if (galleryView !== "color" && modelConfig.viewRanges?.[galleryView]) {
    return modelConfig.viewRanges[galleryView];
  }
  return modelConfig.ranges?.[colorFolder] || [1, 10];
}

export default function ImageGallery() {
  const { config, setSelectedImage, selectedImage, galleryView } = useCarStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);
  const activeIndexRef = useRef(0);

  const updateIndex = (images, fallbackIndex) => {
    const idx = Math.min(fallbackIndex, images.length - 1);
    const clamped = Math.max(0, idx);
    setActiveIndex(clamped);
    activeIndexRef.current = clamped;
    setSelectedImage(images[clamped] || null);
  };

  const modelConfig =
    MODEL_CONFIG[config.model] || MODEL_CONFIG["718 Cayman GT4 RS"];
  const normalizeKey = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[-_]/g, "");
  const folderCandidates = useMemo(() => {
    const colorMap = modelConfig.colorFolders || {};
    const direct = colorMap[config.bodyColor];
    const target = normalizeKey(config.bodyColor);
    const matchedKey = Object.keys(colorMap).find(
      (key) => normalizeKey(key) === target
    );
    const resolved = direct || colorMap[matchedKey] || "red";
    return [resolved];
  }, [config.bodyColor, modelConfig]);
  const cacheRef = useRef(new Map());

  const isMultiView = galleryView !== "color";

  const cacheKey = useMemo(() => {
    if (isMultiView) {
      return `${config.model}|${folderCandidates[0]}|${galleryView}|${config.wheelStyle || ""}|${config.interiorColor || ""}|${config.seatStyle || ""}`;
    }
    return `${config.model}|${folderCandidates[0] || "red"}`;
  }, [config.model, folderCandidates, galleryView, config.wheelStyle, config.interiorColor, config.seatStyle, isMultiView]);

  useEffect(() => {
    let mounted = true;
    const jumpIndex = isMultiView
      ? (VIEW_INDICES[galleryView] ?? 0)
      : activeIndexRef.current;

    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      setGalleryImages(cached);
      updateIndex(cached, jumpIndex);
      return () => {
        mounted = false;
      };
    }
    const colorFolder = folderCandidates[0] || "red";
    const [start, end] = getRange(modelConfig, colorFolder, galleryView);
    setGalleryImages([]);

    const buildCandidates = (folder) => {
      const list = [];
      const dir = buildImageDir(modelConfig, folder, galleryView, config);

      for (let i = start; i <= end; i += 1) {
        modelConfig.extensions.forEach((ext) => {
          if (modelConfig.format === "iris") {
            list.push(`${dir}/iris (${i}).${ext}`);
            return;
          }
          const prefix = modelConfig.filePrefixes?.[folder] || folder;
          list.push(`${dir}/${prefix}${i}.${ext}`);
        });
      }

      if (galleryView === "seats") {
        list.push(`${dir}/${folder}.jpg`);
        list.push(`${dir}/${folder}2.jpg`);
        list.push(`${dir}/y${folder}.jpg`);
        list.push(`${dir}/y${folder}-.jpg`);
      }

      return list;
    };

    const loadImages = async () => {
      let available = [];
      for (const folder of folderCandidates) {
        const primaryCandidates = buildCandidates(folder);
        const checks = primaryCandidates.map(
          (src) =>
            new Promise((resolve) => {
              const img = new Image();
              img.onload = () => resolve(src);
              img.onerror = () => resolve(null);
              img.src = encodeURI(src);
            })
        );
        const results = await Promise.all(checks);
        available = results.filter(Boolean);
        if (available.length) break;
      }
      if (mounted) {
        const unique = Array.from(new Set(available)).slice(0, 10);
        setGalleryImages(unique);
        updateIndex(unique, jumpIndex);
        cacheRef.current.set(cacheKey, unique);
      }
    };

    loadImages();
    return () => {
      mounted = false;
    };
  }, [folderCandidates, modelConfig, setSelectedImage, config.model, config.wheelStyle, config.interiorColor, config.seatStyle, galleryView, cacheKey, isMultiView]);

  useEffect(() => {
    if (!selectedImage || !galleryImages.length) return;
    const index = galleryImages.findIndex((img) => img === selectedImage);
    if (index >= 0) {
      setActiveIndex(index);
      activeIndexRef.current = index;
    }
  }, [selectedImage, galleryImages]);

  useEffect(() => {
    if (!galleryImages.length) return;
    setSelectedImage(galleryImages[activeIndex]);
    activeIndexRef.current = activeIndex;
  }, [activeIndex, galleryImages, setSelectedImage]);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex w-full justify-center">
        <div className="relative inline-block overflow-hidden rounded-[24px] bg-black/5 p-4 dark:bg-white/5">
        {galleryImages.length ? (
          <img
            src={encodeURI(galleryImages[activeIndex])}
            alt="Porsche gallery view"
            className="h-[320px] w-full max-w-[820px] rounded-[20px] object-cover"
          />
        ) : (
          <div className="flex h-[320px] w-full max-w-[820px] items-center justify-center px-8 text-sm text-neutral-400">
            No images found for this color.
          </div>
        )}
        </div>
      </div>

      <div className="flex w-full justify-center">
        <div className="flex gap-4 overflow-x-auto pb-1">
        {galleryImages.slice(0, -2).map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-[16px] border ${
              activeIndex === index
                ? "border-neutral-900 dark:border-white"
                : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
            }`}
          >
            <img
              src={encodeURI(src)}
              alt="Porsche thumbnail"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
        </div>
      </div>

      <div className="flex w-full justify-center">
        <div className="flex gap-4 overflow-x-auto pb-1">
          {galleryImages.slice(-2).map((src, index) => {
            const actualIndex = galleryImages.length - 2 + index;
            return (
              <button
                key={src}
                type="button"
                onClick={() => setActiveIndex(actualIndex)}
                className={`relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-[16px] border ${
                  activeIndex === actualIndex
                    ? "border-neutral-900 dark:border-white"
                    : "border-neutral-200 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500"
                }`}
              >
                <img
                  src={encodeURI(src)}
                  alt="Porsche thumbnail"
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
