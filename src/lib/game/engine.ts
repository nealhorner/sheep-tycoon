import { v4 as uuidv4 } from 'uuid';
import type { GameState, TrackSpace, Station, Paddock, PlayerState } from './types';
import { STATION_NAMES } from './types';
import { createDecks } from './cards';
import {
  addEvent,
  resolveCollectWool,
  resolveWoolSale,
  resolveTuckerBag,
  resolveStockSale,
  resolveStudRam,
  resolveLoan,
} from './events';

const ROLL_WORDS: Record<number, string> = {
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
  6: 'six',
  7: 'seven',
  8: 'eight',
  9: 'nine',
  10: 'ten',
  11: 'eleven',
  12: 'twelve',
};

const INITIAL_SHEEP_COUNT = 600;
const INITIAL_MONEY = 2000;

const TRACK_SPACE_TYPES: { type: TrackSpace['type']; label: string }[] = [
  { type: 'wool_sale', label: 'Wool Sale' },
  { type: 'collect_wool', label: 'Collect Wool' },
  { type: 'sell_sheep', label: 'Sell Sheep' },
  { type: 'buy_improvement', label: 'Buy Improvement' },
  { type: 'tucker_bag', label: 'Tucker Bag' },
  { type: 'stock_sale', label: 'Stock Sale' },
  { type: 'blank', label: '' },
  { type: 'collect_wool', label: 'Collect Wool' },
  { type: 'sell_sheep', label: 'Sell Sheep' },
  { type: 'buy_improvement', label: 'Buy Improvement' },
  { type: 'tucker_bag', label: 'Tucker Bag' },
  { type: 'blank', label: '' },
  { type: 'stock_sale', label: 'Stock Sale' },
  { type: 'stud_ram', label: 'Stud Ram' },
  { type: 'collect_wool', label: 'Collect Wool' },
  { type: 'sell_sheep', label: 'Sell Sheep' },
  { type: 'buy_improvement', label: 'Buy Improvement' },
  { type: 'tucker_bag', label: 'Tucker Bag' },
  { type: 'blank', label: '' },
  { type: 'stock_sale', label: 'Stock Sale' },
  { type: 'collect_wool', label: 'Collect Wool' },
  { type: 'sell_sheep', label: 'Sell Sheep' },
  { type: 'loan', label: 'Take Loan' },
];

function createTrack(): TrackSpace[] {
  return TRACK_SPACE_TYPES.map((t, i) => ({
    index: i,
    type: t.type,
    label: t.label,
  }));
}

function createPaddocks(): Paddock[] {
  return Array.from({ length: 5 }, (_, i) => ({
    index: i,
    irrigated: false,
    sheepCount: INITIAL_SHEEP_COUNT,
    improvement: 'none',
  }));
}

function createStations(): Station[] {
  return STATION_NAMES.map((name, id) => ({
    id,
    name,
    paddocks: createPaddocks(),
  }));
}

export function createInitialGameState(
  playerConfigs: { displayName: string; isAI: boolean }[],
  startingMoney = INITIAL_MONEY
): GameState {
  const trackSpaces = createTrack();
  const stations = createStations();
  const decks = createDecks();

  const players: PlayerState[] = playerConfigs.map((config, i) => ({
    id: uuidv4(),
    displayName: config.displayName,
    isAI: config.isAI,
    stationId: i,
    money: startingMoney,
    trackPosition: 0,
    sheepInHand: 0,
    improvementTiles: [],
    hasPassedWoolSale: false,
  }));

  return {
    board: {
      trackSpaces,
      stations,
      trackLength: trackSpaces.length,
    },
    players,
    currentPlayerIndex: 0,
    phase: 'roll',
    diceRoll: null,
    decks,
    market: {
      woolPrice: 10,
      sheepPrice: 5,
    },
    events: [],
    winnerId: null,
  };
}

export function processRoll(state: GameState): GameState {
  const roll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
  const player = state.players[state.currentPlayerIndex];
  const rollWord = ROLL_WORDS[roll] ?? String(roll);
  return addEvent(
    {
      ...state,
      diceRoll: roll,
      phase: 'move',
    },
    `${player?.displayName ?? 'Player'} rolled ${rollWord}`
  );
}

export function processMove(state: GameState, playerIndex: number): GameState {
  const player = state.players[playerIndex];
  if (!player || state.phase !== 'move' || state.diceRoll === null) {
    return state;
  }

  const newPosition = (player.trackPosition + state.diceRoll) % state.board.trackLength;
  const passedWoolSale = player.trackPosition + state.diceRoll >= state.board.trackLength;

  const updatedPlayers = state.players.map((p, i) =>
    i === playerIndex
      ? {
          ...p,
          trackPosition: newPosition,
          hasPassedWoolSale: p.hasPassedWoolSale || passedWoolSale,
        }
      : p
  );

  let afterMove: GameState = {
    ...state,
    players: updatedPlayers,
    phase: 'action',
    diceRoll: null,
  };

  const space = state.board.trackSpaces[newPosition];

  switch (space.type) {
    case 'wool_sale':
      afterMove = resolveWoolSale(afterMove, playerIndex);
      break;
    case 'collect_wool':
      afterMove = resolveCollectWool(afterMove, playerIndex);
      break;
    case 'tucker_bag':
      afterMove = resolveTuckerBag(afterMove, playerIndex);
      break;
    case 'stock_sale':
      afterMove = resolveStockSale(afterMove, playerIndex);
      break;
    case 'stud_ram':
      afterMove = resolveStudRam(afterMove, playerIndex);
      break;
    case 'loan':
      afterMove = resolveLoan(afterMove, playerIndex);
      break;
    case 'sell_sheep':
    case 'buy_improvement':
    case 'blank':
      break;
  }

  return afterMove;
}
