import { create } from "zustand";
import { calculatePrice, PRICING } from "../utils/pricing.js";

const defaultConfig = {
  model: "718 Cayman GT4 RS",
  bodyColor: "Guards Red",
  wheelColor: "Satin Black",
  rimType: "Classic 5-Spoke",
  interiorWallColor: "Graphite Black",
  seatShellColor: "Black Leather",
  seatInsertColor: "Perforated Black",
  wheelStyle: "",
  interiorColor: "",
  seatStyle: "",
  environment: "city",
  autoRotate: true,
};

export const useCarStore = create((set, get) => ({
  config: { ...defaultConfig },
  price: calculatePrice(defaultConfig),
  galleryView: "color",
  options: {
    bodyColorsByModel: {
      "718 Cayman GT4 RS": [
        "Carrara White",
        "Guards Red",
        "Racing Yellow",
        "Jet Black",
      ],
      "911 Carrera S": ["Black", "Red", "Green"],
    },
    wheelStylesByModel: {
      "911 Carrera S": [
        "20-21-inch Carrera classic wheels",
        "20-21-inch Carrera S wheels",
      ],
    },
    interiorColorsByModel: {
      "911 Carrera S": ["black", "bordo", "Dark Night BlueCrayon"],
      "718 Cayman GT4 RS": [
        "Leather Arctic Grey",
        "Leather Deep Sea Blue",
      ],
    },
    seatStylesByModel: {
      "718 Cayman GT4 RS": [
        "Adaptive Sports seats Plus (18-way, electric)",
        "Full bucket seats",
      ],
    },
    wheelColors: Object.keys(PRICING.wheelColors),
    rimTypes: Object.keys(PRICING.rimTypes),
    interiorWalls: Object.keys(PRICING.interiorWalls),
    seatShells: Object.keys(PRICING.seatShells),
    seatInserts: Object.keys(PRICING.seatInserts),
    environments: ["city", "studio"],
  },
  interiorBounds: null,
  selectedImage: null,
  cameraPreset: "default",
  cameraResetKey: 0,
  setConfigValue: (key, value) =>
    set((state) => {
      const nextConfig = { ...state.config, [key]: value };
      let nextView = state.galleryView;
      if (key === "bodyColor") nextView = "color";
      else if (key === "wheelStyle") nextView = "wheels";
      else if (key === "interiorColor") nextView = "interior";
      else if (key === "seatStyle") nextView = "seats";
      return {
        config: nextConfig,
        price: calculatePrice(nextConfig),
        galleryView: nextView,
      };
    }),
  setConfig: (config) =>
    set(() => ({
      config,
      price: calculatePrice(config),
      galleryView: "color",
    })),
  setModel: (model) =>
    set((state) => {
      const colors = state.options.bodyColorsByModel[model] || [];
      const nextColor = colors[0] || state.config.bodyColor;
      const wheels = state.options.wheelStylesByModel?.[model] || [];
      const interiors = state.options.interiorColorsByModel?.[model] || [];
      const seats = state.options.seatStylesByModel?.[model] || [];
      const nextConfig = {
        ...state.config,
        model,
        bodyColor: nextColor,
        wheelStyle: wheels[0] || "",
        interiorColor: interiors[0] || "",
        seatStyle: seats[0] || "",
      };
      return {
        config: nextConfig,
        price: calculatePrice(nextConfig),
        galleryView: "color",
      };
    }),
  toggleAutoRotate: () =>
    set((state) => ({
      config: { ...state.config, autoRotate: !state.config.autoRotate },
    })),
  setCameraPreset: (preset) =>
    set((state) => ({
      cameraPreset: preset,
      config:
        preset.startsWith("interior")
          ? { ...state.config, autoRotate: false }
          : state.config,
    })),
  setInteriorBounds: (bounds) => set(() => ({ interiorBounds: bounds })),
  setSelectedImage: (image) => set(() => ({ selectedImage: image })),
  resetCamera: () =>
    set((state) => ({
      cameraPreset: "default",
      cameraResetKey: state.cameraResetKey + 1,
    })),
  resetConfig: () =>
    set(() => ({
      config: { ...defaultConfig },
      price: calculatePrice(defaultConfig),
      galleryView: "color",
      cameraResetKey: get().cameraResetKey + 1,
    })),
}));
