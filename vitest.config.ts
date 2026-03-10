import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: [
      "src/lib/**/*.test.ts",
      "src/lib/**/*.test.tsx",
      "src/app/api/**/*.test.ts",
      "src/components/**/*.test.ts",
      "src/components/**/*.test.tsx",
    ],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
