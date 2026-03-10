import { describe, it, expect } from "vitest";
import {
  resolveCollectWool,
  resolveWoolSale,
  resolveTuckerBag,
  resolveStockSale,
  resolveStudRam,
  resolveLoan,
} from "./events";
import { createInitialGameState } from "./engine";
import type { GameState } from "./types";

describe("resolveCollectWool", () => {
  it("income equals sheep in shearing-shed paddocks times wool price", () => {
    const state = createInitialGameState([{ displayName: "P", isAI: false }]);
    state.board.stations[0].paddocks[0].improvement = "shearing_shed";
    state.board.stations[0].paddocks[0].sheepCount = 5;
    state.board.stations[0].paddocks[1].improvement = "shearing_shed";
    state.board.stations[0].paddocks[1].sheepCount = 3;

    const next = resolveCollectWool(state, 0);
    expect(next.players[0].money).toBe(2000 + 8 * 10); // 8 sheep * $10
    expect(next.events.length).toBe(1);
    expect(next.events[0].message).toContain("collected $80");
  });

  it("no income without shearing sheds", () => {
    const state = createInitialGameState([{ displayName: "P", isAI: false }]);

    const next = resolveCollectWool(state, 0);
    expect(next.players[0].money).toBe(2000);
  });
});

describe("resolveWoolSale", () => {
  it("only applies when hasPassedWoolSale", () => {
    const state = createInitialGameState([{ displayName: "P", isAI: false }]);
    state.players[0].hasPassedWoolSale = false;

    const next = resolveWoolSale(state, 0);
    expect(next.players[0].money).toBe(2000);
  });

  it("adds income and resets hasPassedWoolSale", () => {
    const state = createInitialGameState([{ displayName: "P", isAI: false }]);
    state.players[0].hasPassedWoolSale = true;
    state.board.stations[0].paddocks[0].improvement = "shearing_shed";
    state.board.stations[0].paddocks[0].sheepCount = 3;

    const next = resolveWoolSale(state, 0);
    expect(next.players[0].money).toBe(2030);
    expect(next.players[0].hasPassedWoolSale).toBe(false);
  });
});

describe("resolveTuckerBag", () => {
  it("Good Season adds $100", () => {
    const state = createInitialGameState([{ displayName: "P", isAI: false }]);
    state.decks.tuckerBag = [
      {
        id: "1",
        type: "tucker_bag",
        title: "Good Season",
        effect: "Gain $100",
      },
    ];

    const next = resolveTuckerBag(state, 0);
    expect(next.players[0].money).toBe(2100);
    expect(next.decks.tuckerBag).toHaveLength(0);
  });

  it("Flood adds $200", () => {
    const state = createInitialGameState([{ displayName: "P", isAI: false }]);
    state.decks.tuckerBag = [
      { id: "1", type: "tucker_bag", title: "Flood", effect: "Gain relief" },
    ];

    const next = resolveTuckerBag(state, 0);
    expect(next.players[0].money).toBe(2200);
  });

  it("Drought reduces unirrigated paddock sheep by 2", () => {
    const state = createInitialGameState([{ displayName: "P", isAI: false }]);
    state.decks.tuckerBag = [
      { id: "1", type: "tucker_bag", title: "Drought", effect: "Lose sheep" },
    ];
    state.board.stations[0].paddocks[0].sheepCount = 5;
    state.board.stations[0].paddocks[0].irrigated = false;
    state.board.stations[0].paddocks[1].sheepCount = 3;
    state.board.stations[0].paddocks[1].irrigated = true;

    const next = resolveTuckerBag(state, 0);
    expect(next.board.stations[0].paddocks[0].sheepCount).toBe(3);
    expect(next.board.stations[0].paddocks[1].sheepCount).toBe(3);
  });
});

describe("resolveStockSale", () => {
  it("Wool Price Up increases wool price", () => {
    const state = createInitialGameState([{ displayName: "P", isAI: false }]);
    state.decks.stockSale = [
      { id: "1", type: "stock_sale", title: "Wool Price Up", effect: "+$2" },
    ];

    const next = resolveStockSale(state, 0);
    expect(next.market.woolPrice).toBe(12);
  });

  it("Wool Price Down decreases wool price", () => {
    const state = createInitialGameState([{ displayName: "P", isAI: false }]);
    state.decks.stockSale = [
      { id: "1", type: "stock_sale", title: "Wool Price Down", effect: "-$2" },
    ];

    const next = resolveStockSale(state, 0);
    expect(next.market.woolPrice).toBe(8);
  });

  it("Sheep Price Up increases sheep price", () => {
    const state = createInitialGameState([{ displayName: "P", isAI: false }]);
    state.decks.stockSale = [
      { id: "1", type: "stock_sale", title: "Sheep Price Up", effect: "+$1" },
    ];

    const next = resolveStockSale(state, 0);
    expect(next.market.sheepPrice).toBe(6);
  });

  it("returns state unchanged when deck empty", () => {
    const state = createInitialGameState([{ displayName: "P", isAI: false }]);
    state.decks.stockSale = [];

    const next = resolveStockSale(state, 0);
    expect(next).toBe(state);
  });
});

describe("resolveStudRam", () => {
  it("adds sheep based on total flock", () => {
    const state = createInitialGameState([{ displayName: "P", isAI: false }]);
    state.decks.studRam = [
      { id: "1", type: "stud_ram", title: "Stud Ram", effect: "Breed" },
    ];
    state.board.stations[0].paddocks[0].sheepCount = 9;
    state.board.stations[0].paddocks[1].sheepCount = 6;

    const next = resolveStudRam(state, 0);
    const totalSheep = next.board.stations[0].paddocks.reduce(
      (s, p) => s + p.sheepCount,
      0,
    );
    expect(totalSheep).toBeGreaterThan(15);
    expect(next.events[0].message).toContain("Stud Ram");
  });
});

describe("resolveLoan", () => {
  it("adds $500", () => {
    const state = createInitialGameState([{ displayName: "P", isAI: false }]);

    const next = resolveLoan(state, 0);
    expect(next.players[0].money).toBe(2500);
    expect(next.events[0].message).toContain("loan");
  });
});
