"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-2xl font-bold">Application error</h1>
            <p className="text-sm text-gray-500">
              {error?.message || "A critical error occurred."}
            </p>
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded bg-black text-white"
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
