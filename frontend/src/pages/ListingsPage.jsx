// frontend/src/pages/ListingsPage.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProperties } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import PropertyFilters from '../components/PropertyFilters';
import Pagination from '../components/Pagination';
import { useFavorites } from '../hooks/useFavorites';

export default function ListingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Committed URL state (triggers the actual data fetch & survives browser Back button)
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const sortBy = searchParams.get('sortBy') || 'price';
    const sortOrder = searchParams.get('sortOrder') || 'ASC';
    const showFavoritesOnly = searchParams.get('favorites') === 'true';

    // 2. Staged local state for dropdowns (doesn't fetch until "Apply" is clicked)
    const [tempSortBy, setTempSortBy] = useState(sortBy);
    const [tempSortOrder, setTempSortOrder] = useState(sortOrder);

    // Keep temp state in sync if URL changes externally (like clearing filters)
    useEffect(() => {
        setTempSortBy(sortBy);
        setTempSortOrder(sortOrder);
    }, [sortBy, sortOrder]);

    const activeFilters = useMemo(() => {
        const filters = {};
        for (const [key, value] of searchParams.entries()) {
            if (key !== 'page' && key !== 'sortBy' && key !== 'sortOrder' && key !== 'favorites' && value) {
                filters[key] = value;
            }
        }
        return filters;
    }, [searchParams]);

    const [properties, setProperties] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Favorites Hook
    const { favorites, toggleFavorite, isFavorite } = useFavorites();

    const itemsPerPage = 20;
    const requestIdRef = useRef(0);

    useEffect(() => {
        async function loadPropertyListings() {
            // If favorites view is on but user has 0 favorites, clear immediately
            if (showFavoritesOnly && favorites.length === 0) {
                setProperties([]);
                setTotal(0);
                setLoading(false);
                return;
            }

            const currentRequestId = ++requestIdRef.current;
            const offset = (currentPage - 1) * itemsPerPage;
            
            try {
                setLoading(true);
                const data = await fetchProperties({ 
                    limit: showFavoritesOnly ? 100 : itemsPerPage, // fetch all favorites at once
                    offset: showFavoritesOnly ? 0 : offset, 
                    sortBy,
                    sortOrder,
                    ids: showFavoritesOnly ? favorites.join(',') : undefined, // Send favorite IDs to backend
                    ...activeFilters 
                });
                
                if (currentRequestId === requestIdRef.current) {
                    setProperties(data.results || []);
                    setTotal(data.total || 0);
                    setError(null);
                }
            } catch (err) {
                if (currentRequestId === requestIdRef.current) {
                    setError(err.message);
                }
            } finally {
                if (currentRequestId === requestIdRef.current) {
                    setLoading(false);
                }
            }
        }

        loadPropertyListings();
    }, [currentPage, sortBy, sortOrder, activeFilters, showFavoritesOnly, favorites]);

    const updateUrlParams = (newFilters, newPage = 1, newSortBy = sortBy, newSortOrder = sortOrder, isFav = showFavoritesOnly) => {
        const params = new URLSearchParams();
        
        if (isFav) {
            params.set('favorites', 'true');
        }
        if (newPage > 1) {
            params.set('page', newPage);
        }
        if (newSortBy && newSortBy !== 'price') {
            params.set('sortBy', newSortBy);
        }
        if (newSortOrder && newSortOrder !== 'ASC') {
            params.set('sortOrder', newSortOrder);
        }

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.set(key, value);
            }
        });

        setSearchParams(params);
    };

    const handleToggleFavorites = () => {
        updateUrlParams(activeFilters, 1, sortBy, sortOrder, !showFavoritesOnly);
    };

    const handleSearch = (newFilters) => {
        updateUrlParams(newFilters, 1, 'price', 'ASC', showFavoritesOnly); 
    };

    const handleClear = () => {
        const params = new URLSearchParams();
        if (showFavoritesOnly) {
            params.set('favorites', 'true');
        }
        setSearchParams(params);
        setTempSortBy('price');
        setTempSortOrder('ASC');
    };

    const handlePageChange = (newPage) => {
        updateUrlParams(activeFilters, newPage, sortBy, sortOrder, showFavoritesOnly);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Triggered only when the user clicks "Apply Sort"
    const handleApplySort = () => {
        updateUrlParams(activeFilters, 1, tempSortBy, tempSortOrder, showFavoritesOnly);
    };

    const displayedProperties = showFavoritesOnly
        ? properties.filter(p => favorites.includes(p.id || p.L_ListingID))
        : properties;

    const totalPages = Math.ceil(total / itemsPerPage);
    const startRange = total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endRange = Math.min(currentPage * itemsPerPage, total);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <header style={{ marginBottom: '20px', textAlign: 'center' }}>
                <h1>Property Listings</h1>
                <p style={{ color: '#555' }}>
                    {loading ? 'Loading...' : `Showing ${startRange}-${endRange} of ${total} properties`}
                </p>
            </header>

            {/* Controls Bar */}
            <div style={controlsBarStyle}>
                <button 
                    onClick={handleToggleFavorites}
                    style={favToggleBtnStyle(showFavoritesOnly)}
                >
                    ❤️ Favorites ({favorites.length})
                </button>

                {/* Staged Sort Controls with Apply Button */}
                <div style={sortControlsStyle}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Sort By:</label>
                    <select 
                        value={tempSortBy} 
                        onChange={(e) => setTempSortBy(e.target.value)} 
                        style={selectStyle}
                    >
                        <option value="price">Price</option>
                        <option value="beds">Bedrooms</option>
                        <option value="sqft">Square Footage</option>
                        <option value="date">Date Listed</option>
                    </select>

                    <select 
                        value={tempSortOrder} 
                        onChange={(e) => setTempSortOrder(e.target.value)} 
                        style={selectStyle}
                    >
                        <option value="ASC">Low to High</option>
                        <option value="DESC">High to Low</option>
                    </select>

                    <button onClick={handleApplySort} style={applyBtnStyle}>
                        Apply Sort
                    </button>
                </div>
            </div>

            <PropertyFilters 
                initialFilters={activeFilters}
                onSearch={handleSearch} 
                onClear={handleClear} 
            />

            {error && <div style={{ textAlign: 'center', color: 'red', padding: '20px' }}>{error}</div>}
            {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading properties...</div>}

            {!loading && !error && displayedProperties.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <h3>{showFavoritesOnly ? "You haven't saved any favorite properties yet." : "No properties found matching your criteria."}</h3>
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
                {displayedProperties.map((property) => (
                    <PropertyCard 
                        key={property.id || property.L_ListingID} 
                        property={property} 
                        isFav={isFavorite(property.id || property.L_ListingID)}
                        onToggleFav={toggleFavorite}
                    />
                ))}
            </div>

            {!showFavoritesOnly && (
                <Pagination 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    onPageChange={handlePageChange} 
                />
            )}
        </div>
    );
}

// Styling helpers
const controlsBarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px'
};

const sortControlsStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
};

const selectStyle = {
    padding: '6px 10px',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    backgroundColor: '#fff'
};

const applyBtnStyle = {
    padding: '6px 12px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '600'
};

const favToggleBtnStyle = (isActive) => ({
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #ff4d4f',
    backgroundColor: isActive ? '#ff4d4f' : '#fff',
    color: isActive ? '#fff' : '#ff4d4f',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease'
});