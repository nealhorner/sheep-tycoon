import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';

vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    game: {
      create: vi.fn().mockResolvedValue({ id: 'game-123' }),
    },
  },
}));

describe('POST /api/game', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates game and returns gameId with valid body', async () => {
    const res = await POST(
      new Request('http://x/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: 'TestPlayer' }),
      })
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty('gameId', 'game-123');
  });

  it('returns 400 for invalid body', async () => {
    const res = await POST(
      new Request('http://x/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: '' }),
      })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });

  it('uses default displayName when omitted', async () => {
    const res = await POST(
      new Request('http://x/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
    );
    expect(res.status).toBe(200);
    expect((await res.json()).gameId).toBeDefined();
  });
});
