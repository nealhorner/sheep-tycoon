"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PlayNewPage() {
  const [displayName, setDisplayName] = useState("Player");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: displayName || "Player" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create game");
      router.push(`/game/${data.gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-outback-50 to-outback-100 px-6 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl font-bold text-outback-900">
          Play vs Computer
        </h1>
        <p className="mt-2 text-outback-600">
          Enter your name and start a solo game against the AI.
        </p>
        <form onSubmit={handleCreate} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-outback-700"
            >
              Your name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-outback-300 px-4 py-3 focus:border-ochre-500 focus:outline-none focus:ring-1 focus:ring-ochre-500"
              placeholder="Player"
              maxLength={50}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-ochre-500 px-6 py-3 font-semibold text-white transition hover:bg-ochre-600 disabled:opacity-50"
            >
              {loading ? "Starting…" : "Start Game"}
            </button>
            <Link
              href="/"
              className="rounded-xl border border-outback-300 px-6 py-3 font-semibold text-outback-700 transition hover:bg-outback-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
