// Sheep Tycoon game types

export const STATION_NAMES = [
  'Coorumbene',
  'Wanbanalong',
  'Emu Plains',
  'Mt Mitchell',
  'Warramboo',
  'Coolibah Creek',
] as const;

export type StationName = (typeof STATION_NAMES)[number];

export type TrackSpaceType =
  | 'wool_sale'
  | 'collect_wool'
  | 'sell_sheep'
  | 'buy_improvement'
  | 'tucker_bag'
  | 'stock_sale'
  | 'stud_ram'
  | 'loan'
  | 'blank';

export interface TrackSpace {
  index: number;
  type: TrackSpaceType;
  label: string;
}

export interface Paddock {
  index: number;
  irrigated: boolean;
  sheepCount: number;
  improvement: 'none' | 'shearing_shed' | 'fence' | 'well' | 'irrigation';
}

export interface Station {
  id: number;
  name: StationName;
  paddocks: Paddock[];
}

export interface PlayerState {
  id: string;
  displayName: string;
  isAI: boolean;
  stationId: number;
  money: number;
  trackPosition: number;
  sheepInHand: number; // sheep not yet placed on paddocks
  improvementTiles: ImprovementTileType[];
  hasPassedWoolSale: boolean;
}

export type ImprovementTileType = 'shearing_shed' | 'fence' | 'well' | 'irrigation';

export interface Card {
  id: string;
  type: string;
  title: string;
  effect: string;
}

export interface MarketState {
  woolPrice: number;
  sheepPrice: number;
}

export type GamePhase = 'roll' | 'move' | 'action' | 'station' | 'event' | 'next_turn';

export interface GameState {
  board: {
    trackSpaces: TrackSpace[];
    stations: Station[];
    trackLength: number;
  };
  players: PlayerState[];
  currentPlayerIndex: number;
  phase: GamePhase;
  diceRoll: number | null;
  decks: {
    tuckerBag: Card[];
    stockSale: Card[];
    studRam: Card[];
  };
  market: MarketState;
  events: { message: string; timestamp: number }[];
  winnerId: string | null;
}
