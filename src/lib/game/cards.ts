import { v4 as uuidv4 } from "uuid";
import type { Card } from "./types";

function makeCard(type: string, title: string, effect: string): Card {
  return { id: uuidv4(), type, title, effect };
}

export function createDecks(): {
  tuckerBag: Card[];
  stockSale: Card[];
  studRam: Card[];
} {
  const fireFighting = makeCard(
    "tucker_bag",
    "Fire Fighting Equipment",
    "Prevent bushfire damage",
  );

  const tuckerBagTemplates = [
    { title: "Drought", effect: "Lose 2 sheep from each unirrigated paddock" },
    { title: "Flood", effect: "Gain $200 from relief" },
    { title: "Bushfire", effect: "Lose 1 sheep from each paddock" },
    { title: "Disease", effect: "Lose 1 sheep from your largest flock" },
    { title: "Good Season", effect: "Gain $100" },
  ];

  const tuckerBag: Card[] = [
    fireFighting,
    ...Array.from({ length: 21 }, (_, i) =>
      makeCard(
        "tucker_bag",
        tuckerBagTemplates[i % tuckerBagTemplates.length].title,
        tuckerBagTemplates[i % tuckerBagTemplates.length].effect,
      ),
    ),
  ];

  const stockSaleTemplates = [
    { title: "Wool Price Up", effect: "Wool +$2" },
    { title: "Wool Price Down", effect: "Wool -$2" },
    { title: "Sheep Price Up", effect: "Sheep +$1" },
    { title: "Sheep Price Down", effect: "Sheep -$1" },
  ];

  const stockSale: Card[] = Array.from({ length: 26 }, (_, i) =>
    makeCard(
      "stock_sale",
      stockSaleTemplates[i % stockSaleTemplates.length].title,
      stockSaleTemplates[i % stockSaleTemplates.length].effect,
    ),
  );

  const studRam: Card[] = Array.from({ length: 5 }, () =>
    makeCard("stud_ram", "Stud Ram", "Breed extra sheep"),
  );

  return { tuckerBag, stockSale, studRam };
}

export function drawCard<T extends Card>(
  deck: T[],
  count = 1,
): { card: T | null; deck: T[] } {
  if (deck.length === 0) return { card: null, deck };
  const [card, ...rest] = deck;
  return { card: card ?? null, deck: rest };
}
