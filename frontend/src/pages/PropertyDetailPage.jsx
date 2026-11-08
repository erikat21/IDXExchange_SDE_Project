import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPropertyDetail } from '../api/client';
import PropertyImageGallery from '../components/PropertyImageGallery';
import PropertyMap from '../components/PropertyMap';

export default function PropertyDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [openHouses, setOpenHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
    async function loadDetailAndOpenHouses() {
        try {
            setLoading(true);

            // 1. Fetch Property Detail
            const data = await fetchPropertyDetail(id);
            const propertyObj = Array.isArray(data) ? data[0] : (data.property || data.result || data);
            setProperty(propertyObj);

            // 2. Fetch Open Houses using explicit backend host or listing ID
            const targetId = propertyObj?.L_ListingID || propertyObj?.id || id;
            
            console.log("Fetching open houses for identifier:", targetId);

            const openHouseRes = await fetch(`http://localhost:5000/api/properties/${targetId}/openhouses`)
                .then(res => {
                    console.log("Openhouse response status:", res.status);
                    return res.ok ? res.json() : [];
                })
                .catch(err => {
                    console.error("Openhouse fetch network error:", err);
                    return [];
                });

            console.log("Open Houses Received:", openHouseRes);
            setOpenHouses(Array.isArray(openHouseRes) ? openHouseRes : []);
            setError(null);
        } catch (err) {
            console.error("Failed to load page:", err);
            setError(err.message || 'Failed to load property details.');
        } finally {
            setLoading(false);
        }
    }

    if (id) {
        loadDetailAndOpenHouses();
    }
}, [id]);

    if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}>Loading property details...</div>;
    if (error) return (
        <div style={{ textAlign: 'center', padding: '60px', color: '#d9534f' }}>
            <h2>Error Loading Property</h2>
            <p>{error}</p>
            <button onClick={() => navigate(-1)} style={backButtonStyle}>
                ← Back to Listings
            </button>
        </div>
    );
    if (!property) return <div style={{ textAlign: 'center', padding: '60px' }}>Property not found.</div>;

    // Schema Field Mappings & Half-Bath Calculations
    const beds = property.L_Keyword2 ?? 'N/A'; // L_Keyword2 is '# Beds'
    
    const decBaths = property.LM_Dec_3 !== null && property.LM_Dec_3 !== undefined ? parseFloat(property.LM_Dec_3) : 0;
    const halfBaths = parseInt(property.BathroomsHalf || 0, 10);
    const totalBaths = (decBaths % 1 === 0 && halfBaths > 0) ? decBaths + (halfBaths * 0.5) : decBaths;
    const baths = totalBaths > 0 ? totalBaths : 'N/A';

    const garage = property.L_Keyword5 ?? 'N/A'; // L_Keyword5 is 'Garage Capacity'
    const sqft = property.LM_Int2_3 ?? 'N/A';    // LM_Int2_3 is 'Apx Fin SQFT'
    const price = property.L_SystemPrice || 0;   // L_SystemPrice is 'Search Price'
    
    const address = `${property.L_Address || ''}, ${property.L_City || ''}, ${property.L_State || ''} ${property.L_Zip || ''}`.replace(/^,\s*|\s*,\s*$/, '');
    const description = property.L_Remarks || 'No description available.';
    const yearBuilt = property.YearBuilt ?? 'N/A';

    // Helper to safely extract remarks from the nested all_data JSON string or object
    const getOpenHouseRemarks = (oh) => {
        if (!oh.all_data) return oh.OH_Remarks || oh.Remarks || null;
        try {
            const parsed = typeof oh.all_data === 'string' ? JSON.parse(oh.all_data) : oh.all_data;
            return parsed.OH_Remarks || parsed.Remarks || parsed.L_Remarks || null;
        } catch (e) {
            return null;
        }
    };

    // Helper to format 24-hour SQL time strings (e.g., "13:30:00") to 12-hour AM/PM format
    const formatTime = (timeStr) => {
        if (!timeStr) return 'N/A';
        const parts = timeStr.split(':');
        if (parts.length < 2) return timeStr;
        let hours = parseInt(parts[0], 10);
        const minutes = parts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours}:${minutes} ${ampm}`;
    };

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <button onClick={() => navigate(-1)} style={backButtonStyle}>
                ← Back to Listings
            </button>

            <h1>{address}</h1>
            <h2 style={{ color: '#28a745', marginBottom: '20px' }}>
                ${Number(price).toLocaleString()}
            </h2>

            <PropertyImageGallery photos={property.L_Photos} />

            <div style={statsGrid}>
                <div style={statBox}><strong>Bedrooms:</strong> {beds}</div>
                <div style={statBox}><strong>Bathrooms:</strong> {baths}</div>
                <div style={statBox}><strong>Garage:</strong> {garage} spaces</div>
                <div style={statBox}><strong>SqFt:</strong> {sqft}</div>
                <div style={statBox}><strong>Year Built:</strong> {yearBuilt}</div>
            </div>

            {/* Open Houses Section */}
            <div style={openHouseSectionStyle}>
                <h3>📅 Open Houses</h3>
                {openHouses.length === 0 ? (
                    <p style={{ color: '#6c757d', fontStyle: 'italic' }}>No open houses scheduled for this property.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                        {openHouses.map((oh, index) => {
                            const remarks = getOpenHouseRemarks(oh);
                            
                            // Parse date safely ignoring timezone offsets
                            const dateParts = oh.OpenHouseDate ? oh.OpenHouseDate.split('T')[0].split('-') : null;
                            const formattedDate = dateParts && dateParts.length === 3
                                ? new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : 'Date TBD';

                            const rawDateStr = dateParts ? dateParts.join('-') : '';
                            const isPast = rawDateStr && rawDateStr < todayStr;

                            return (
                                <div key={oh.id || index} style={{
                                    ...openHouseCardStyle,
                                    opacity: isPast ? 0.8 : 1,
                                    backgroundColor: isPast ? '#f8f9fa' : '#ffffff'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontWeight: 'bold', color: isPast ? '#495057' : '#007bff', fontSize: '1.05rem' }}>
                                            {formattedDate}
                                        </div>
                                        {isPast && (
                                            <span style={pastBadgeStyle}>
                                                Past Event
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ color: '#333', margin: '4px 0' }}>
                                        <strong>Time:</strong> {formatTime(oh.OH_StartTime)} - {formatTime(oh.OH_EndTime)}
                                    </div>
                                    {remarks && (
                                        <div style={{ color: '#555', fontSize: '0.9rem', marginTop: '6px', fontStyle: 'italic' }}>
                                            "{remarks}"
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div style={{ margin: '24px 0' }}>
                <h3>Description</h3>
                <p style={{ lineHeight: '1.6', color: '#444' }}>{description}</p>
            </div>

            <PropertyMap lat={property.LMD_MP_Latitude} lng={property.LMD_MP_Longitude} />
        </div>
    );
}

// Layout Styles
const backButtonStyle = {
    background: 'none',
    border: 'none',
    color: '#007bff',
    fontSize: '16px',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '20px',
    textDecoration: 'underline',
};

const statsGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    margin: '24px 0',
};

const statBox = {
    padding: '16px',
    backgroundColor: '#f1f3f5',
    borderRadius: '6px',
    textAlign: 'center',
};

const openHouseSectionStyle = {
    margin: '24px 0',
    padding: '20px',
    backgroundColor: '#eef6ff',
    borderRadius: '8px',
    border: '1px solid #b6d4fe',
};

const openHouseCardStyle = {
    padding: '14px 16px',
    borderRadius: '6px',
    border: '1px solid #d0e2ff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const pastBadgeStyle = {
    fontSize: '0.75rem',
    backgroundColor: '#e9ecef',
    color: '#6c757d',
    padding: '3px 8px',
    borderRadius: '4px',
    fontWeight: '600',
};