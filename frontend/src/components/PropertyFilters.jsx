// frontend/src/components/PropertyFilters.jsx
import React, { useState } from 'react';

export default function PropertyFilters({ onSearch, onClear }) {
    const [filters, setFilters] = useState({
        city: '',
        zipcode: '',
        minPrice: '',
        maxPrice: '',
        beds: '',
        baths: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(filters);
    };

    const handleClearClick = () => {
        setFilters({
            city: '',
            zipcode: '',
            minPrice: '',
            maxPrice: '',
            beds: '',
            baths: ''
        });
        onClear();
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <div style={inputGroupStyle}>
                <input
                    type="text"
                    name="city"
                    placeholder="City (e.g., Irvine)"
                    value={filters.city}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="zipcode"
                    placeholder="ZIP Code"
                    value={filters.zipcode}
                    onChange={handleChange}
                />
                <input
                    type="number"
                    name="minPrice"
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={handleChange}
                />
                <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={handleChange}
                />
                <select name="beds" value={filters.beds} onChange={handleChange}>
                    <option value="">Any Beds</option>
                    <option value="1">1+ Beds</option>
                    <option value="2">2+ Beds</option>
                    <option value="3">3+ Beds</option>
                    <option value="4">4+ Beds</option>
                </select>
                <select name="baths" value={filters.baths} onChange={handleChange}>
                    <option value="">Any Baths</option>
                    <option value="1">1+ Baths</option>
                    <option value="2">2+ Baths</option>
                    <option value="3">3+ Baths</option>
                </select>
            </div>
            <div style={buttonGroupStyle}>
                <button type="submit" style={searchBtnStyle}>Search</button>
                <button type="button" onClick={handleClearClick} style={clearBtnStyle}>Clear Filters</button>
            </div>
        </form>
    );
}

const formStyle = {
    background: '#f9f9f9',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
};

const inputGroupStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '12px'
};

const buttonGroupStyle = {
    display: 'flex',
    gap: '10px'
};

const searchBtnStyle = { padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };
const clearBtnStyle = { padding: '8px 16px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' };