const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));
app.use(express.static(path.join(__dirname, '../public')));

// Helper to get last 6 months date
function getSixMonthsAgoDate() {
  const now = new Date();
  now.setMonth(now.getMonth() - 6);
  return now.toISOString().split('T')[0];
}

// Replace with your own API key if needed
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

app.get('/', async (req, res) => {
  try {
    // Fetch MSFT stock data from Alpha Vantage
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=MSFT&outputsize=full&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const response = await axios.get(url);
    const data = response.data['Time Series (Daily)'];
    if (!data) throw new Error('Stock data unavailable');

    const sixMonthsAgo = getSixMonthsAgoDate();
    const chartData = Object.entries(data)
      .filter(([date]) => date >= sixMonthsAgo)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({
        date,
        close: parseFloat(value['4. close'])
      }));

    res.render('index', { chartData });
  } catch (err) {
    res.render('index', { chartData: [], error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
