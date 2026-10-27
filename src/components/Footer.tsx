export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-ink-500 sm:flex-row">
        <div className="flex items-center gap-2 font-semibold text-ink-700">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-fairway-600 text-white text-xs">A</span>
          AI Golf Coach
        </div>
        <p>
          {process.env.NEXT_PUBLIC_DEMO_MODE !== "false"
            ? "Demo build — simulated analysis, payments, and storage unless configured."
            : "AI Golf Coach — live coaching platform."}
        </p>
      </div>
    </footer>
  );
}
