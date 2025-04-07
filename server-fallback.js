// Simple express server to verify environment
const http = require('http');

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  // Respond with diagnostic information
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <html>
      <head><title>Baplikasyon - Server Check</title></head>
      <body>
        <h1>Server is running</h1>
        <p>This is a fallback server to verify the environment.</p>
        <h2>Environment Information:</h2>
        <pre>${JSON.stringify(process.env, null, 2)}</pre>
        <h2>Node Version:</h2>
        <pre>${process.version}</pre>
        <p>Please check your deployment logs for more information.</p>
      </body>
    </html>
  `);
});

// Get port from environment or use 5000 as default
const PORT = process.env.PORT || 5000;

// Start the server
server.listen(PORT, () => {
  console.log(`Fallback server running on port ${PORT}`);
}); 