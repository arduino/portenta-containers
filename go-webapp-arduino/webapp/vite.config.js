import react from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint';

export default {
  plugins: [eslintPlugin({ fix: true }), react()],
  server: {
    proxy: {
      '/api': 'http://localhost:1323'
      // '/api': 'http://192.168.178.98:1323'
    }
  }
}