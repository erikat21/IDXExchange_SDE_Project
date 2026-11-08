import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyImageCarousel from './PropertyImageCarousel';

export default function PropertyCard({ property }) {
    const navigate = useNavigate();
    const listingId = property.id || property.L_ListingID;
    // Schema-aligned mapping
    const price = property.L_SystemPrice || 0;
    const address = `${property.L_Address || ''}, ${property.L_City || ''}, ${property.L_State || ''} ${property.L_Zip || ''}`.replace(/^,\s*|\s*,\s*$/, '');

    const beds = property.L_Keyword2 ?? 'N/A'; // L_Keyword2 is '# Beds'

    // Use LM_Dec_3 directly for accurate total baths
    const totalBaths = property.LM_Dec_3 !== null && property.LM_Dec_3 !== undefined
        ? Number(property.LM_Dec_3)
        : Number(property.L_Keyword2 || 0) + (Number(property.BathroomsHalf || 0) * 0.5);

    const baths = totalBaths > 0 ? totalBaths : 'N/A';
    const sqft = property.LM_Int2_3 ?? 'N/A';

    return (
        <div style={cardStyle}>
            <PropertyImageCarousel photos={property.L_Photos || property.photos} />
            <div 
                onClick={() => navigate(`/property/${listingId}`)}
                style={{ padding: '16px', cursor: 'pointer' }}
            >
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#28a745' }}>
                    ${Number(price).toLocaleString()}
                </h3>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#333' }}>
                    {address || 'Address unavailable'}
                </p>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                    {beds} beds • {baths} baths • {sqft} sqft
                </p>
            </div>
        </div>
    );
}

const cardStyle = {
    width: '280px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
};