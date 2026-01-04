import { defineConfig } from 'vite';

export default defineConfig({
    // Configuração do servidor de desenvolvimento
    server: {
        port: 5173,
        host: true, // Permite acesso via rede local (importante para testar no celular)
        https: false // Mude para true se precisar de HTTPS local
    },

    // Configuração de build
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true
    },

    // Resolve de caminhos
    resolve: {
        alias: {
            '@': '/src'
        }
    }
});
