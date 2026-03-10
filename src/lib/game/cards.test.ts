import { describe, it, expect } from "vitest";
import { createDecks, drawCard } from "./cards";

describe("createDecks", () => {
  it("returns correct card counts", () => {
    const decks = createDecks();
    expect(decks.tuckerBag).toHaveLength(22);
    expect(decks.stockSale).toHaveLength(26);
    expect(decks.studRam).toHaveLength(5);
  });

  it("Fire Fighting Equipment is first in tucker bag", () => {
    const decks = createDecks();
    expect(decks.tuckerBag[0].title).toBe("Fire Fighting Equipment");
  });
});

describe("drawCard", () => {
  it("returns card and shortened deck", () => {
    const deck = [
      { id: "1", type: "x", title: "A", effect: "" },
      { id: "2", type: "x", title: "B", effect: "" },
    ];
    const { card, deck: newDeck } = drawCard(deck);
    expect(card?.title).toBe("A");
    expect(newDeck).toHaveLength(1);
    expect(newDeck[0].title).toBe("B");
  });

  it("returns null and empty deck when deck is empty", () => {
    const { card, deck: newDeck } = drawCard([]);
    expect(card).toBeNull();
    expect(newDeck).toHaveLength(0);
  });
});
