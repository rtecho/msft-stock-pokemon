// Simple server.js to test basic functionality
try {
  const express = require('express');
  const path = require('path');
  
  console.log('Express loaded successfully');
  
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  // Set up EJS as the view engine
  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));
  app.use(express.static(path.join(__dirname, 'public')));
  
  console.log('View engine and static paths set up');
  
  // Simple route to test functionality
  app.get('/', (req, res) => {
    try {
      res.send('Hello World! MSFT-Stock-Pokemon app is running.');
    } catch (err) {
      console.error('Error in root route:', err);
      res.status(500).send('Error: ' + err.message);
    }
  });
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('Critical error in server startup:', err);
}

// Verbose startup logging
console.log('Starting server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', PORT);
console.log('Current directory:', __dirname);

// Setup views and static files
try {
  console.log('Setting up view engine and static files...');
  app.set('view engine', 'ejs');
  
  // Log available paths
  const viewsPath = path.join(__dirname, 'views');
  console.log('Views directory:', viewsPath);
  console.log('Views directory exists:', fs.existsSync(viewsPath));
  
  app.set('views', viewsPath);
  
  const publicPath = path.join(__dirname, 'public');
  console.log('Public directory:', publicPath);
  console.log('Public directory exists:', fs.existsSync(publicPath));
  
  app.use(express.static(publicPath));
} catch (err) {
  console.error('Error setting up view engine or static files:', err);
}

// Helper function
function getSixMonthsAgoDate() {
  const now = new Date();
  now.setMonth(now.getMonth() - 6);
  return now.toISOString().split('T')[0];
}

// Basic route for testing
app.get('/test', (req, res) => {
  res.send('App is running - Test endpoint');
});

// API key
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
console.log('Using API key:', ALPHA_VANTAGE_API_KEY);

// Main route
app.get('/', async (req, res) => {
  try {
    console.log('Handling root request...');
    // Fetch MSFT stock data
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=MSFT&outputsize=full&apikey=${ALPHA_VANTAGE_API_KEY}`;
    console.log('Fetching data from:', url);
    
    const response = await axios.get(url);
    console.log('Response received');
    
    if (!response.data || !response.data['Time Series (Daily)']) {
      console.error('Invalid data format received:', response.data);
      throw new Error('Stock data unavailable or in unexpected format');
    }
    
    const data = response.data['Time Series (Daily)'];
    console.log('Data entries:', Object.keys(data).length);
    
    const sixMonthsAgo = getSixMonthsAgoDate();
    console.log('Six months ago date:', sixMonthsAgo);
    
    const chartData = Object.entries(data)
      .filter(([date]) => date >= sixMonthsAgo)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        date,
        close: parseFloat(value['4. close'])
      }));
      
    console.log('Chart data points:', chartData.length);
    console.log('Rendering index template...');
    
    res.render('index', { chartData });
  } catch (err) {
    console.error('Error handling root request:', err);
    // Provide a simpler error response
    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>An error occurred</h1>
          <p>Error details: ${err.message}</p>
          <p>Please try again later.</p>
        </body>
      </html>
    `);
  }
});

// Handle errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).send('Server error: ' + err.message);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});
