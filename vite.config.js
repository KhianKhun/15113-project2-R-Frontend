import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // dev server proxy only (local dev)
  const proxyTarget =
    env.VITE_API_BASE_URL || "https://one5113-project2-r-backend.onrender.com";

  return {
    plugins: [react()],

    base: "/15113-project2-R-Frontend/",
    
    build: {
      outDir: "docs",
      emptyOutDir: true,
    },


    server: {
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  };
});