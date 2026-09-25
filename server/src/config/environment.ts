import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const findDataDir = () => {
  const candidates = [
    path.resolve(process.cwd(), 'data'),
    path.resolve(process.cwd(), '../data'),
    path.resolve(__dirname, '../../data'),
    path.resolve(__dirname, '../../../data'),
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
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/vayusutra',
  SCRAPER_MODE: (process.env.SCRAPER_MODE || 'DEMO') as 'LIVE' | 'DEMO',
  PLAYWRIGHT_HEADLESS: process.env.PLAYWRIGHT_HEADLESS !== 'false',
  RATE_LIMIT_RPS: parseFloat(process.env.RATE_LIMIT_RPS || '1.5'),
  DATA_DIR: resolvedDataDir,
  OFFICIAL_DATA_DIR: path.resolve(resolvedDataDir, 'official'),
  PROCESSED_DATA_DIR: path.resolve(resolvedDataDir, 'processed'),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
