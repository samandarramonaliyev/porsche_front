export default function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">
          Loading
        </p>
      </div>
    </div>
  );
}
