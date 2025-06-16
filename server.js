// Simple Express server for MSFT-Stock-Pokemon app
console.log('Starting server initialization...');
console.log('Current directory:', __dirname);
console.log('Files in directory:', require('fs').readdirSync(__dirname).join(', '));
console.log('Node version:', process.version);
console.log('NPM version:', require('child_process').execSync('npm -v').toString().trim());

try {
  console.log('Loading modules...');
  
  const express = require('express');
  console.log('Express loaded successfully');
  
  const path = require('path');
  console.log('Path loaded successfully');
  
  const fs = require('fs');
  console.log('FS loaded successfully');
} catch (err) {
  console.error('Error loading modules:', err);
  process.exit(1);
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Log environment information
console.log('Starting server...');
console.log('Current directory:', __dirname);
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);

// Set up static files and views
try {
  // Check if folders exist
  const viewsPath = path.join(__dirname, 'views');
  const publicPath = path.join(__dirname, 'public');
  
  console.log('Views directory exists:', fs.existsSync(viewsPath));
  console.log('Public directory exists:', fs.existsSync(publicPath));
  
  // Set up EJS as the view engine
  app.set('view engine', 'ejs');
  app.set('views', viewsPath);
  app.use(express.static(publicPath));
  
  console.log('View engine and static paths set up');
} catch (err) {
  console.error('Error setting up view engine or static files:', err);
}

// Simple route to test functionality
app.get('/test', (req, res) => {
  res.send('MSFT-Stock-Pokemon App test endpoint is working!');
});

// Main route - just a simple response for now
app.get('/', (req, res) => {
  try {
    res.send(`
      <html>
        <head>
          <title>MSFT-Stock-Pokemon App</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            h1 { color: #0078d4; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>MSFT-Stock-Pokemon App</h1>
            <p>The application is running successfully!</p>
            <p>This is a simplified version to ensure the deployment works correctly.</p>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error handling root request:', err);
    res.status(500).send('Server error: ' + err.message);
  }
});

// Handle errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Server error: ' + err.message);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
