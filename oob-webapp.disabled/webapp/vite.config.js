import react from '@vitejs/plugin-react';
import eslintPlugin from 'vite-plugin-eslint';

export default {
  plugins: [eslintPlugin({ fix: true }), react()],
  server: {
    proxy: {
      '/api': 'http://localhost:1323'
    }
  }
}