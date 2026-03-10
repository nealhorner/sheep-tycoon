import type { GameState, Card } from "./types";
import { drawCard } from "./cards";

export function addEvent(state: GameState, message: string): GameState {
  return {
    ...state,
    events: [...state.events, { message, timestamp: Date.now() }].slice(-20),
  };
}

export function resolveCollectWool(
  state: GameState,
  playerIndex: number,
): GameState {
  const player = state.players[playerIndex];
  const station = state.board.stations[player.stationId];
  if (!player || !station) return state;

  const woolCount = station.paddocks.reduce((sum, pad) => {
    if (pad.improvement === "shearing_shed" && pad.sheepCount > 0) {
      return sum + pad.sheepCount;
    }
    return sum;
  }, 0);

  const income = woolCount * state.market.woolPrice;
  const updatedPlayers = state.players.map((p, i) =>
    i === playerIndex ? { ...p, money: p.money + income } : p,
  );

  return addEvent(
    { ...state, players: updatedPlayers },
    `${player.displayName} collected $${income} wool (${woolCount} sheep)`,
  );
}

export function resolveWoolSale(
  state: GameState,
  playerIndex: number,
): GameState {
  const player = state.players[playerIndex];
  if (!player || !player.hasPassedWoolSale) return state;

  const station = state.board.stations[player.stationId];
  const woolCount = station.paddocks.reduce((sum, pad) => {
    if (pad.improvement === "shearing_shed" && pad.sheepCount > 0) {
      return sum + pad.sheepCount;
    }
    return sum;
  }, 0);

  const income = woolCount * state.market.woolPrice;
  const updatedPlayers = state.players.map((p, i) =>
    i === playerIndex
      ? { ...p, money: p.money + income, hasPassedWoolSale: false }
      : p,
  );

  return addEvent(
    { ...state, players: updatedPlayers },
    `${player.displayName} wool sale: $${income}`,
  );
}

export function resolveTuckerBag(
  state: GameState,
  playerIndex: number,
): GameState {
  const { card, deck: newDeck } = drawCard(state.decks.tuckerBag);
  if (!card) return state;

  let newState: GameState = {
    ...state,
    decks: { ...state.decks, tuckerBag: newDeck },
  };
  newState = addEvent(
    newState,
    `${state.players[playerIndex].displayName} drew: ${card.title}`,
  );

  if (card.title === "Drought") {
    const player = newState.players[playerIndex];
    const station = newState.board.stations[player.stationId];
    const stations = newState.board.stations.map((s, si) => {
      if (si !== player.stationId) return s;
      return {
        ...s,
        paddocks: s.paddocks.map((pad) => ({
          ...pad,
          sheepCount: pad.irrigated
            ? pad.sheepCount
            : Math.max(0, pad.sheepCount - 2),
        })),
      };
    });
    newState = { ...newState, board: { ...newState.board, stations } };
  } else if (card.title === "Good Season") {
    const updatedPlayers = newState.players.map((p, i) =>
      i === playerIndex ? { ...p, money: p.money + 100 } : p,
    );
    newState = { ...newState, players: updatedPlayers };
  } else if (card.title === "Flood") {
    const updatedPlayers = newState.players.map((p, i) =>
      i === playerIndex ? { ...p, money: p.money + 200 } : p,
    );
    newState = { ...newState, players: updatedPlayers };
  }

  return newState;
}

export function resolveStockSale(
  state: GameState,
  playerIndex: number,
): GameState {
  const { card, deck: newDeck } = drawCard(state.decks.stockSale);
  if (!card) return state;

  let newState: GameState = {
    ...state,
    decks: { ...state.decks, stockSale: newDeck },
  };
  newState = addEvent(
    newState,
    `${state.players[playerIndex].displayName} drew: ${card.title}`,
  );

  if (card.title === "Wool Price Up") {
    newState = {
      ...newState,
      market: { ...newState.market, woolPrice: newState.market.woolPrice + 2 },
    };
  } else if (card.title === "Wool Price Down") {
    newState = {
      ...newState,
      market: {
        ...newState.market,
        woolPrice: Math.max(2, newState.market.woolPrice - 2),
      },
    };
  } else if (card.title === "Sheep Price Up") {
    newState = {
      ...newState,
      market: {
        ...newState.market,
        sheepPrice: newState.market.sheepPrice + 1,
      },
    };
  } else if (card.title === "Sheep Price Down") {
    newState = {
      ...newState,
      market: {
        ...newState.market,
        sheepPrice: Math.max(1, newState.market.sheepPrice - 1),
      },
    };
  }

  return newState;
}

export function resolveStudRam(
  state: GameState,
  playerIndex: number,
): GameState {
  const { card, deck: newDeck } = drawCard(state.decks.studRam);
  if (!card) return state;

  const player = state.players[playerIndex];
  const station = state.board.stations[player.stationId];
  const totalSheep = station.paddocks.reduce((s, p) => s + p.sheepCount, 0);
  const newSheep = Math.floor(totalSheep / 3);

  let newState: GameState = {
    ...state,
    decks: { ...state.decks, studRam: newDeck },
  };

  if (newSheep > 0) {
    const firstPad = station.paddocks.find((p) => p.sheepCount < 10);
    if (firstPad) {
      const padIdx = station.paddocks.indexOf(firstPad);
      const stations = newState.board.stations.map((s, si) => {
        if (si !== player.stationId) return s;
        const pads = [...s.paddocks];
        pads[padIdx] = {
          ...pads[padIdx],
          sheepCount: Math.min(10, pads[padIdx].sheepCount + newSheep),
        };
        return { ...s, paddocks: pads };
      });
      newState = { ...newState, board: { ...newState.board, stations } };
    }
  }

  return addEvent(
    newState,
    `${player.displayName} drew Stud Ram: +${newSheep} sheep`,
  );
}

export function resolveLoan(state: GameState, playerIndex: number): GameState {
  const updatedPlayers = state.players.map((p, i) =>
    i === playerIndex ? { ...p, money: p.money + 500 } : p,
  );
  return addEvent(
    { ...state, players: updatedPlayers },
    `${state.players[playerIndex].displayName} took a loan of $500`,
  );
}
