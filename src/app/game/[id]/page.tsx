'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Board from '@/components/Board/Board';
import type { GameState, ImprovementTileType, PlayerState } from '@/lib/game/types';
import { getImprovementCost, IRRIGATION_COST } from '@/lib/game/improvements';

function getTotalSheep(gameState: GameState, player: PlayerState): number {
  const station = gameState.board.stations[player.stationId];
  const paddockSheep = station?.paddocks.reduce((s, p) => s + p.sheepCount, 0) ?? 0;
  return player.sheepInHand + paddockSheep;
}

export default function GamePage() {
  const params = useParams();
  const gameId = params?.id as string;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchGame = useCallback(async () => {
    if (!gameId) return;
    try {
      const res = await fetch(`/api/game/${gameId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('Game not found');
        throw new Error('Failed to load game');
      }
      const data = await res.json();
      setGameState(data.gameState);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
      setGameState(null);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchGame();
  }, [fetchGame]);

  const aiTickRequested = useRef(false);
  useEffect(() => {
    if (!gameId || !gameState || !gameState.players[gameState.currentPlayerIndex]?.isAI) return;
    if (aiTickRequested.current) return;
    aiTickRequested.current = true;
    const timer = setTimeout(() => {
      fetch(`/api/game/${gameId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ai_tick' }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.gameState) setGameState(data.gameState);
          fetchGame();
        })
        .finally(() => {
          aiTickRequested.current = false;
        });
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when it becomes AI's turn
  }, [gameId, gameState?.currentPlayerIndex]);

  useEffect(() => {
    if (!gameId) return;
    const es = new EventSource(`/api/game/${gameId}/stream`);
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.gameState) setGameState(msg.gameState);
      } catch {
        // ignore
      }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [gameId]);

  async function handleRoll() {
    await handleAction('roll');
  }

  async function handleAction(action: string, payload?: { tileType?: ImprovementTileType; paddockIndex?: number }) {
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/game/${gameId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      if (data.gameState) setGameState(data.gameState);
      await fetchGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEndTurn() {
    await handleAction('end_turn');
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-outback-50">
        <p className="text-outback-600">Loading game…</p>
      </main>
    );
  }

  if (error || !gameState) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-outback-50 px-6">
        <p className="text-red-600">{error || 'Game not found'}</p>
        <Link href="/" className="rounded-xl bg-ochre-500 px-6 py-3 font-semibold text-white hover:bg-ochre-600">
          Back to Home
        </Link>
      </main>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isCurrentPlayer = currentPlayer && !currentPlayer.isAI;
  const myStation = currentPlayer && gameState.board.stations[currentPlayer.stationId];
  const improvementTypes: ImprovementTileType[] = ['shearing_shed', 'fence', 'well', 'irrigation'];

  return (
    <main className="min-h-screen bg-gradient-to-b from-outback-50 to-outback-100 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="text-sm text-ochre-600 hover:underline">
            ← Home
          </Link>
          <h1 className="font-display text-xl font-bold text-outback-900">Sheep Tycoon</h1>
          <div />
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {gameState.players.map((p, i) => (
            <div
              key={p.id}
              className={`rounded-xl border-2 px-4 py-3 shadow-sm ${
                i === gameState.currentPlayerIndex ? 'border-ochre-500 bg-ochre-50' : 'border-outback-200 bg-white/90'
              }`}
            >
              <p className="font-semibold text-outback-800">
                {p.displayName}
                {p.isAI && ' (AI)'}
              </p>
              <p className="mt-1 text-sm text-outback-600">
                {getTotalSheep(gameState, p)} sheep · ${p.money}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1">
            <div className="overflow-hidden rounded-xl bg-white/80 p-2 shadow-lg backdrop-blur sm:p-4">
              <Board gameState={gameState} width={700} height={700} />
            </div>
          </div>

          <aside className="w-full shrink-0 rounded-xl bg-white/90 p-4 shadow-lg backdrop-blur sm:p-6 lg:w-80">
            <h2 className="text-lg font-semibold text-outback-800">Game Info</h2>
            <p className="mt-2 text-sm text-outback-600">
              Phase: <span className="font-medium">{gameState.phase}</span>
            </p>
            {gameState.diceRoll !== null && (
              <p className="mt-1 text-sm text-outback-600">
                Dice: <span className="font-medium">{gameState.diceRoll}</span>
              </p>
            )}

            {myStation && isCurrentPlayer && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-outback-700">Your station: {myStation.name}</h3>
                <p className="mt-1 text-xs text-outback-500">
                  Tiles: {currentPlayer.improvementTiles.join(', ') || 'None'}
                </p>
              </div>
            )}

            <div className="mt-6 space-y-2">
              {isCurrentPlayer && gameState.phase === 'roll' && (
                <button
                  onClick={handleRoll}
                  disabled={actionLoading}
                  className="w-full rounded-xl bg-ochre-500 py-3 font-semibold text-white transition hover:bg-ochre-600 disabled:opacity-50"
                >
                  {actionLoading ? 'Rolling…' : 'Roll Dice'}
                </button>
              )}
              {isCurrentPlayer && (gameState.phase === 'action' || gameState.phase === 'station') && (
                <>
                  <p className="text-xs font-medium text-outback-600">Buy improvement</p>
                  {improvementTypes.map((t) => {
                    const cost = getImprovementCost(t);
                    const canAfford = currentPlayer && currentPlayer.money >= cost;
                    return (
                      <button
                        key={t}
                        onClick={() =>
                          handleAction('buy_improvement', {
                            tileType: t,
                          })
                        }
                        disabled={actionLoading || !canAfford}
                        className="w-full rounded-lg border border-outback-300 py-2 text-sm font-medium text-outback-700 hover:bg-outback-50 disabled:opacity-50"
                      >
                        {t.replace('_', ' ')} ${cost}
                      </button>
                    );
                  })}
                  {myStation?.paddocks.map((pad, i) =>
                    !pad.irrigated && currentPlayer && currentPlayer.money >= IRRIGATION_COST ? (
                      <button
                        key={i}
                        onClick={() => handleAction('irrigate', { paddockIndex: i })}
                        disabled={actionLoading}
                        className="w-full rounded-lg border border-green-300 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
                      >
                        Irrigate paddock {i + 1} (${IRRIGATION_COST})
                      </button>
                    ) : null
                  )}
                  {currentPlayer?.improvementTiles.flatMap((tile, ti) =>
                    (myStation?.paddocks ?? [])
                      .map((pad, pi) =>
                        pad.improvement === 'none' ? (
                          <button
                            key={`place-${ti}-${pi}`}
                            onClick={() =>
                              handleAction('place_improvement', {
                                tileType: tile,
                                paddockIndex: pi,
                              })
                            }
                            disabled={actionLoading}
                            className="w-full rounded-lg border border-ochre-300 py-2 text-sm font-medium text-ochre-700 hover:bg-ochre-50 disabled:opacity-50"
                          >
                            Place {tile.replace('_', ' ')} on paddock {pi + 1}
                          </button>
                        ) : null
                      )
                      .filter(Boolean)
                  )}
                  <button
                    onClick={handleEndTurn}
                    disabled={actionLoading}
                    className="mt-2 w-full rounded-xl border-2 border-outback-400 py-3 font-semibold text-outback-700 transition hover:bg-outback-50 disabled:opacity-50"
                  >
                    {actionLoading ? '…' : 'End Turn'}
                  </button>
                </>
              )}
            </div>

            {gameState.events.length > 0 && (
              <div className="mt-6 max-h-32 overflow-y-auto">
                <h3 className="text-sm font-semibold text-outback-700">Events</h3>
                <ul className="mt-1 space-y-1 text-xs text-outback-600">
                  {[...gameState.events]
                    .reverse()
                    .slice(0, 5)
                    .map((e, i) => (
                      <li key={i}>{e.message}</li>
                    ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </main>
  );
}
