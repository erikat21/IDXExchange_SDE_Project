CREATE DATABASE IF NOT EXISTS rets;
USE rets;

CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  listing_id VARCHAR(50) NOT NULL UNIQUE,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  bedrooms INT DEFAULT 0,
  bathrooms DECIMAL(3, 1) DEFAULT 0.0,
  square_feet INT DEFAULT 0,
  property_type VARCHAR(50) DEFAULT 'Single Family',
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_city_price (city, price),
  INDEX idx_status (status)
);

ALTER TABLE properties ADD INDEX idx_city (city);
ALTER TABLE properties ADD INDEX idx_price (price);
ALTER TABLE properties ADD INDEX idx_bedrooms (bedrooms);
ALTER TABLE properties ADD INDEX idx_city_price_beds (city, price, bedrooms);