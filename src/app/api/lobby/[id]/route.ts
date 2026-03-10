import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: lobbyId } = await params;

    const lobby = await prisma.lobby.findUnique({
      where: { id: lobbyId },
      include: {
        players: {
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!lobby) {
      return NextResponse.json({ error: 'Lobby not found' }, { status: 404 });
    }

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Failed to get lobby:', error);
    return NextResponse.json({ error: 'Failed to get lobby' }, { status: 500 });
  }
}
