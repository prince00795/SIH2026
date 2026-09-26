import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const currentDir = import.meta.dirname || path.dirname(fileURLToPath(import.meta.url));

const findDataDir = () => {
  const candidates = [
    path.resolve(process.cwd(), 'data'),
    path.resolve(process.cwd(), '../data'),
    path.resolve(currentDir, '../../data'),
    path.resolve(currentDir, '../../../data'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.resolve(process.cwd(), 'data');
};

const resolvedDataDir = findDataDir();

export const ENV = {
  PORT: parseInt(process.env.PORT || '8000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/aerostat',
  SCRAPER_MODE: process.env.SCRAPER_MODE || 'DEMO',
  PLAYWRIGHT_HEADLESS: process.env.PLAYWRIGHT_HEADLESS !== 'false',
  RATE_LIMIT_RPS: parseFloat(process.env.RATE_LIMIT_RPS || '1.5'),
  DATA_DIR: resolvedDataDir,
  OFFICIAL_DATA_DIR: path.resolve(resolvedDataDir, 'official'),
  PROCESSED_DATA_DIR: path.resolve(resolvedDataDir, 'processed'),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
