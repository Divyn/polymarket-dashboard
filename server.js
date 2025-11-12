// Production server script that respects PORT environment variable
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Note: Initialization happens via app/layout.tsx which imports @/lib/init
// This ensures TypeScript files are properly compiled by Next.js

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3001;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Set a timeout for app preparation to avoid hanging
const PREPARE_TIMEOUT = 90000; // 90 seconds (increased for Railway)
let prepareTimeout;

// Start a simple HTTP server immediately to respond to health checks
// This prevents Railway from killing the container while Next.js prepares
const tempServer = createServer((req, res) => {
  if (req.url === '/api/health' || req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'starting', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    res.end('Server is starting...');
  }
});

tempServer.listen(port, hostname, () => {
  console.log(`[Server] ⏳ Temporary server listening on ${hostname}:${port} (Next.js preparing...)`);
});

prepareTimeout = setTimeout(() => {
  console.error('App preparation timeout - exiting');
  tempServer.close();
  process.exit(1);
}, PREPARE_TIMEOUT);

app.prepare().then(() => {
  // Clear timeout since preparation succeeded
  clearTimeout(prepareTimeout);
  
  // Close temporary server and start real server
  tempServer.close(() => {
    console.log('[Server] ✅ Next.js ready, switching to real server...');
  });
  
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  server.listen(port, hostname, (err) => {
    if (err) {
      console.error('Failed to start server:', err);
      process.exit(1);
    }
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Environment: ${dev ? 'development' : 'production'}`);
    
    // Verify server is actually listening
    server.on('listening', () => {
      console.log(`[Server] ✅ Server is listening on ${hostname}:${port}`);
    });
    
    // Initialization happens automatically when Next.js loads /api/init route
    // No need to call it manually - the route module auto-initializes on load
    console.log('[Server] ✅ Server ready - initialization will happen when Next.js loads API routes');
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}).catch((err) => {
  clearTimeout(prepareTimeout);
  console.error('Failed to prepare Next.js app:', err);
  process.exit(1);
});

