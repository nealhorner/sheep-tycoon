import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runAITurn } from './ai';
import { createInitialGameState } from './engine';

describe('runAITurn', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns state unchanged when not AI turn', () => {
    const state = createInitialGameState([
      { displayName: 'Human', isAI: false },
      { displayName: 'AI', isAI: true },
    ]);
    state.currentPlayerIndex = 0;

    const next = runAITurn(state);
    expect(next).toBe(state);
  });

  it('executes full AI turn: roll, move, end turn', () => {
    const state = createInitialGameState([
      { displayName: 'Human', isAI: false },
      { displayName: 'AI', isAI: true },
    ]);
    state.currentPlayerIndex = 1;

    const next = runAITurn(state);
    expect(next.currentPlayerIndex).toBe(0);
    expect(next.phase).toBe('roll');
    expect(next.diceRoll).toBeNull();
  });

  it('AI may buy/irrigate/place when affordable', () => {
    const state = createInitialGameState([
      { displayName: 'Human', isAI: false },
      { displayName: 'AI', isAI: true },
    ]);
    state.currentPlayerIndex = 1;
    state.phase = 'action';
    state.players[1].money = 500;
    state.players[1].improvementTiles = ['shearing_shed'];
    state.board.stations[1].paddocks[0].improvement = 'none';

    const next = runAITurn(state);
    expect(next.currentPlayerIndex).toBe(0);
  });
});
