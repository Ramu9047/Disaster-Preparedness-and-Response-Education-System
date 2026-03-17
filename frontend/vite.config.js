import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    react(),
    // Serve the standalone HTML pages from the root Disaster/ directory
    {
      name: 'serve-static-html-pages',
      configureServer(server) {
        server.middlewares.use('/pages', (req, res, next) => {
          const fileName = req.url.replace(/^\//, '') || 'index.html';
          const filePath = path.resolve(__dirname, '..', fileName);
          if (fs.existsSync(filePath)) {
            const ext = path.extname(filePath);
            const mimeTypes = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            fs.createReadStream(filePath).pipe(res);
          } else {
            next();
          }
        });
      }
    }
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
})

