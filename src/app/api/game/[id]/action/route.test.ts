import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { createInitialGameState } from '@/lib/game/engine';

vi.mock('@/lib/sse', () => ({
  broadcastToGame: vi.fn(),
}));

const mockGameFindUnique = vi.fn();
const mockGameUpdate = vi.fn().mockResolvedValue({});

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    game: {
      findUnique: (...args: unknown[]) => mockGameFindUnique(...args),
      update: (...args: unknown[]) => mockGameUpdate(...args),
    },
  },
}));

function makeGameState(overrides?: Partial<ReturnType<typeof createInitialGameState>>) {
  const state = createInitialGameState([
    { displayName: 'Human', isAI: false },
    { displayName: 'AI', isAI: true },
  ]);
  return { ...state, ...overrides };
}

describe('POST /api/game/[id]/action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 404 when game not found', async () => {
    mockGameFindUnique.mockResolvedValue(null);

    const res = await POST(
      new Request('http://x/api/game/xxx/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'roll' }),
      }),
      { params: Promise.resolve({ id: 'xxx' }) }
    );
    expect(res.status).toBe(404);
  });

  it('roll updates state', async () => {
    const state = makeGameState();
    mockGameFindUnique.mockResolvedValue({
      id: 'game-1',
      gameState: state,
      status: 'ACTIVE',
      currentTurn: 0,
    });

    const res = await POST(
      new Request('http://x/api/game/game-1/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'roll' }),
      }),
      { params: Promise.resolve({ id: 'game-1' }) }
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.gameState.phase).toBe('action');
    expect(data.gameState.diceRoll).toBeNull();
  });

  it('end_turn advances and runs AI then returns to human', async () => {
    const state = makeGameState();
    state.phase = 'action';
    mockGameFindUnique.mockResolvedValue({
      id: 'game-1',
      gameState: state,
      status: 'ACTIVE',
      currentTurn: 5,
    });

    const res = await POST(
      new Request('http://x/api/game/game-1/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end_turn' }),
      }),
      { params: Promise.resolve({ id: 'game-1' }) }
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.gameState.phase).toBe('roll');
    expect(data.gameState.diceRoll).toBeNull();
  });

  it('buy_improvement deducts money and adds tile', async () => {
    const state = makeGameState();
    state.phase = 'action';
    mockGameFindUnique.mockResolvedValue({
      id: 'game-1',
      gameState: state,
      status: 'ACTIVE',
      currentTurn: 0,
    });

    const res = await POST(
      new Request('http://x/api/game/game-1/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buy_improvement',
          payload: { tileType: 'fence' },
        }),
      }),
      { params: Promise.resolve({ id: 'game-1' }) }
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.gameState.players[0].money).toBe(1850);
    expect(data.gameState.players[0].improvementTiles).toContain('fence');
  });

  it('irrigate sets paddock irrigated', async () => {
    const state = makeGameState();
    state.phase = 'action';
    mockGameFindUnique.mockResolvedValue({
      id: 'game-1',
      gameState: state,
      status: 'ACTIVE',
      currentTurn: 0,
    });

    const res = await POST(
      new Request('http://x/api/game/game-1/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'irrigate',
          payload: { paddockIndex: 0 },
        }),
      }),
      { params: Promise.resolve({ id: 'game-1' }) }
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.gameState.board.stations[0].paddocks[0].irrigated).toBe(true);
    expect(data.gameState.players[0].money).toBe(1900);
  });

  it('returns 400 when roll in wrong phase', async () => {
    const state = makeGameState();
    state.phase = 'action';
    mockGameFindUnique.mockResolvedValue({
      id: 'game-1',
      gameState: state,
      status: 'ACTIVE',
      currentTurn: 0,
    });

    const res = await POST(
      new Request('http://x/api/game/game-1/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'roll' }),
      }),
      { params: Promise.resolve({ id: 'game-1' }) }
    );
    expect(res.status).toBe(400);
  });
});
