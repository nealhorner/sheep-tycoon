import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { broadcastToLobby } from "@/lib/sse";

const readySchema = z.object({
  displayName: z.string().min(1).max(50),
  ready: z.boolean(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lobbyId } = await params;
    const body = await request.json().catch(() => ({}));
    const { displayName, ready } = readySchema.parse(body);

    const player = await prisma.lobbyPlayer.findFirst({
      where: {
        lobbyId,
        displayName: { equals: displayName, mode: "insensitive" },
      },
      include: { lobby: true },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Player not found in lobby" },
        { status: 404 }
      );
    }

    await prisma.lobbyPlayer.update({
      where: { id: player.id },
      data: { ready },
    });

    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: { players: { orderBy: { joinedAt: "asc" } } },
    });

    if (lobby) {
      broadcastToLobby(lobbyId, {
        type: "lobby_update",
        lobby: {
          id: lobby.id,
          hostName: lobby.hostName,
          status: lobby.status,
          maxPlayers: lobby.maxPlayers,
          startingMoney: lobby.startingMoney,
          players: lobby.players.map((p) => ({
            id: p.id,
            displayName: p.displayName,
            ready: p.ready,
            joinedAt: p.joinedAt,
          })),
        },
      });
    }

    return NextResponse.json({ success: true, ready });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Failed to toggle ready:", error);
    return NextResponse.json(
      { error: "Failed to toggle ready" },
      { status: 500 }
    );
  }
}
