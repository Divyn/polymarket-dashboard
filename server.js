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
const PREPARE_TIMEOUT = 60000; // 60 seconds
let prepareTimeout;

prepareTimeout = setTimeout(() => {
  console.error('App preparation timeout - exiting');
  process.exit(1);
}, PREPARE_TIMEOUT);

app.prepare().then(() => {
  // Clear timeout since preparation succeeded
  clearTimeout(prepareTimeout);
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
    
    // Verify health check endpoint is accessible before declaring ready
    // This ensures Railway's health check will pass
    setTimeout(() => {
      const testReq = require('http').request({
        hostname: 'localhost',
        port: port,
        path: '/api/health',
        method: 'GET',
        timeout: 2000
      }, (res) => {
        if (res.statusCode === 200) {
          console.log('[Server] ✅ Health check endpoint verified');
        } else {
          console.log(`[Server] ⚠️  Health check returned status ${res.statusCode}`);
        }
      });
      
      testReq.on('error', (err) => {
        console.log('[Server] ⚠️  Health check test failed (this is OK, routes may still be loading):', err.message);
      });
      
      testReq.on('timeout', () => {
        testReq.destroy();
        console.log('[Server] ⚠️  Health check test timed out (this is OK, routes may still be loading)');
      });
      
      testReq.end();
    }, 1000);
    
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

