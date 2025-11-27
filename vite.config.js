import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: 'index.html',
                login: './src/auth/login.html',
                home: './src/home/home.html',
                profile: './src/profile/profile.html'
            }
        }
    }
});