import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// 기존 repo(mrv-frontend)와 동일하게 Tailwind v4 Vite 플러그인 + React 사용.
export default defineConfig({
  // GitHub Pages는 https://<org>.github.io/<repo>/ 하위 경로로 서빙되므로 base 지정 필요.
  base: '/mrv_mockup/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
