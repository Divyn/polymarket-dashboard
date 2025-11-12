// JavaScript version for server.js to require
// This file can be safely required from server.js without TypeScript compilation issues

// Only initialize on server side
if (typeof window === 'undefined') {
  // Start polling asynchronously to avoid blocking server startup
  // Use dynamic import to handle TypeScript modules properly
  setTimeout(async () => {
    try {
      // Use dynamic import which works with TypeScript/ES modules
      // This will work with Next.js's compiled output
      const pollingModule = await import('./polling');
      
      if (pollingModule && pollingModule.startPolling && typeof pollingModule.startPolling === 'function') {
        pollingModule.startPolling();
        console.log('[Init] ✅ Polling started successfully');
      } else {
        console.error('[Init] ❌ startPolling function not found in polling module');
      }
    } catch (error) {
      // Log error but don't crash the server
      console.error('[Init] ❌ Failed to start polling:', error.message);
      console.error('[Init] Error stack:', error.stack);
      // Server should continue running even if init fails
    }
  }, 3000); // Wait 3 seconds to ensure Next.js compilation is complete
}

