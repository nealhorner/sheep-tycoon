import { describe, it, expect } from 'vitest';
import { getTrackPositions } from './trackUtils';

describe('getTrackPositions', () => {
  it('returns correct count of positions', () => {
    const points = getTrackPositions(100, 100, 50, 24);
    expect(points).toHaveLength(24);
  });

  it('positions lie on circle of given radius', () => {
    const cx = 100;
    const cy = 100;
    const radius = 50;
    const points = getTrackPositions(cx, cy, radius, 24);
    points.forEach((p) => {
      const dist = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
      expect(Math.abs(dist - radius)).toBeLessThan(0.001);
    });
  });

  it('first point is at top of circle', () => {
    const cx = 100;
    const cy = 100;
    const radius = 50;
    const points = getTrackPositions(cx, cy, radius, 24);
    expect(points[0].x).toBeCloseTo(cx, 5);
    expect(points[0].y).toBeCloseTo(cy - radius, 5);
  });
});
