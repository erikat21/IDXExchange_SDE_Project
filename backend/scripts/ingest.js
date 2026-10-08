console.log('--- Ingestion Script Started ---');

const fs = require('fs');
const path = require('path');
const db = require('../db');

async function runETL() {
  try {
    const filePath = path.join(__dirname, '../data/properties.json');
    console.log(`Reading raw data from: ${filePath}`);

    // 1. EXTRACT: Read raw JSON file
    const rawData = fs.readFileSync(filePath, 'utf8');
    const properties = JSON.parse(rawData);

    console.log(`Extract completed. Found ${properties.length} property records.`);

    // 2. TRANSFORM & LOAD: Prepare SQL bulk insert query with ON DUPLICATE KEY UPDATE
    const query = `
      INSERT INTO properties 
        (listing_id, address, city, state, zip_code, price, bedrooms, bathrooms, square_feet, property_type, status)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        price = VALUES(price),
        status = VALUES(status),
        updated_at = CURRENT_TIMESTAMP;
    `;

    // Sanitize and format records into array rows
    const values = properties.map(p => [
      p.listing_id || p.id,
      p.address || 'Unknown Address',
      p.city || 'Unknown City',
      p.state || 'CA',
      p.zip_code || '',
      parseFloat(p.price) || 0.00,
      parseInt(p.bedrooms, 10) || 0,
      parseFloat(p.bathrooms) || 0.0,
      parseInt(p.square_feet, 10) || 0,
      p.property_type || 'Single Family',
      p.status || 'Active'
    ]);

    // 3. LOAD: Execute query using mysql2 connection pool
    const [result] = await db.query(query, [values]);

    console.log(`ETL Pipeline execution successful!`);
    console.log(`Affected rows: ${result.affectedRows}`);

    process.exit(0);
  } catch (error) {
    console.error('ETL Pipeline Failed:', error);
    process.exit(1);
  }
}

runETL().catch(err => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});