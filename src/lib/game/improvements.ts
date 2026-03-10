import type { GameState, ImprovementTileType, Paddock } from './types';
import { addEvent } from './events';

const IMPROVEMENT_COSTS: Record<ImprovementTileType, number> = {
  shearing_shed: 300,
  fence: 150,
  well: 250,
  irrigation: 200,
};

export const IRRIGATION_COST = 100;

export function getImprovementCost(type: ImprovementTileType): number {
  return IMPROVEMENT_COSTS[type];
}

export function resolveBuyImprovement(state: GameState, playerIndex: number, tileType: ImprovementTileType): GameState {
  const player = state.players[playerIndex];
  const cost = IMPROVEMENT_COSTS[tileType];
  if (!player || player.money < cost) return state;

  const updatedPlayers = state.players.map((p, i) =>
    i === playerIndex
      ? {
          ...p,
          money: p.money - cost,
          improvementTiles: [...p.improvementTiles, tileType],
        }
      : p
  );

  return addEvent({ ...state, players: updatedPlayers }, `${player.displayName} bought ${tileType.replace('_', ' ')}`);
}

export function resolvePlaceImprovement(
  state: GameState,
  playerIndex: number,
  paddockIndex: number,
  tileType: ImprovementTileType
): GameState {
  const player = state.players[playerIndex];
  if (!player || !player.improvementTiles.includes(tileType)) return state;

  const station = state.board.stations[player.stationId];
  const paddock = station.paddocks[paddockIndex];
  if (!paddock || paddock.improvement !== 'none') return state;

  const tileIdx = player.improvementTiles.indexOf(tileType);
  const updatedPlayers = state.players.map((p, i) =>
    i === playerIndex
      ? {
          ...p,
          improvementTiles: p.improvementTiles.filter((_, idx) => idx !== tileIdx),
        }
      : p
  );

  const stations = state.board.stations.map((s, si) => {
    if (si !== player.stationId) return s;
    const pads = s.paddocks.map((pad, pi) => (pi === paddockIndex ? { ...pad, improvement: tileType } : pad));
    return { ...s, paddocks: pads };
  });

  return addEvent(
    {
      ...state,
      players: updatedPlayers,
      board: { ...state.board, stations },
    },
    `${player.displayName} placed ${tileType.replace('_', ' ')} on paddock ${paddockIndex + 1}`
  );
}

export function resolveIrrigate(state: GameState, playerIndex: number, paddockIndex: number): GameState {
  const player = state.players[playerIndex];
  if (!player || player.money < IRRIGATION_COST) return state;

  const station = state.board.stations[player.stationId];
  const paddock = station.paddocks[paddockIndex];
  if (!paddock || paddock.irrigated) return state;

  const updatedPlayers = state.players.map((p, i) =>
    i === playerIndex ? { ...p, money: p.money - IRRIGATION_COST } : p
  );

  const stations = state.board.stations.map((s, si) => {
    if (si !== player.stationId) return s;
    const pads = s.paddocks.map((pad, pi) => (pi === paddockIndex ? { ...pad, irrigated: true } : pad));
    return { ...s, paddocks: pads };
  });

  return addEvent(
    {
      ...state,
      players: updatedPlayers,
      board: { ...state.board, stations },
    },
    `${player.displayName} irrigated paddock ${paddockIndex + 1}`
  );
}
