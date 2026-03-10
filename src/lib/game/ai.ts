import type { GameState } from "./types";
import {
  processRoll,
  processMove,
} from "./engine";
import {
  resolveBuyImprovement,
  resolvePlaceImprovement,
  resolveIrrigate,
} from "./improvements";
import { IRRIGATION_COST } from "./improvements";
import type { ImprovementTileType } from "./types";

function aiDecideBuy(state: GameState, playerIndex: number): ImprovementTileType | null {
  const player = state.players[playerIndex];
  const station = state.board.stations[player.stationId];
  if (!player || !station) return null;

  const canAfford = (cost: number) => player.money >= cost;

  if (canAfford(300)) {
    const hasShed = station.paddocks.some((p) => p.improvement === "shearing_shed");
    const sheepCount = station.paddocks.reduce((s, p) => s + p.sheepCount, 0);
    if (!hasShed && sheepCount >= 3) return "shearing_shed";
  }
  if (canAfford(200)) {
    const unirrigated = station.paddocks.filter((p) => !p.irrigated);
    if (unirrigated.length > 0) return "irrigation";
  }
  if (canAfford(150)) return "fence";
  if (canAfford(250)) return "well";

  return null;
}

function aiDecideIrrigate(state: GameState, playerIndex: number): number | null {
  const player = state.players[playerIndex];
  const station = state.board.stations[player.stationId];
  if (!player || player.money < IRRIGATION_COST || !station) return null;

  for (let i = 0; i < station.paddocks.length; i++) {
    const pad = station.paddocks[i];
    if (!pad.irrigated && pad.sheepCount > 0) return i;
  }
  for (let i = 0; i < station.paddocks.length; i++) {
    if (!station.paddocks[i].irrigated) return i;
  }
  return null;
}

function aiDecidePlace(state: GameState, playerIndex: number): { tile: ImprovementTileType; paddock: number } | null {
  const player = state.players[playerIndex];
  const station = state.board.stations[player.stationId];
  if (!player || player.improvementTiles.length === 0 || !station) return null;

  const tile = player.improvementTiles[0];
  for (let i = 0; i < station.paddocks.length; i++) {
    if (station.paddocks[i].improvement === "none") {
      return { tile, paddock: i };
    }
  }
  return null;
}

export function runAITurn(state: GameState): GameState {
  const playerIndex = state.currentPlayerIndex;
  const player = state.players[playerIndex];
  if (!player || !player.isAI) return state;

  let s = state;

  if (s.phase === "roll") {
    s = processRoll(s);
    s = processMove(s, playerIndex);
  }

  while (s.currentPlayerIndex === playerIndex && (s.phase === "action" || s.phase === "station")) {
    const currentPlayer = s.players[playerIndex];

    const place = aiDecidePlace(s, playerIndex);
    if (place) {
      s = resolvePlaceImprovement(s, playerIndex, place.paddock, place.tile);
      continue;
    }

    const irrigate = aiDecideIrrigate(s, playerIndex);
    if (irrigate !== null) {
      s = resolveIrrigate(s, playerIndex, irrigate);
      continue;
    }

    const buy = aiDecideBuy(s, playerIndex);
    if (buy) {
      s = resolveBuyImprovement(s, playerIndex, buy);
      continue;
    }

    break;
  }

  if (s.currentPlayerIndex === playerIndex) {
    const nextIndex = (playerIndex + 1) % s.players.length;
    s = {
      ...s,
      currentPlayerIndex: nextIndex,
      phase: "roll",
      diceRoll: null,
    };
  }

  return s;
}
