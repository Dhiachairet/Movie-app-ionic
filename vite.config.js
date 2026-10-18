import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 8100,
  },
  build: {
    // Firebase est une grosse librairie, on évite l'avertissement
    chunkSizeWarningLimit: 1000,
  },
});
