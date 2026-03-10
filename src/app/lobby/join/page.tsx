'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinLobbyPage() {
  const [lobbyId, setLobbyId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!lobbyId.trim()) {
      setError('Please enter the lobby code');
      return;
    }
    if (!displayName.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/lobby/${lobbyId.trim()}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join lobby');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('lobbyDisplayName', displayName.trim());
      }
      router.push(`/lobby/${lobbyId.trim()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-outback-50 to-outback-100 px-6 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-3xl font-bold text-outback-900">Join Lobby</h1>
        <p className="mt-2 text-outback-600">Enter the lobby code and your name to join a game.</p>
        <form onSubmit={handleJoin} className="mt-8 space-y-4">
          <div>
            <label htmlFor="lobbyId" className="block text-sm font-medium text-outback-700">
              Lobby code
            </label>
            <input
              id="lobbyId"
              type="text"
              value={lobbyId}
              onChange={(e) => setLobbyId(e.target.value.toUpperCase())}
              className="mt-1 w-full rounded-lg border border-outback-300 px-4 py-3 font-mono uppercase focus:border-ochre-500 focus:outline-none focus:ring-1 focus:ring-ochre-500"
              placeholder="e.g. ABC12345"
              maxLength={20}
            />
          </div>
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-outback-700">
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
              {loading ? 'Joining…' : 'Join Lobby'}
            </button>
            <Link
              href="/"
              className="rounded-xl border border-outback-300 px-6 py-3 font-semibold text-outback-700 transition hover:bg-outback-50"
            >
              Cancel
            </Link>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-outback-500">
          <Link href="/lobby" className="text-ochre-600 hover:underline">
            Create a new lobby instead
          </Link>
        </p>
      </div>
    </main>
  );
}
