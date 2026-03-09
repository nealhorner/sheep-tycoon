import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { createInitialGameState } from "@/lib/game/engine";
import { broadcastToLobby } from "@/lib/sse";

const startSchema = z.object({
  hostName: z.string().min(1).max(50),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lobbyId } = await params;
    const body = await request.json().catch(() => ({}));
    const { hostName } = startSchema.parse(body);

    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: { players: { orderBy: { joinedAt: "asc" } } },
    });

    if (!lobby) {
      return NextResponse.json({ error: "Lobby not found" }, { status: 404 });
    }

    if (lobby.hostName.toLowerCase() !== hostName.toLowerCase()) {
      return NextResponse.json(
        { error: "Only the host can start the game" },
        { status: 403 }
      );
    }

    if (lobby.status !== "WAITING") {
      return NextResponse.json(
        { error: "Game has already started" },
        { status: 400 }
      );
    }

    const allReady = lobby.players.every((p) => p.ready);
    if (!allReady) {
      return NextResponse.json(
        { error: "All players must be ready to start" },
        { status: 400 }
      );
    }

    if (lobby.players.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 players to start" },
        { status: 400 }
      );
    }

    const playerConfigs = lobby.players.map((p) => ({
      displayName: p.displayName,
      isAI: false,
    }));

    const gameState = createInitialGameState(
      playerConfigs,
      lobby.startingMoney
    );

    const game = await prisma.game.create({
      data: {
        lobbyId,
        gameState: gameState as object,
        status: "ACTIVE",
        currentTurn: 0,
      },
    });

    await prisma.lobby.update({
      where: { id: lobbyId },
      data: { status: "STARTING" },
    });

    broadcastToLobby(lobbyId, {
      type: "game_started",
      gameId: game.id,
    });

    return NextResponse.json({ gameId: game.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Failed to start game:", error);
    return NextResponse.json(
      { error: "Failed to start game" },
      { status: 500 }
    );
  }
}
