import { describe, it, expect } from 'vitest';
import {
  getImprovementCost,
  resolveBuyImprovement,
  resolvePlaceImprovement,
  resolveIrrigate,
  IRRIGATION_COST,
} from './improvements';
import { createInitialGameState } from './engine';

describe('getImprovementCost', () => {
  it('returns correct costs', () => {
    expect(getImprovementCost('shearing_shed')).toBe(300);
    expect(getImprovementCost('fence')).toBe(150);
    expect(getImprovementCost('well')).toBe(250);
    expect(getImprovementCost('irrigation')).toBe(200);
  });
});

describe('resolveBuyImprovement', () => {
  it('deducts money and adds tile', () => {
    const state = createInitialGameState([{ displayName: 'P', isAI: false }]);

    const next = resolveBuyImprovement(state, 0, 'shearing_shed');
    expect(next.players[0].money).toBe(1700);
    expect(next.players[0].improvementTiles).toContain('shearing_shed');
  });

  it('returns state unchanged when insufficient funds', () => {
    const state = createInitialGameState([{ displayName: 'P', isAI: false }]);
    state.players[0].money = 100;

    const next = resolveBuyImprovement(state, 0, 'shearing_shed');
    expect(next).toBe(state);
    expect(next.players[0].money).toBe(100);
    expect(next.players[0].improvementTiles).toHaveLength(0);
  });
});

describe('resolvePlaceImprovement', () => {
  it('places tile on empty paddock', () => {
    const state = createInitialGameState([{ displayName: 'P', isAI: false }]);
    state.players[0].improvementTiles = ['shearing_shed'];

    const next = resolvePlaceImprovement(state, 0, 0, 'shearing_shed');
    expect(next.board.stations[0].paddocks[0].improvement).toBe('shearing_shed');
    expect(next.players[0].improvementTiles).not.toContain('shearing_shed');
  });

  it('returns state when player has no tile', () => {
    const state = createInitialGameState([{ displayName: 'P', isAI: false }]);

    const next = resolvePlaceImprovement(state, 0, 0, 'shearing_shed');
    expect(next).toBe(state);
  });

  it('returns state when paddock already has improvement', () => {
    const state = createInitialGameState([{ displayName: 'P', isAI: false }]);
    state.players[0].improvementTiles = ['shearing_shed'];
    state.board.stations[0].paddocks[0].improvement = 'fence';

    const next = resolvePlaceImprovement(state, 0, 0, 'shearing_shed');
    expect(next.players[0].improvementTiles).toContain('shearing_shed');
  });
});

describe('resolveIrrigate', () => {
  it('sets irrigated and deducts cost', () => {
    const state = createInitialGameState([{ displayName: 'P', isAI: false }]);

    const next = resolveIrrigate(state, 0, 0);
    expect(next.board.stations[0].paddocks[0].irrigated).toBe(true);
    expect(next.players[0].money).toBe(2000 - IRRIGATION_COST);
  });

  it('returns state when already irrigated', () => {
    const state = createInitialGameState([{ displayName: 'P', isAI: false }]);
    state.board.stations[0].paddocks[0].irrigated = true;

    const next = resolveIrrigate(state, 0, 0);
    expect(next).toBe(state);
  });

  it('returns state when insufficient funds', () => {
    const state = createInitialGameState([{ displayName: 'P', isAI: false }]);
    state.players[0].money = 50;

    const next = resolveIrrigate(state, 0, 0);
    expect(next).toBe(state);
  });
});
