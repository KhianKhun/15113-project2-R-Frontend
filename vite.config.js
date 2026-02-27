import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // dev server proxy only (local dev)
  const proxyTarget =
    env.VITE_API_BASE_URL || "https://one5113-project2-r-backend.onrender.com";

  return {
    plugins: [react()],

    // ✅ GitHub Pages 项目站点必须设置 base
    base: "/15113-project2-R-Frontend/",

    // ✅ 输出到 docs，方便 Pages 直接选 /docs
    build: {
      outDir: "docs",
      emptyOutDir: true,
    },

    // ✅ 本地开发时才会用到
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