import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createInitialGameState, processRoll, processMove } from './engine';
import type { GameState } from './types';

describe('createInitialGameState', () => {
  it('creates correct number of players with stationId, money, trackPosition', () => {
    const state = createInitialGameState([
      { displayName: 'A', isAI: false },
      { displayName: 'B', isAI: true },
    ]);

    expect(state.players).toHaveLength(2);
    expect(state.players[0]).toMatchObject({
      displayName: 'A',
      isAI: false,
      stationId: 0,
      money: 2000,
      trackPosition: 0,
      sheepInHand: 0,
      improvementTiles: [],
      hasPassedWoolSale: false,
    });
    expect(state.players[1]).toMatchObject({
      displayName: 'B',
      isAI: true,
      stationId: 1,
      money: 2000,
      trackPosition: 0,
    });
    expect(state.players[0].id).toBeDefined();
    expect(state.players[1].id).toBeDefined();
  });

  it('board has track spaces, 6 stations, 5 paddocks per station', () => {
    const state = createInitialGameState([{ displayName: 'P', isAI: false }]);

    expect(state.board.trackSpaces.length).toBeGreaterThanOrEqual(20);
    expect(state.board.trackLength).toBe(state.board.trackSpaces.length);
    expect(state.board.stations).toHaveLength(6);
    state.board.stations.forEach((station) => {
      expect(station.paddocks).toHaveLength(5);
    });
  });

  it('each paddock starts with 3 sheep, no irrigation', () => {
    const state = createInitialGameState([{ displayName: 'P', isAI: false }]);

    state.board.stations.forEach((station) => {
      station.paddocks.forEach((pad) => {
        expect(pad.sheepCount).toBe(600);
        expect(pad.irrigated).toBe(false);
        expect(pad.improvement).toBe('none');
      });
    });
  });

  it('decks have expected card counts', () => {
    const state = createInitialGameState([{ displayName: 'P', isAI: false }]);

    expect(state.decks.tuckerBag).toHaveLength(22);
    expect(state.decks.stockSale).toHaveLength(26);
    expect(state.decks.studRam).toHaveLength(5);
  });

  it('phase is roll, diceRoll is null', () => {
    const state = createInitialGameState([{ displayName: 'P', isAI: false }]);

    expect(state.phase).toBe('roll');
    expect(state.diceRoll).toBeNull();
  });

  it('uses custom starting money', () => {
    const state = createInitialGameState([{ displayName: 'P', isAI: false }], 5000);
    expect(state.players[0].money).toBe(5000);
  });
});

describe('processRoll', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets diceRoll to 2-12 and phase to move', () => {
    const state = createInitialGameState([{ displayName: 'P', isAI: false }]);
    const next = processRoll(state);

    expect(next.diceRoll).toBeGreaterThanOrEqual(2);
    expect(next.diceRoll).toBeLessThanOrEqual(12);
    expect(next.phase).toBe('move');
  });

  it('with mocked random 0.5 yields deterministic sum', () => {
    const state = createInitialGameState([{ displayName: 'P', isAI: false }]);
    const next = processRoll(state);
    expect(next.diceRoll).toBe(8); // floor(0.5*6)+1 = 4, 4+4=8
  });
});

describe('processMove', () => {
  let baseState: GameState;

  beforeEach(() => {
    baseState = createInitialGameState([
      { displayName: 'Human', isAI: false },
      { displayName: 'AI', isAI: true },
    ]);
    baseState.phase = 'move';
  });

  it('returns state unchanged if phase is not move', () => {
    baseState.phase = 'roll';
    baseState.diceRoll = 5;
    const next = processMove(baseState, 0);
    expect(next).toBe(baseState);
  });

  it('returns state unchanged if diceRoll is null', () => {
    baseState.diceRoll = null;
    const next = processMove(baseState, 0);
    expect(next).toBe(baseState);
  });

  it('advances trackPosition by dice roll with wrap-around', () => {
    const trackLen = baseState.board.trackLength;
    baseState.diceRoll = 5;
    baseState.players[0].trackPosition = trackLen - 3;
    const next = processMove(baseState, 0);
    expect(next.players[0].trackPosition).toBe(2); // (trackLen-3 + 5) % trackLen
  });

  it('sets hasPassedWoolSale when crossing start', () => {
    baseState.diceRoll = 10;
    baseState.players[0].trackPosition = 20;
    const next = processMove(baseState, 0);
    expect(next.players[0].hasPassedWoolSale).toBe(true);
  });

  it('resolves loan space - adds $500', () => {
    const loanIndex = baseState.board.trackSpaces.findIndex((s) => s.type === 'loan');
    expect(loanIndex).toBeGreaterThanOrEqual(0);
    baseState.diceRoll = loanIndex;
    baseState.players[0].trackPosition = 0;
    const next = processMove(baseState, 0);
    expect(next.players[0].money).toBe(2500);
    expect(next.events.length).toBeGreaterThan(0);
  });

  it('resolves collect_wool - no income without shearing shed', () => {
    const idx = baseState.board.trackSpaces.findIndex((s) => s.type === 'collect_wool');
    baseState.diceRoll = idx;
    baseState.players[0].trackPosition = 0;
    const next = processMove(baseState, 0);
    expect(next.players[0].money).toBe(2000);
  });

  it('resolves collect_wool - income with shearing shed', () => {
    const idx = baseState.board.trackSpaces.findIndex((s) => s.type === 'collect_wool');
    baseState.board.stations[0].paddocks[0].improvement = 'shearing_shed';
    baseState.board.stations[0].paddocks[0].sheepCount = 3;
    baseState.diceRoll = idx;
    baseState.players[0].trackPosition = 0;
    const next = processMove(baseState, 0);
    expect(next.players[0].money).toBe(2030); // 3 sheep * 10 wool price
  });

  it('resolves wool_sale when hasPassedWoolSale', () => {
    const idx = baseState.board.trackSpaces.findIndex((s) => s.type === 'wool_sale');
    baseState.players[0].hasPassedWoolSale = true;
    baseState.board.stations[0].paddocks[0].improvement = 'shearing_shed';
    baseState.board.stations[0].paddocks[0].sheepCount = 3;
    baseState.diceRoll = idx;
    baseState.players[0].trackPosition = 0;
    const next = processMove(baseState, 0);
    expect(next.players[0].money).toBe(2030);
    expect(next.players[0].hasPassedWoolSale).toBe(false);
  });

  it('tucker_bag reduces deck size', () => {
    const idx = baseState.board.trackSpaces.findIndex((s) => s.type === 'tucker_bag');
    const initialDeckSize = baseState.decks.tuckerBag.length;
    baseState.diceRoll = idx;
    baseState.players[0].trackPosition = 0;
    const next = processMove(baseState, 0);
    expect(next.decks.tuckerBag.length).toBe(initialDeckSize - 1);
    expect(next.phase).toBe('action');
  });

  it('stock_sale reduces deck size', () => {
    const idx = baseState.board.trackSpaces.findIndex((s) => s.type === 'stock_sale');
    const initialDeckSize = baseState.decks.stockSale.length;
    baseState.diceRoll = idx;
    baseState.players[0].trackPosition = 0;
    const next = processMove(baseState, 0);
    expect(next.decks.stockSale.length).toBe(initialDeckSize - 1);
    expect(next.phase).toBe('action');
  });

  it('phase becomes action after move', () => {
    baseState.diceRoll = 6;
    baseState.players[0].trackPosition = 0;
    const next = processMove(baseState, 0);
    expect(next.phase).toBe('action');
    expect(next.diceRoll).toBeNull();
  });
});
