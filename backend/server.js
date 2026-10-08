require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error('Database connection failed:', error); // <-- Updated to print full error
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// GET /api/properties - Filtering, Pagination & Parameterized Query Logic
app.get('/api/properties', async (req, res) => {
  try {
    const { city, minPrice, beds, limit = 20, offset = 0 } = req.query;

    // --- 1. INPUT VALIDATION ---
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
      return res.status(400).json({ 
        error: 'Invalid limit parameter. Limit must be an integer between 1 and 100.' 
      });
    }

    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({ 
        error: 'Invalid offset parameter. Offset must be a non-negative integer.' 
      });
    }

    let minPriceNum = null;
    if (minPrice !== undefined) {
      minPriceNum = parseFloat(minPrice);
      if (isNaN(minPriceNum) || minPriceNum < 0) {
        return res.status(400).json({ error: 'Invalid minPrice parameter. Must be a valid number.' });
      }
    }

    let bedsNum = null;
    if (beds !== undefined) {
      bedsNum = parseInt(beds, 10);
      if (isNaN(bedsNum) || bedsNum < 0) {
        return res.status(400).json({ error: 'Invalid beds parameter. Must be a non-negative integer.' });
      }
    }

    // --- 2. DYNAMIC SQL QUERY BUILDING ---
    let whereClauses = [];
    let queryParams = [];

    if (city) {
      whereClauses.push('city = ?');
      queryParams.push(city);
    }

    if (minPriceNum !== null) {
      whereClauses.push('price >= ?');
      queryParams.push(minPriceNum);
    }

    if (bedsNum !== null) {
      whereClauses.push('bedrooms >= ?');
      queryParams.push(bedsNum);
    }

    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // --- 3. COUNT QUERY FOR TOTAL RECORDS ---
    const countQuery = `SELECT COUNT(*) AS total FROM properties ${whereSQL}`;
    const [countResult] = await db.query(countQuery, queryParams);
    const total = countResult[0].total;

    // --- 4. DATA QUERY WITH PAGINATION ---
    // Fix for Debug Challenge: Build a separate array for data query parameters
    const dataQuery = `SELECT * FROM properties ${whereSQL} ORDER BY id ASC LIMIT ? OFFSET ?`;
    const dataParams = [...queryParams, parsedLimit, parsedOffset];

    const [rows] = await db.query(dataQuery, dataParams);

    // --- 5. RESPONSE PAYLOAD CONTRACT ---
    return res.status(200).json({
      total: total,
      limit: parsedLimit,
      offset: parsedOffset,
      results: rows
    });

  } catch (error) {
    console.error('Error fetching properties:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});