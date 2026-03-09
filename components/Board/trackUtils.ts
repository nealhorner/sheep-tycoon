// Track space positioning for monopoly-style board

export interface TrackPoint {
  x: number;
  y: number;
  angle: number; // for orienting space labels
}

export function getTrackPositions(
  centerX: number,
  centerY: number,
  radius: number,
  count: number
): TrackPoint[] {
  const points: TrackPoint[] = [];
  const startAngle = -Math.PI / 2; // Start at top

  for (let i = 0; i < count; i++) {
    const angle = startAngle + (2 * Math.PI * i) / count;
    points.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle: angle + Math.PI / 2,
    });
  }
  return points;
}
