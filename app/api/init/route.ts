// API route to trigger initialization
// This is called automatically on server startup via server.js
// Auto-initializes when module is loaded (server-side only)
import { startPolling } from '@/lib/polling';

let initialized = false;

// Auto-initialize when this module is loaded (server-side only)
// This runs when Next.js loads the route module
if (typeof window === 'undefined') {
  // Use setImmediate to ensure this runs after module is fully loaded
  setImmediate(() => {
    if (!initialized) {
      try {
        startPolling();
        initialized = true;
        console.log('[Init API] ✅ Polling started via auto-initialization');
      } catch (error: any) {
        console.error('[Init API] ❌ Failed to start polling:', error.message);
        console.error('[Init API] Stack:', error.stack);
      }
    }
  });
}

export async function GET() {
  if (!initialized) {
    try {
      startPolling();
      initialized = true;
      return Response.json({ success: true, message: 'Initialization started' });
    } catch (error: any) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }
  return Response.json({ success: true, message: 'Already initialized' });
}

