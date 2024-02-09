import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import svgr from "vite-plugin-svgr";


// https://vitejs.dev/config/
export default defineConfig((config) => {
  const env = loadEnv(config?.mode, process.cwd(), "VITE");

  return {
    plugins: [react(), svgr()],
    server: {
      port: 3002,
      proxy: {
        "/api": env.VITE_API_PROXY_TARGET,
        "/api/shell": {
          target: env.VITE_API_PROXY_TARGET,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
