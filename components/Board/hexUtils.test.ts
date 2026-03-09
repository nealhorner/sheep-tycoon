import { describe, it, expect } from "vitest";
import { hexToPixel, pixelToHex, getHexCorners } from "./hexUtils";

describe("getHexCorners", () => {
  it("returns 6 corners", () => {
    const corners = getHexCorners(100, 100, 50);
    expect(corners).toHaveLength(6);
  });

  it("corners are at correct distance from center", () => {
    const cx = 100;
    const cy = 100;
    const size = 50;
    const corners = getHexCorners(cx, cy, size);
    corners.forEach((c) => {
      const dist = Math.sqrt((c.x - cx) ** 2 + (c.y - cy) ** 2);
      expect(Math.abs(dist - size)).toBeLessThan(0.001);
    });
  });
});

describe("hexToPixel and pixelToHex", () => {
  it("hexToPixel converts correctly", () => {
    const p = hexToPixel({ q: 0, r: 0 }, 10);
    expect(p.x).toBeCloseTo(0, 5);
    expect(p.y).toBeCloseTo(0, 5);
  });

  it("round-trip preserves hex for integer coords", () => {
    const size = 10;
    const hex = { q: 2, r: 1 };
    const pixel = hexToPixel(hex, size);
    const back = pixelToHex(pixel.x, pixel.y, size);
    expect(back.q).toBe(hex.q);
    expect(back.r).toBe(hex.r);
  });
});
