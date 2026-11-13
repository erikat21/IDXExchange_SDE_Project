import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyImageCarousel from './PropertyImageCarousel';

export default function PropertyCard({ property, isFav = false, onToggleFav }) {
    const navigate = useNavigate();
    const listingId = property.id || property.L_ListingID;
    
    // Schema-aligned mapping
    const price = property.L_SystemPrice || 0;
    const address = `${property.L_Address || ''}, ${property.L_City || ''}, ${property.L_State || ''} ${property.L_Zip || ''}`.replace(/^,\s*|\s*,\s*$/, '');

    const beds = property.L_Keyword2 ?? 'N/A';

    const totalBaths = property.LM_Dec_3 !== null && property.LM_Dec_3 !== undefined
        ? Number(property.LM_Dec_3)
        : Number(property.L_Keyword2 || 0) + (Number(property.BathroomsHalf || 0) * 0.5);

    const baths = totalBaths > 0 ? totalBaths : 'N/A';
    const sqft = property.LM_Int2_3 ?? 'N/A';

    const handleHeartClick = (e) => {
        e.stopPropagation(); // Stops click from opening the property detail page
        if (onToggleFav) {
            onToggleFav(listingId);
        }
    };

    return (
        <div style={cardStyle}>
            {/* Heart button anchored inside this specific card */}
            <button
                type="button"
                onClick={handleHeartClick}
                style={heartButtonStyle}
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
                {isFav ? '❤️' : '🤍'}
            </button>

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
    position: 'relative', // <-- CRITICAL: keeps the heart button inside each card
    width: '280px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
};

const heartButtonStyle = {
    position: 'absolute',
    top: '10px',
    right: '10px',
    zIndex: 10, // <-- CRITICAL: keeps the heart visible above the carousel images
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    borderRadius: '50%',
    width: '34px',
    height: '34px',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
    padding: 0
};