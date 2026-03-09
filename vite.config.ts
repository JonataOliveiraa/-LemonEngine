// vite.config.ts
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // O 'base' como './' força o Vite a usar caminhos relativos na hora do build.
      // Isso é perfeito para o GitHub Pages, pois o app vai funcionar 
      // independente do nome da pasta ou repositório onde for hospedado.
      base: './', 
      
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          // Seu alias atual: mapeia o '@' para a raiz do projeto.
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});