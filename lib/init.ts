// Initialize polling on server startup
import { startPolling } from './polling';

// Only initialize on server side
if (typeof window === 'undefined') {
  console.log('\n[Init] 🚀 Initializing Polymarket Dashboard...');
  console.log('[Init] 📦 Starting background polling system...');
  // Start polling when this module is imported
  startPolling();
} else {
  console.log('[Init] ⚠️  Skipping server-side initialization (client-side)');
}

