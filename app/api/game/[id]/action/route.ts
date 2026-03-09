import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import {
  processRoll,
  processMove,
} from "@/lib/game/engine";
import {
  resolveBuyImprovement,
  resolvePlaceImprovement,
  resolveIrrigate,
} from "@/lib/game/improvements";
import { runAITurn } from "@/lib/game/ai";
import type { GameState } from "@/lib/game/types";
import { broadcastToGame } from "@/lib/sse";

const actionSchema = z.object({
  action: z.enum([
    "roll",
    "move",
    "end_turn",
    "buy_improvement",
    "place_improvement",
    "irrigate",
    "ai_tick",
  ]),
  payload: z
    .object({
      tileType: z.enum(["shearing_shed", "fence", "well", "irrigation"]).optional(),
      paddockIndex: z.number().optional(),
    })
    .optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: gameId } = await params;
    const body = await request.json().catch(() => ({}));
    const { action, payload } = actionSchema.parse(body);

    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Game has ended" },
        { status: 400 }
      );
    }

    const state = game.gameState as unknown as GameState;
    const currentPlayer = state.players[state.currentPlayerIndex];

    if (!currentPlayer) {
      return NextResponse.json(
        { error: "Invalid game state" },
        { status: 500 }
      );
    }

    let newState = state;

    if (action === "ai_tick") {
      if (!state.players[state.currentPlayerIndex]?.isAI) {
        return NextResponse.json(
          { error: "Not AI turn" },
          { status: 400 }
        );
      }
      newState = runAITurn(state);
    }

    if (action === "roll") {
      if (state.phase !== "roll") {
        return NextResponse.json(
          { error: "Cannot roll in current phase" },
          { status: 400 }
        );
      }
      if (currentPlayer.isAI) {
        return NextResponse.json(
          { error: "AI turn" },
          { status: 400 }
        );
      }
      newState = processRoll(state);
      newState = processMove(newState, state.currentPlayerIndex);
    }

    if (action === "buy_improvement" && payload?.tileType) {
      if (state.phase !== "action" && state.phase !== "station") {
        return NextResponse.json(
          { error: "Cannot buy in current phase" },
          { status: 400 }
        );
      }
      if (currentPlayer.isAI) {
        return NextResponse.json({ error: "AI turn" }, { status: 400 });
      }
      newState = resolveBuyImprovement(state, state.currentPlayerIndex, payload.tileType);
    }

    if (action === "place_improvement" && payload?.tileType !== undefined && payload?.paddockIndex !== undefined) {
      if (state.phase !== "action" && state.phase !== "station") {
        return NextResponse.json(
          { error: "Cannot place in current phase" },
          { status: 400 }
        );
      }
      if (currentPlayer.isAI) {
        return NextResponse.json({ error: "AI turn" }, { status: 400 });
      }
      newState = resolvePlaceImprovement(
        state,
        state.currentPlayerIndex,
        payload.paddockIndex,
        payload.tileType
      );
    }

    if (action === "irrigate" && payload?.paddockIndex !== undefined) {
      if (state.phase !== "action" && state.phase !== "station") {
        return NextResponse.json(
          { error: "Cannot irrigate in current phase" },
          { status: 400 }
        );
      }
      if (currentPlayer.isAI) {
        return NextResponse.json({ error: "AI turn" }, { status: 400 });
      }
      newState = resolveIrrigate(state, state.currentPlayerIndex, payload.paddockIndex);
    }

    if (action === "end_turn") {
      if (state.phase !== "action" && state.phase !== "station") {
        return NextResponse.json(
          { error: "Cannot end turn in current phase" },
          { status: 400 }
        );
      }
      if (currentPlayer.isAI) {
        return NextResponse.json(
          { error: "AI turn" },
          { status: 400 }
        );
      }
      const nextIndex =
        (state.currentPlayerIndex + 1) % state.players.length;
      newState = {
        ...state,
        currentPlayerIndex: nextIndex,
        phase: "roll",
        diceRoll: null,
      };

      while (
        newState.players[newState.currentPlayerIndex]?.isAI
      ) {
        newState = runAITurn(newState);
      }
    }

    await prisma.game.update({
      where: { id: gameId },
      data: {
        gameState: newState as object,
        currentTurn: game.currentTurn + 1,
      },
    });

    broadcastToGame(gameId, { gameState: newState });

    return NextResponse.json({ gameState: newState });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    console.error("Failed to process action:", error);
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}
