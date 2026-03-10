import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

const mockLobbyCreate = vi.fn().mockResolvedValue({
  id: 'abc12345',
  hostName: 'Host',
  status: 'WAITING',
  maxPlayers: 6,
  startingMoney: 2000,
});

const mockLobbyPlayerCreate = vi.fn().mockResolvedValue({});

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    lobby: { create: (...args: unknown[]) => mockLobbyCreate(...args) },
    lobbyPlayer: {
      create: (...args: unknown[]) => mockLobbyPlayerCreate(...args),
    },
  },
}));

describe('POST /api/lobby', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates lobby and returns lobbyId', async () => {
    const res = await POST(
      new Request('http://x/api/lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: 'Host' }),
      })
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty('lobbyId', 'abc12345');
    expect(mockLobbyCreate).toHaveBeenCalled();
    expect(mockLobbyPlayerCreate).toHaveBeenCalled();
  });

  it('returns 400 when hostName missing', async () => {
    const res = await POST(
      new Request('http://x/api/lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(400);
  });
});
