import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: gameId } = await context.params;

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json({
      gameId: game.id,
      status: game.status,
      gameState: game.gameState,
    });
  } catch (error) {
    console.error('Failed to get game:', error);
    return NextResponse.json({ error: 'Failed to get game' }, { status: 500 });
  }
}
