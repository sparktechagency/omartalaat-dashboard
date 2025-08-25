import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "69.62.78.16",
    // host: "10.10.7.48",
    port: 5000,
  },
});
