'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface LobbyPlayer {
  id: string;
  displayName: string;
  ready: boolean;
  joinedAt: string;
}

interface LobbyState {
  id: string;
  hostName: string;
  status: string;
  maxPlayers: number;
  startingMoney: number;
  players: LobbyPlayer[];
}

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const lobbyId = params.id as string;

  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [displayName, setDisplayName] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('lobbyDisplayName') ?? '';
    }
    return '';
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLobby = useCallback(async () => {
    try {
      const res = await fetch(`/api/lobby/${lobbyId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Lobby not found');
        throw new Error('Failed to load lobby');
      }
      const data = await res.json();
      setLobby(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
      setLobby(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [lobbyId]);

  useEffect(() => {
    fetchLobby();
  }, [fetchLobby]);

  useEffect(() => {
    if (!lobbyId || !lobby) return;

    const es = new EventSource(`/api/lobby/${lobbyId}/stream`);
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'lobby_update' && msg.lobby) {
          setLobby(msg.lobby);
        }
        if (msg.type === 'game_started' && msg.gameId) {
          router.push(`/game/${msg.gameId}`);
        }
      } catch {
        // ignore parse errors
      }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [lobbyId, lobby, router]);

  async function handleReady(displayName: string) {
    const player = lobby?.players.find((p) => p.displayName.toLowerCase() === displayName.toLowerCase());
    if (!player) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/lobby/${lobbyId}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: player.displayName,
          ready: !player.ready,
        }),
      });
      if (!res.ok) throw new Error('Failed to toggle ready');
      const data = await res.json();
      setLobby((prev) =>
        prev
          ? {
              ...prev,
              players: prev.players.map((p) => (p.id === player.id ? { ...p, ready: data.ready } : p)),
            }
          : null
      );
    } catch {
      setError('Failed to update ready status');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStart(hostName: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/lobby/${lobbyId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start');
      router.push(`/game/${data.gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
    } finally {
      setActionLoading(false);
    }
  }

  const allReady = lobby && lobby.players.length >= 2 && lobby.players.every((p) => p.ready);
  const isHost = lobby && displayName.toLowerCase() === lobby.hostName.toLowerCase();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-outback-50">
        <p className="text-outback-600">Loading lobby…</p>
      </main>
    );
  }

  if (error || !lobby) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-outback-50 px-6">
        <p className="text-red-600">{error || 'Lobby not found'}</p>
        <Link href="/lobby" className="rounded-xl bg-ochre-500 px-6 py-3 font-semibold text-white hover:bg-ochre-600">
          Back to Lobby
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-outback-50 to-outback-100 px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white/90 p-8 shadow-lg backdrop-blur">
          <h1 className="font-display text-2xl font-bold text-outback-900">Lobby: {lobby.id}</h1>
          <p className="mt-1 text-outback-600">
            Share this code with friends:{' '}
            <span className="font-mono text-lg font-semibold text-ochre-600">{lobby.id}</span>
          </p>

          <div className="mt-6">
            <label className="block text-sm font-medium text-outback-700">Your display name (to take actions)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => {
                const v = e.target.value;
                setDisplayName(v);
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('lobbyDisplayName', v);
                }
              }}
              placeholder="Enter your name"
              className="mt-1 w-full rounded-lg border border-outback-300 px-4 py-2 focus:border-ochre-500 focus:outline-none focus:ring-1 focus:ring-ochre-500"
            />
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-outback-800">
              Players ({lobby.players.length}/{lobby.maxPlayers})
            </h2>
            <ul className="mt-4 space-y-2">
              {lobby.players.map((p) => (
                <li key={p.id} className="flex items-center justify-between rounded-lg bg-outback-50 px-4 py-3">
                  <span className="font-medium text-outback-800">
                    {p.displayName}
                    {p.displayName.toLowerCase() === lobby.hostName.toLowerCase() && (
                      <span className="ml-2 text-xs text-ochre-600">(Host)</span>
                    )}
                  </span>
                  <span className={p.ready ? 'text-green-600' : 'text-outback-400'}>
                    {p.ready ? 'Ready' : 'Not ready'}
                  </span>
                  {displayName && p.displayName.toLowerCase() === displayName.toLowerCase() && (
                    <button
                      onClick={() => handleReady(displayName)}
                      disabled={actionLoading}
                      className="rounded-lg border border-outback-300 px-3 py-1 text-sm font-medium text-outback-700 hover:bg-outback-100 disabled:opacity-50"
                    >
                      {lobby.players.find((x) => x.displayName.toLowerCase() === displayName.toLowerCase())?.ready
                        ? 'Unready'
                        : 'Ready'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-sm text-outback-500">Starting money: ${lobby.startingMoney}</p>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-8 flex gap-4">
            {isHost && (
              <button
                onClick={() => handleStart(lobby.hostName)}
                disabled={!allReady || actionLoading}
                className="flex-1 rounded-xl bg-ochre-500 px-6 py-3 font-semibold text-white transition hover:bg-ochre-600 disabled:opacity-50"
              >
                {actionLoading ? 'Starting…' : 'Start Game'}
              </button>
            )}
            {!allReady && isHost && <p className="text-sm text-outback-500">All players must be ready</p>}
            <Link
              href="/lobby"
              className="rounded-xl border border-outback-300 px-6 py-3 font-semibold text-outback-700 hover:bg-outback-50"
            >
              Leave
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
