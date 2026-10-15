require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    // Listen for when the response finishes sending
    res.on('finish', () => {
        const duration = Date.now() - start;
        // FIXED: Added spacing and hyphen before Status:
        console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
    });

    next();
});

// Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error('Database connection failed:', error);
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

// GET /api/properties - Filtering, Pagination & Real Schema Validation
app.get('/api/properties', async (req, res) => {
    const conditions = [];
    const values = [];

    // Parse parameters cleanly
    const limit = req.query.limit != null ? Number(req.query.limit) : 20;
    const offset = req.query.offset != null ? Number(req.query.offset) : 0;
    const city = req.query.city != null ? String(req.query.city).trim() : null;
    const zipcode = req.query.zipcode != null ? String(req.query.zipcode).trim() : null;
    const minPrice = req.query.minPrice != null ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice != null ? Number(req.query.maxPrice) : null;
    const beds = req.query.beds != null ? Number(req.query.beds) : null;
    const baths = req.query.baths != null ? Number(req.query.baths) : null;

    // Validate Pagination
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({ error: 'limit must be an integer between 1 and 100.' });
    }
    if (!Number.isInteger(offset) || offset < 0) {
        return res.status(400).json({ error: 'offset must be a nonnegative integer.' });
    }

    // Validate Prices
    if (minPrice !== null && (!Number.isFinite(minPrice) || minPrice < 0)) {
        return res.status(400).json({ error: 'minPrice must be a nonnegative number.' });
    }
    if (maxPrice !== null && (!Number.isFinite(maxPrice) || maxPrice < 0)) {
        return res.status(400).json({ error: 'maxPrice must be a nonnegative number.' });
    }
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
        return res.status(400).json({ error: 'minPrice cannot exceed maxPrice.' });
    }

    // Validate Beds and Baths
    if (beds !== null && (!Number.isInteger(beds) || beds < 0)) {
        return res.status(400).json({ error: 'beds must be a nonnegative integer.' });
    }
    if (baths !== null && (!Number.isFinite(baths) || baths < 0)) {
        return res.status(400).json({ error: 'baths must be a nonnegative number.' });
    }

    try {
        // Database Validation for City Existence
        if (city !== null && city !== '') {
            const [existsResult] = await db.query(
                'SELECT EXISTS(SELECT 1 FROM rets_property WHERE L_City = ?) AS cityExists', 
                [city]
            );
            if (!existsResult[0].cityExists) {
                return res.status(400).json({ error: 'not a valid city.' });
            }
        }

        // Database Validation for Zipcode Format & Existence
        if (zipcode !== null && zipcode !== '') {
            if (!/^\d{5}$/.test(zipcode)) {
                return res.status(400).json({ error: 'not a valid zipcode. should be 5 digits.' });
            }
            const [existsResult] = await db.query(
                'SELECT EXISTS(SELECT 1 FROM rets_property WHERE L_Zip = ?) AS zipExists', 
                [zipcode]
            );
            if (!existsResult[0].zipExists) {
                return res.status(400).json({ error: 'zipcode does not exist in our listings.' });
            }
        }

        // Build WHERE clauses matching real schema column names
        if (city) {
            conditions.push('L_City = ?');
            values.push(city);
        }
        if (zipcode) {
            conditions.push('L_Zip = ?');
            values.push(zipcode);
        }
        if (minPrice !== null) {
            conditions.push('L_SystemPrice >= ?');
            values.push(minPrice);
        }
        if (maxPrice !== null) {
            conditions.push('L_SystemPrice <= ?');
            values.push(maxPrice);
        }
        if (baths !== null) {
            conditions.push('LM_Dec_3 = ?');
            values.push(baths);
        }
        if (beds !== null) {
            conditions.push('L_Keyword2 = ?');
            values.push(beds);
        }

        const whereQuery = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        
        // Execute queries with isolated parameter arrays
        const [response] = await db.query(
            `SELECT * FROM rets_property ${whereQuery} LIMIT ? OFFSET ?`, 
            [...values, limit, offset]
        );
        
        const [countRows] = await db.query(
            `SELECT COUNT(*) AS total FROM rets_property ${whereQuery}`, 
            values
        );

        return res.status(200).json({
            total: countRows[0].total,
            limit: limit,
            offset: offset,
            results: response
        });
    } catch (dbError) {
        console.error("Execution Error:", dbError.message);
        return res.status(500).json({ error: "Internal server database error." });
    }
});

// GET /api/properties/:id/openhouses - Returns open house events array for a specific property
app.get('/api/properties/:id/openhouses', async (req, res) => {
    const identifier = req.params.id;

    if (!/^\d+$/.test(identifier)) {
        return res.status(400).json({ error: 'Invalid ID format. Must be a numeric identifier.' });
    }

    try {
        const [propertyRows] = await db.query(
            'SELECT id, L_ListingID FROM rets_property WHERE id = ? OR L_ListingID = ?',
            [identifier, identifier]
        );

        if (propertyRows.length === 0) {
            return res.status(404).json({ error: 'Property not found.' });
        }

        const listingId = propertyRows[0].L_ListingID;

        // Query open houses, ordered by date and start time per acceptance criteria
        const [openHouses] = await db.query(
            'SELECT * FROM rets_openhouse WHERE L_ListingID = ? ORDER BY OpenHouseDate ASC, OH_StartTime ASC',
            [listingId]
        );

        // FIXED: Return the raw array directly to satisfy the acceptance criteria
        return res.status(200).json(openHouses);

    } catch (error) {
        console.error('Error fetching open houses:', error.message);
        return res.status(500).json({ error: 'Internal server database error.' });
    }
});

// GET /api/properties/:id - Fetch a single property by internal ID or L_ListingID
app.get('/api/properties/:id', async (req, res) => {
    const identifier = req.params.id;

    if (!/^\d+$/.test(identifier)) {
        return res.status(400).json({ error: 'Invalid ID format. Must be a numeric identifier.' });
    }

    try {
        const [rows] = await db.query(
            'SELECT * FROM rets_property WHERE id = ? OR L_ListingID = ?', 
            [identifier, identifier]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Property not found.' });
        }

        return res.status(200).json(rows[0]);

    } catch (error) {
        console.error('Error fetching property by ID:', error.message);
        return res.status(500).json({ error: 'Internal server database error.' });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});