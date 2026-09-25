import mongoose from 'mongoose';
import { ENV } from './environment.js';

let isConnected = false;
let isInMemory = false;
let connectionError: string | null = null;

export async function connectDatabase(): Promise<{ isConnected: boolean; isInMemory: boolean; uri: string }> {
  try {
    mongoose.set('strictQuery', false);
    mongoose.set('bufferCommands', false);

    // If MONGODB_URI is provided, attempt connection with a 4-second timeout
    if (ENV.MONGODB_URI && !ENV.MONGODB_URI.includes('<db_username>')) {
      await mongoose.connect(ENV.MONGODB_URI, {
        serverSelectionTimeoutMS: 4000,
      });

      isConnected = true;
      isInMemory = false;
      connectionError = null;
      console.log(`[MongoDB] Successfully connected to MongoDB database.`);
      return { isConnected: true, isInMemory: false, uri: 'MONGODB_CONNECTED' };
    } else {
      throw new Error('MONGODB_URI is not configured with valid credentials.');
    }
  } catch (err: any) {
    connectionError = err.message;
    console.warn(`[MongoDB Warning] Direct MongoDB connection failed: ${err.message}`);

    if (ENV.SCRAPER_MODE === 'LIVE') {
      console.error(`[MongoDB Error] SCRAPER_MODE=LIVE requires an active MongoDB database. Operating without persistent storage is prohibited in LIVE mode.`);
      isConnected = false;
      isInMemory = false;
      return { isConnected: false, isInMemory: false, uri: 'UNAVAILABLE' };
    }

    // In DEMO mode, permit calibrated demo memory store with explicit warning
    console.warn(`[MongoDB Warning] Operating in standalone calibrated DEMO store mode (permitted ONLY for DEMO / SIMULATION).`);
    isConnected = false;
    isInMemory = true;
    return { isConnected: false, isInMemory: true, uri: 'STANDALONE_DEMO_STORE' };
  }
}

export function getDatabaseStatus() {
  const isMongoReady = mongoose.connection.readyState === 1;

  return {
    status: isMongoReady ? 'CONNECTED' : (isInMemory ? 'DEMO_STANDALONE' : 'DISCONNECTED'),
    isConnected: isMongoReady,
    readyState: mongoose.connection.readyState,
    isInMemory,
    requiredForLive: true,
    activeMode: ENV.SCRAPER_MODE,
    error: connectionError,
    storageType: isMongoReady ? 'MongoDB' : (isInMemory ? 'InMemoryDemoStore' : 'None'),
  };
}
