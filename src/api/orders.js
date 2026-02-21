const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function submitOrder({ config, price }) {
  const response = await fetch(`${API_BASE}/api/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bodyColor: config.bodyColor,
      wheelColor: config.wheelColor,
      rims: config.rimType,
      interiorWallColor: config.interiorWallColor,
      seatShellColor: config.seatShellColor,
      seatInsertColor: config.seatInsertColor,
      environment: config.environment,
      price,
    }),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.message || "Failed to submit order.");
  }

  return response.json();
}
