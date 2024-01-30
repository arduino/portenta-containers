import react from "@vitejs/plugin-react";
import eslintPlugin from "vite-plugin-eslint";

export default {
  plugins: [eslintPlugin({}), react()],
  server: {
    port: 3002,
    proxy: {
      // "/api": "http://127.0.0.1:1323",
      // '/api': 'http://192.168.8.1' // Board IP
      // '/api': 'http://192.168.178.98:1323' // External IP
      "/api": "http://10.0.0.21",
      "/api/shell": {
        target: "http://10.0.0.21",
        changeOrigin: true,
        ws: true,
      },
    },
  },
};
