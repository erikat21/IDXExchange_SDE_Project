import React, { useState, useEffect } from 'react';

export default function PropertyFilters({ initialFilters = {}, onSearch, onClear }) {
    const [city, setCity] = useState(initialFilters.city || '');
    const [zip, setZip] = useState(initialFilters.zip || '');
    const [minPrice, setMinPrice] = useState(initialFilters.minPrice || '');
    const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || '');
    const [beds, setBeds] = useState(initialFilters.beds || '');
    const [baths, setBaths] = useState(initialFilters.baths || '');

    // Synchronize local form inputs with URL parameters when navigating back
    useEffect(() => {
        setCity(initialFilters.city || '');
        setZip(initialFilters.zip || '');
        setMinPrice(initialFilters.minPrice || '');
        setMaxPrice(initialFilters.maxPrice || '');
        setBeds(initialFilters.beds || '');
        setBaths(initialFilters.baths || '');
    }, [initialFilters]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch({
            city: city.trim(),
            zip: zip.trim(),
            minPrice: minPrice ? Number(minPrice) : '',
            maxPrice: maxPrice ? Number(maxPrice) : '',
            beds: beds ? Number(beds) : '',
            baths: baths ? Number(baths) : '',
        });
    };

    const handleReset = () => {
        setCity('');
        setZip('');
        setMinPrice('');
        setMaxPrice('');
        setBeds('');
        setBaths('');
        onClear();
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <input 
                type="text" 
                placeholder="City" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                style={inputStyle}
            />
            <input 
                type="text" 
                placeholder="Zip Code" 
                value={zip} 
                onChange={(e) => setZip(e.target.value)} 
                style={inputStyle}
            />
            <input 
                type="number" 
                placeholder="Min Price" 
                value={minPrice} 
                onChange={(e) => setMinPrice(e.target.value)} 
                style={inputStyle}
            />
            <input 
                type="number" 
                placeholder="Max Price" 
                value={maxPrice} 
                onChange={(e) => setMaxPrice(e.target.value)} 
                style={inputStyle}
            />
            <select 
                value={beds} 
                onChange={(e) => setBeds(e.target.value)} 
                style={inputStyle}
            >
                <option value="">Any Beds</option>
                <option value="1">1+ Beds</option>
                <option value="2">2+ Beds</option>
                <option value="3">3+ Beds</option>
                <option value="4">4+ Beds</option>
            </select>
            <select 
                value={baths} 
                onChange={(e) => setBaths(e.target.value)} 
                style={inputStyle}
            >
                <option value="">Any Baths</option>
                <option value="1">1+ Baths</option>
                <option value="2">2+ Baths</option>
                <option value="3">3+ Baths</option>
                <option value="4">4+ Baths</option>
            </select>

            <button type="submit" style={searchBtnStyle}>Search</button>
            <button type="button" onClick={handleReset} style={clearBtnStyle}>Clear</button>
        </form>
    );
}

const formStyle = {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
};

const inputStyle = {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    fontSize: '14px',
};

const searchBtnStyle = {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};

const clearBtnStyle = {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};