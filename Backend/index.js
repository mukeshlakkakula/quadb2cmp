import express from 'express';
import sqlite3 from 'sqlite3';
import fetch from 'node-fetch';
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors());


// initializing SQLite Database
let db = new sqlite3.Database('./crypto.db', (err) => {
  if (err) {
    console.error('Error opening database: ' + err.message);
  } else {
    db.run(`CREATE TABLE IF NOT EXISTS crypto_data (
        name TEXT,
        last REAL,
        buy REAL,
        sell REAL,
        volume REAL,
        base_unit TEXT
    )`, (err) => {
      if (err) {
        console.log('Table creation error: ' + err.message);
      }
    });
  }
});

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin,X-Requested-With,Content-Type,Accept"
    );
    next();
  });

// fetching data from given API 
async function fetchCryptoData() {
  try {
    const response = await fetch('https://api.wazirx.com/api/v2/tickers');
    const data = await response.json();

    const top10 = Object.values(data).slice(0, 10);  // Get the top 10 entries

    db.serialize(() => {
      db.run('DELETE FROM crypto_data'); // clearing old data
      const stmt = db.prepare('INSERT INTO crypto_data (name, last, buy, sell, volume, base_unit) VALUES (?, ?, ?, ?, ?, ?)');

      top10.forEach(crypto => {
        stmt.run(crypto.name, crypto.last, crypto.buy, crypto.sell, crypto.volume, crypto.base_unit);
      });

      stmt.finalize();
    });

    console.log('Data updated successfully!');
  } catch (err) {
    console.error('Error fetching data: ', err);
  }
}

// Fetch data every 10 minutes
setInterval(fetchCryptoData, 10 * 60 * 1000);
fetchCryptoData();

// API route to get the top 10 values
app.get('/api/getTop10', (req, res) => {
  db.all('SELECT * FROM crypto_data', [], (err, rows) => {
    if (err) {
      res.status(500).send('Error fetching data');
      return;
    }
    res.json(rows);
  });
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});