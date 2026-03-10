import { NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/db/prisma";

const createLobbySchema = z.object({
  hostName: z.string().min(1).max(50),
  maxPlayers: z.number().min(2).max(6).default(6),
  startingMoney: z.number().min(1000).max(10000).default(2000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { hostName, maxPlayers, startingMoney } =
      createLobbySchema.parse(body);

    const shortId = uuidv4().slice(0, 8);

    const lobby = await prisma.lobby.create({
      data: {
        id: shortId,
        hostName,
        status: "WAITING",
        maxPlayers,
        startingMoney,
      },
    });

    await prisma.lobbyPlayer.create({
      data: {
        lobbyId: lobby.id,
        displayName: hostName,
        ready: false,
      },
    });

    return NextResponse.json({
      lobbyId: lobby.id,
      maxPlayers,
      startingMoney,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    console.error("Failed to create lobby:", error);
    return NextResponse.json(
      { error: "Failed to create lobby" },
      { status: 500 },
    );
  }
}
