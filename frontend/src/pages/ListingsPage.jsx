import React, { useState, useEffect } from 'react';
import { fetchProperties } from '../api/client';
import PropertyCard from '../components/PropertyCard';

export default function ListingsPage() {
    const [properties, setProperties] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadPropertyListings() {
            try {
                setLoading(true);
                // Fetch default first page (limit 20)
                const data = await fetchProperties({ limit: 20, offset: 0 });
                setProperties(data.results);
                setTotal(data.total);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadPropertyListings();
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '60px', fontSize: '1.2rem' }}>Loading properties...</div>;
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: '60px', color: '#d9534f' }}>
                <h2>Connection Error</h2>
                <p>{error}</p>
                <p>Please make sure your Express backend server is running on port 5000.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <header style={{ marginBottom: '20px', textAlign: 'center' }}>
                <h1>Property Listings</h1>
                <p style={{ color: '#555' }}>Showing {properties.length} of {total} properties</p>
            </header>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'center' }}>
                {properties.map((property) => (
                    <PropertyCard key={property.id || property.L_ListingID} property={property} />
                ))}
            </div>
        </div>
    );
}