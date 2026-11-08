// frontend/src/pages/ListingsPage.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProperties } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import PropertyFilters from '../components/PropertyFilters';
import Pagination from '../components/Pagination';

export default function ListingsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    // 1. Derive page and filters directly from URL search parameters
    const currentPage = parseInt(searchParams.get('page') || '1', 10);

    const activeFilters = useMemo(() => {
        const filters = {};
        for (const [key, value] of searchParams.entries()) {
            if (key !== 'page' && value) {
                filters[key] = value;
            }
        }
        return filters;
    }, [searchParams]);

    const [properties, setProperties] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const itemsPerPage = 20;
    const requestIdRef = useRef(0);

    useEffect(() => {
        async function loadPropertyListings() {
            const currentRequestId = ++requestIdRef.current;
            const offset = (currentPage - 1) * itemsPerPage;
            
            try {
                setLoading(true);
                const data = await fetchProperties({ 
                    limit: itemsPerPage, 
                    offset, 
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
    }, [currentPage, activeFilters]);

    // 2. Helper to sync filter object changes into the URL
    const updateUrlParams = (newFilters, newPage = 1) => {
        const params = new URLSearchParams();
        
        // Add new page parameter if beyond page 1
        if (newPage > 1) {
            params.set('page', newPage);
        }

        // Add filter parameters
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.set(key, value);
            }
        });

        setSearchParams(params);
    };

    const handleSearch = (newFilters) => {
        updateUrlParams(newFilters, 1); // Reset to page 1 on filter search
    };

    const handleClear = () => {
        setSearchParams({}); // Clear all search params from URL
    };

    const handlePageChange = (newPage) => {
        updateUrlParams(activeFilters, newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

            <PropertyFilters 
                initialFilters={activeFilters}
                onSearch={handleSearch} 
                onClear={handleClear} 
            />

            {error && <div style={{ textAlign: 'center', color: 'red', padding: '20px' }}>{error}</div>}
            {loading && <div style={{ textAlign: 'center', padding: '40px' }}>Loading properties...</div>}

            {!loading && !error && properties.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <h3>No properties found matching your criteria.</h3>
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
                {properties.map((property) => (
                    <PropertyCard key={property.id || property.L_ListingID} property={property} />
                ))}
            </div>

            <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
            />
        </div>
    );
}