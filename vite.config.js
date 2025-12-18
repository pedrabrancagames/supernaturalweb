import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    basicSsl() // HTTPS necessário para WebXR
  ],
  server: {
    https: true,
    host: true, // Permite acesso via IP local para testar no celular
    port: 5173
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
