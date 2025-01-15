import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    root: 'src/frontend',
    plugins: [vue()],
    server: {
        proxy: {
            '/api/': {
                target: 'https://archioweb-incrementalgame.onrender.com/',
                changeOrigin: true,
                secure: false
            }
        },
    },
    build: {
        outDir: '../../dist',
    },
});