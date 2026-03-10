"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateLobbyPage() {
  const [hostName, setHostName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!hostName.trim()) {
      setError("Please enter your name");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lobby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: hostName.trim() }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error?.hostName?.[0] || data.error || "Failed to create lobby",
        );
      if (typeof window !== "undefined") {
        sessionStorage.setItem("lobbyDisplayName", hostName.trim());
      }
      router.push(`/lobby/${data.lobbyId}`);
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
          Create Lobby
        </h1>
        <p className="mt-2 text-outback-600">
          Create a new game lobby and invite friends to join.
        </p>
        <form onSubmit={handleCreate} className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="hostName"
              className="block text-sm font-medium text-outback-700"
            >
              Your name
            </label>
            <input
              id="hostName"
              type="text"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-outback-300 px-4 py-3 focus:border-ochre-500 focus:outline-none focus:ring-1 focus:ring-ochre-500"
              placeholder="Host"
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
              {loading ? "Creating…" : "Create Lobby"}
            </button>
            <Link
              href="/lobby"
              className="rounded-xl border border-outback-300 px-6 py-3 font-semibold text-outback-700 transition hover:bg-outback-50"
            >
              Cancel
            </Link>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-outback-500">
          <Link href="/lobby/join" className="text-ochre-600 hover:underline">
            Join an existing lobby instead
          </Link>
        </p>
      </div>
    </main>
  );
}
