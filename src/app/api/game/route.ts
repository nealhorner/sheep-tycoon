import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { createInitialGameState } from "@/lib/game/engine";

const createSoloSchema = z.object({
  displayName: z.string().min(1).max(50).default("Player"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { displayName } = createSoloSchema.parse(body);

    const gameState = createInitialGameState([
      { displayName, isAI: false },
      { displayName: "Computer", isAI: true },
    ]);

    const game = await prisma.game.create({
      data: {
        gameState: gameState as object,
        status: "ACTIVE",
        currentTurn: 0,
      },
    });

    return NextResponse.json({ gameId: game.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Failed to create game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 }
    );
  }
}
