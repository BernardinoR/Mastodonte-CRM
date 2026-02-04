import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./client/src/test/setup.ts"],
    include: ["client/src/**/*.{test,spec}.{ts,tsx}", "server/**/*.{test,spec}.ts"],
    css: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@features": path.resolve(import.meta.dirname, "client", "src", "features"),
      "@app": path.resolve(import.meta.dirname, "client", "src", "app"),
      "@shared": path.resolve(import.meta.dirname, "client", "src", "shared"),
    },
  },
});
