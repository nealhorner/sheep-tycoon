import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { broadcastToLobby } from "@/lib/sse";

const joinSchema = z.object({
  displayName: z.string().min(1).max(50),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lobbyId } = await params;
    const body = await request.json().catch(() => ({}));
    const { displayName } = joinSchema.parse(body);

    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: { players: true },
    });

    if (!lobby) {
      return NextResponse.json({ error: "Lobby not found" }, { status: 404 });
    }

    if (lobby.status !== "WAITING") {
      return NextResponse.json(
        { error: "Lobby has already started" },
        { status: 400 }
      );
    }

    if (lobby.players.length >= lobby.maxPlayers) {
      return NextResponse.json(
        { error: "Lobby is full" },
        { status: 400 }
      );
    }

    const existing = lobby.players.find(
      (p) => p.displayName.toLowerCase() === displayName.toLowerCase()
    );
    if (existing) {
      return NextResponse.json(
        { error: "A player with that name is already in the lobby" },
        { status: 400 }
      );
    }

    await prisma.lobbyPlayer.create({
      data: {
        lobbyId,
        displayName,
        ready: false,
      },
    });

    const updated = await prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: { players: { orderBy: { joinedAt: "asc" } } },
    });

    if (updated) {
      broadcastToLobby(lobbyId, {
        type: "lobby_update",
        lobby: {
          id: updated.id,
          hostName: updated.hostName,
          status: updated.status,
          maxPlayers: updated.maxPlayers,
          startingMoney: updated.startingMoney,
          players: updated.players.map((p) => ({
            id: p.id,
            displayName: p.displayName,
            ready: p.ready,
            joinedAt: p.joinedAt,
          })),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Failed to join lobby:", error);
    return NextResponse.json(
      { error: "Failed to join lobby" },
      { status: 500 }
    );
  }
}
