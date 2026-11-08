import React from 'react';

export default function PropertyMap({ lat, lng, address }) {
    if (!lat || !lng) return null;

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

    return (
        <div style={{ margin: '24px 0' }}>
            <h3>Location & Map</h3>
            <div style={{ width: '100%', height: '350px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                <iframe
                    title="Property Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={embedUrl}
                />
            </div>
            <div style={{ marginTop: '8px' }}>
                <a href={directionsUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
                    Get Directions ↗
                </a>
            </div>
        </div>
    );
}