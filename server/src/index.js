import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { ENV } from './config/environment.js';
import { connectDatabase } from './config/database.js';
import { apiRouter } from './routes/apiRouter.js';

const currentDir = import.meta.dirname || path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(currentDir, '../../client/dist');

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Serve static frontend bundle if present
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // Fallback informational endpoint
  app.get('/', (req, res) => {
    res.json({
      platform: 'Aerostat APIx - National Airfare Intelligence & Inflation Decision Platform',
      status: 'ONLINE',
      version: '2.0.0',
      documentation: '/api/health',
      clientApp: ENV.CLIENT_URL,
      statutoryClient: 'Ministry of Statistics & Programme Implementation (MoSPI) / RBI / DGCA',
      activeMode: ENV.SCRAPER_MODE,
    });
  });
}

// Start Server
async function startServer() {
  await connectDatabase();

  app.listen(ENV.PORT, () => {
    console.log(`================================================================`);
    console.log(` Aerostat APIx Production Node.js Server`);
    console.log(` Listening on: http://localhost:${ENV.PORT}`);
    console.log(` Active Mode : ${ENV.SCRAPER_MODE}`);
    console.log(` Database    : ${ENV.MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);
    console.log(` Static SPA  : ${fs.existsSync(clientDist) ? 'Mounted (/client/dist)' : 'Not built'}`);
    console.log(`================================================================`);
  });
}

startServer().catch(err => {
  console.error('[Server Error] Startup failed:', err);
});
