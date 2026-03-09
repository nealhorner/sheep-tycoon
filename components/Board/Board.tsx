"use client";

import { useRef, useEffect, useState } from "react";
import type { GameState } from "@/lib/game/types";
import { getHexCorners } from "./hexUtils";
import { getTrackPositions } from "./trackUtils";

const STATION_COLORS = [
  "#d4a574", // Coorumbene - tan
  "#9caf88", // Wanbanalong - sage
  "#b8a99a", // Emu Plains - stone
  "#a67c52", // Mt Mitchell - brown
  "#c9b896", // Warramboo - wheat
  "#8b9a6b", // Coolibah Creek - olive
];

const PLAYER_TOKEN_COLORS = [
  "#e63946", // red
  "#1d3557", // navy
  "#2a9d8f", // teal
  "#e9c46a", // gold
  "#9b5de5", // purple
  "#00b4d8", // cyan
];

interface BoardProps {
  gameState: GameState;
  width?: number;
  height?: number;
  onPaddockClick?: (stationId: number, paddockIndex: number) => void;
}

export default function Board({
  gameState,
  width = 700,
  height = 700,
}: BoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width: w } = entries[0]?.contentRect ?? {};
      if (w && w > 0) {
        const size = Math.min(w, 700);
        setDimensions({ width: size, height: size });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = dimensions.width;
    const h = dimensions.height;
    const dpr = window.devicePixelRatio ?? 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const centerX = w / 2;
    const centerY = h / 2;

    // Clear
    ctx.fillStyle = "#f6f5f0";
    ctx.fillRect(0, 0, w, h);

    // Draw track (outer ring)
    const trackRadius = Math.min(w, h) * 0.42;
    const trackSpaces = gameState.board.trackSpaces;
    const trackPoints = getTrackPositions(
      centerX,
      centerY,
      trackRadius,
      trackSpaces.length
    );

    ctx.strokeStyle = "#72644e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    trackPoints.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.stroke();

    // Track spaces
    const spaceSize = 28;
    trackPoints.forEach((point, i) => {
      const space = trackSpaces[i];
      ctx.save();
      ctx.translate(point.x, point.y);
      ctx.rotate(point.angle);

      ctx.fillStyle = space.type === "wool_sale" ? "#e9c46a" : "#fff";
      ctx.strokeStyle = "#72644e";
      ctx.lineWidth = 2;
      ctx.fillRect(-spaceSize / 2, -spaceSize / 2, spaceSize, spaceSize);
      ctx.strokeRect(-spaceSize / 2, -spaceSize / 2, spaceSize, spaceSize);

      if (space.label) {
        ctx.fillStyle = "#514639";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const words = space.label.split(" ");
        words.slice(0, 2).forEach((word, wi) => {
          ctx.fillText(word, 0, wi * 10 - (words.length > 1 ? 5 : 0));
        });
      }
      ctx.restore();
    });

    // Draw 6 stations (hexagonal) in a ring
    const stationRadius = 55;
    const hexRadius = trackRadius * 0.35;
    const stationHexes: { cx: number; cy: number; station: (typeof gameState.board.stations)[0] }[] = [];

    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const cx = centerX + hexRadius * Math.cos(angle);
      const cy = centerY + hexRadius * Math.sin(angle);
      stationHexes.push({
        cx,
        cy,
        station: gameState.board.stations[i],
      });
    }

    stationHexes.forEach(({ cx, cy, station }, stationIdx) => {
      const color = STATION_COLORS[stationIdx] ?? "#ccc";
      const corners = getHexCorners(cx, cy, stationRadius);

      ctx.fillStyle = color;
      ctx.strokeStyle = "#5f5343";
      ctx.lineWidth = 2;
      ctx.beginPath();
      corners.forEach((c, i) => {
        if (i === 0) ctx.moveTo(c.x, c.y);
        else ctx.lineTo(c.x, c.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Station name
      ctx.fillStyle = "#2d2420";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(station.name.split(" ")[0], cx, cy - 8);

      // Paddocks (5 small circles)
      const padRadius = 12;
      const padOffsets: [number, number][] = [
        [0, -22],
        [18, -8],
        [18, 14],
        [0, 22],
        [-18, 0],
      ];
      station.paddocks.forEach((pad, padIdx) => {
        const [dx, dy] = padOffsets[padIdx];
        const px = cx + dx;
        const py = cy + dy;

        ctx.fillStyle = pad.irrigated ? "#7cb8a8" : "#c4b896";
        ctx.beginPath();
        ctx.arc(px, py, padRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#5f5343";
        ctx.stroke();

        if (pad.sheepCount > 0) {
          ctx.fillStyle = "#2d2420";
          ctx.font = "12px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(String(pad.sheepCount), px, py);
        }
      });
    });

    // Player tokens on track
    gameState.players.forEach((player, playerIdx) => {
      const point = trackPoints[player.trackPosition];
      if (!point) return;
      const tokenColor = PLAYER_TOKEN_COLORS[playerIdx] ?? "#333";
      ctx.fillStyle = tokenColor;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [gameState, dimensions]);

  return (
    <div
      ref={containerRef}
      className="flex w-full justify-center overflow-auto"
    >
      <canvas
        ref={canvasRef}
        className="max-h-[85vh] w-full max-w-full rounded-xl border-2 border-outback-300 shadow-lg"
        style={{ aspectRatio: "1" }}
      />
    </div>
  );
}
