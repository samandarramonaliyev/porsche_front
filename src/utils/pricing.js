export const PRICING = {
  baseByModel: {
    "718 Cayman GT4 RS": 143400,
    "911 Carrera S": 120900,
  },
  bodyColors: {
    "Racing Yellow": 3500,
    "Guards Red": 2800,
    "Carrara White": 0,
    "Jet Black": 2200,
    "Black": 0,
    "Red": 2800,
    "Green": 3200,
  },
  wheelStyles: {
    "20-21-inch Carrera classic wheels": 0,
    "20-21-inch Carrera S wheels": 3400,
  },
  interiorColors: {
    "black": 0,
    "bordo": 2600,
    "Dark Night BlueCrayon": 3100,
    "Leather Arctic Grey": 0,
    "Leather Deep Sea Blue": 1800,
  },
  seatStyles: {
    "Adaptive Sports seats Plus (18-way, electric)": 4200,
    "Full bucket seats": 0,
  },
  wheelColors: {
    "Satin Black": 0,
    "Dark Titanium": 1200,
    "Platinum": 1500,
  },
  rimTypes: {
    "Classic 5-Spoke": 0,
    "Turbo Aero": 4200,
    "RS Spyder": 5200,
  },
  interiorWalls: {
    "Graphite Black": 0,
    "Crayon Grey": 1800,
    "Bordeaux Red": 2200,
  },
  seatShells: {
    "Black Leather": 0,
    "Bordeaux Red": 1800,
    "Two-Tone Beige": 1600,
  },
  seatInserts: {
    "Perforated Black": 0,
    "Carbon Weave": 1400,
    "Alcantara Red": 1600,
  },
};

export function calculatePrice(config) {
  const base = PRICING.baseByModel[config.model] ?? 120000;
  const bodyPremium = PRICING.bodyColors[config.bodyColor] ?? 0;
  const wheelStylePremium = PRICING.wheelStyles[config.wheelStyle] ?? 0;
  const interiorPremium = PRICING.interiorColors[config.interiorColor] ?? 0;
  const seatPremium = PRICING.seatStyles[config.seatStyle] ?? 0;
  const wheelColorPremium = PRICING.wheelColors[config.wheelColor] ?? 0;
  const rimPremium = PRICING.rimTypes[config.rimType] ?? 0;
  const interiorWallPremium = PRICING.interiorWalls[config.interiorWallColor] ?? 0;
  const seatShellPremium = PRICING.seatShells[config.seatShellColor] ?? 0;
  const seatInsertPremium = PRICING.seatInserts[config.seatInsertColor] ?? 0;

  return (
    base +
    bodyPremium +
    wheelStylePremium +
    interiorPremium +
    seatPremium +
    wheelColorPremium +
    rimPremium +
    interiorWallPremium +
    seatShellPremium +
    seatInsertPremium
  );
}

export function getLineItems(config) {
  const base = PRICING.baseByModel[config.model] ?? 120000;
  const items = [{ label: config.model, value: base }];

  if (config.bodyColor) {
    items.push({
      label: `Body Color — ${config.bodyColor}`,
      value: PRICING.bodyColors[config.bodyColor] ?? 0,
    });
  }
  if (config.wheelStyle) {
    items.push({
      label: `Wheels — ${config.wheelStyle}`,
      value: PRICING.wheelStyles[config.wheelStyle] ?? 0,
    });
  }
  if (config.interiorColor) {
    items.push({
      label: `Interior — ${config.interiorColor}`,
      value: PRICING.interiorColors[config.interiorColor] ?? 0,
    });
  }
  if (config.seatStyle) {
    items.push({
      label: `Seats — ${config.seatStyle}`,
      value: PRICING.seatStyles[config.seatStyle] ?? 0,
    });
  }

  return items;
}
