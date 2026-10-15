"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white shadow-md rounded-lg">
          <h1 className="text-3xl font-bold text-red-600 mb-4">
            🚨 Something went wrong
          </h1>

          <p className="text-gray-600 mb-6">Please refresh or try again.</p>

          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
          >
            Reload Page
          </button>
        </div>
      </body>
    </html>
  );
}
