import { Html } from "@react-three/drei";

export default function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-4 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p className="text-xs uppercase tracking-[0.3em] text-white/70">
          Loading
        </p>
      </div>
    </Html>
  );
}
