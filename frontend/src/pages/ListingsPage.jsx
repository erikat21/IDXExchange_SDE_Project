import React, { useState, useEffect, useRef } from 'react';
import { fetchProperties } from '../api/client';
import PropertyCard from '../components/PropertyCard';
import PropertyFilters from '../components/PropertyFilters';

export default function ListingsPage() {
    const [properties, setProperties] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilters, setActiveFilters] = useState({});

    const requestIdRef = useRef(0);

    useEffect(() => {
        async function loadPropertyListings() {
            // Increment request ID on every trigger
            const currentRequestId = ++requestIdRef.current;
            
            try {
                setLoading(true);
                // Fetch properties with pagination defaults merged with active search filters
                const data = await fetchProperties({ limit: 20, offset: 0, ...activeFilters });
                
                // Debug Challenge Fix: Only update state if this is still the latest request
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
    }, [activeFilters]);

    const handleSearch = (newFilters) => {
        setActiveFilters(newFilters);
    };

    const handleClear = () => {
        setActiveFilters({});
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <header style={{ marginBottom: '20px', textAlign: 'center' }}>
                <h1>Property Listings</h1>
                <p style={{ color: '#555' }}>
                    {loading ? 'Searching...' : `Showing ${properties.length} of ${total} properties`}
                </p>
            </header>

            {/* Filter Form Component */}
            <PropertyFilters onSearch={handleSearch} onClear={handleClear} />

            {/* Error Message */}
            {error && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#d9534f' }}>
                    <h2>Error Loading Properties</h2>
                    <p>{error}</p>
                    <p>Please make sure your Express backend server is running on port 5000.</p>
                </div>
            )}

            {/* Loading Indicator */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '40px', fontSize: '1.2rem', color: '#666' }}>
                    Loading matching properties...
                </div>
            )}

            {/* No Results State */}
            {!loading && !error && properties.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>No properties found</h3>
                    <p style={{ color: '#666', margin: 0 }}>
                        Try broadening your search or clearing your filters to see more results.
                    </p>
                </div>
            )}

            {/* Property Grid */}
            {!loading && !error && properties.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
                    {properties.map((property) => (
                        <PropertyCard key={property.id || property.L_ListingID} property={property} />
                    ))}
                </div>
            )}
        </div>
    );
}