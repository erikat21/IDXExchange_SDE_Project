import React from 'react';

export default function PropertyCard({ property }) {
    // Defensive photo parsing for the Debug Challenge
    let photoUrl = 'https://via.placeholder.com/300x200?text=No+Image'; // Fallback image
    
    if (property.L_Photos) {
        try {
            const photos = JSON.parse(property.L_Photos);
            if (Array.isArray(photos) && photos.length > 0 && photos[0]) {
                photoUrl = photos[0];
            }
        } catch (error) {
            // Silently fall back if the JSON string is corrupted or malformed
        }
    }

    const formattedPrice = property.L_SystemPrice 
        ? `$${Number(property.L_SystemPrice).toLocaleString()}` 
        : 'Price upon request';

    return (
        <div className="property-card" style={cardStyle}>
            <img 
                src={photoUrl} 
                alt={property.L_Address || 'Property'} 
                style={imageStyle} 
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error'; }}
            />
            <div style={{ padding: '12px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>{formattedPrice}</h3>
                <p style={{ margin: '4px 0', fontWeight: 'bold' }}>{property.L_Address || 'Address unavailable'}</p>
                <p style={{ margin: '4px 0', color: '#666' }}>{property.L_City}, {property.L_State} {property.L_Zip}</p>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: '#444' }}>
                    🛏️ {property.L_Keyword2 ?? 'N/A'} beds | 
                    🛁 {property.LM_Dec_3 ?? 'N/A'} baths | 
                    📐 {property.LM_Int2_3 ? `${property.LM_Int2_3} sqft` : 'N/A'}
                </p>
            </div>
        </div>
    );
}

// Basic inline styles for hover effects and card layout
const cardStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
    width: '300px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer'
};

const imageStyle = {
    width: '100%',
    height: '180px',
    objectFit: 'cover'
};