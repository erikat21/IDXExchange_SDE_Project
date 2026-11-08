import React, { useState, useEffect, useRef } from 'react';

export default function PropertyImageGallery({ photos }) {
    const [photoList, setPhotoList] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const lightboxRef = useRef(null);

    // Parse L_Photos JSON string or handle array safely
    useEffect(() => {
        if (!photos) {
            setPhotoList([]);
            return;
        }
        if (Array.isArray(photos)) {
            setPhotoList(photos);
        } else if (typeof photos === 'string') {
            try {
                const parsed = JSON.parse(photos);
                setPhotoList(Array.isArray(parsed) ? parsed : []);
            } catch (e) {
                console.error("Failed to parse L_Photos JSON:", e);
                setPhotoList([]);
            }
        }
    }, [photos]);

    // Focus lightbox when opened so keyboard event listener fires
    useEffect(() => {
        if (isLightboxOpen && lightboxRef.current) {
            lightboxRef.current.focus();
        }
    }, [isLightboxOpen]);

    if (photoList.length === 0) {
        return (
            <div style={placeholderStyle}>
                📷 No Image Available
            </div>
        );
    }

    const currentPhoto = photoList[selectedIndex];

    const handlePrev = (e) => {
        if (e) e.stopPropagation();
        setSelectedIndex((prev) => (prev === 0 ? photoList.length - 1 : prev - 1));
    };

    const handleNext = (e) => {
        if (e) e.stopPropagation();
        setSelectedIndex((prev) => (prev === photoList.length - 1 ? 0 : prev + 1));
    };

    // Keyboard navigation handler for lightbox (Escape, Left Arrow, Right Arrow)
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsLightboxOpen(false);
        } else if (e.key === 'ArrowLeft') {
            handlePrev();
        } else if (e.key === 'ArrowRight') {
            handleNext();
        }
    };

    return (
        <div style={{ marginBottom: '24px' }}>
            {/* Main Featured Photo Container with Navigation Arrows */}
            <div style={mainImageWrapperStyle} onClick={() => setIsLightboxOpen(true)}>
                <img 
                    src={currentPhoto} 
                    alt="Property detail" 
                    style={mainImageStyle} 
                />

                {/* Left Arrow on Main View */}
                {photoList.length > 1 && (
                    <button onClick={handlePrev} style={{ ...mainNavArrowStyle, left: '12px' }}>
                        ❮
                    </button>
                )}

                {/* Right Arrow on Main View */}
                {photoList.length > 1 && (
                    <button onClick={handleNext} style={{ ...mainNavArrowStyle, right: '12px' }}>
                        ❯
                    </button>
                )}

                {/* Photo Counter Badge */}
                <div style={counterBadgeStyle}>
                    {selectedIndex + 1} / {photoList.length}
                </div>

                <div style={clickToEnlargeBadge}>🔍 Click for full view</div>
            </div>

            {/* Thumbnail Strip */}
            {photoList.length > 1 && (
                <div style={thumbnailStripStyle}>
                    {photoList.map((photo, idx) => (
                        <img
                            key={idx}
                            src={photo}
                            alt={`Thumbnail ${idx + 1}`}
                            onClick={() => setSelectedIndex(idx)}
                            style={{
                                ...thumbnailStyle,
                                border: idx === selectedIndex ? '3px solid #007bff' : '2px solid transparent',
                                opacity: idx === selectedIndex ? 1 : 0.7
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Full-Screen Lightbox Modal */}
            {isLightboxOpen && (
                <div
                    ref={lightboxRef}
                    tabIndex={0} // REQUIRED for <div> to receive keyboard events!
                    onKeyDown={handleKeyDown}
                    onClick={() => setIsLightboxOpen(false)} // Close on backdrop click
                    style={lightboxOverlayStyle}
                >
                    {/* Close Button */}
                    <button 
                        onClick={() => setIsLightboxOpen(false)} 
                        style={closeButtonStyle}
                    >
                        ✕
                    </button>

                    {/* Left Lightbox Arrow */}
                    {photoList.length > 1 && (
                        <button 
                            onClick={handlePrev} 
                            style={{ ...lightboxNavArrowStyle, left: '20px' }}
                        >
                            ❮
                        </button>
                    )}

                    {/* Lightbox Main Image (Stop propagation so clicking the image doesn't close modal) */}
                    <div style={lightboxContentStyle} onClick={(e) => e.stopPropagation()}>
                        <img 
                            src={currentPhoto} 
                            alt={`Full view ${selectedIndex + 1}`} 
                            style={lightboxImageStyle} 
                        />
                        <div style={lightboxCounterStyle}>
                            {selectedIndex + 1} / {photoList.length}
                        </div>
                    </div>

                    {/* Right Lightbox Arrow */}
                    {photoList.length > 1 && (
                        <button 
                            onClick={handleNext} 
                            style={{ ...lightboxNavArrowStyle, right: '20px' }}
                        >
                            ❯
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Inline Styles
const placeholderStyle = {
    height: '350px',
    backgroundColor: '#e9ecef',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    color: '#6c757d',
    fontSize: '1.2rem'
};

const mainImageWrapperStyle = {
    position: 'relative',
    height: '450px',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundColor: '#000'
};

const mainImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
};

const mainNavArrowStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    padding: '10px 14px',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 10
};

const counterBadgeStyle = {
    position: 'absolute',
    top: '12px',
    left: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '0.85rem'
};

const clickToEnlargeBadge = {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '0.85rem'
};

const thumbnailStripStyle = {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    padding: '10px 0',
    marginTop: '8px'
};

const thumbnailStyle = {
    width: '90px',
    height: '60px',
    objectFit: 'cover',
    borderRadius: '4px',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.2s ease-in-out'
};

const lightboxOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none'
};

const lightboxContentStyle = {
    position: 'relative',
    maxWidth: '90%',
    maxHeight: '90%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
};

const lightboxImageStyle = {
    maxWidth: '100%',
    maxHeight: '80vh',
    objectFit: 'contain',
    borderRadius: '4px'
};

const lightboxCounterStyle = {
    color: '#ffffff',
    marginTop: '12px',
    fontSize: '1rem'
};

const closeButtonStyle = {
    position: 'absolute',
    top: '20px',
    right: '25px',
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '32px',
    cursor: 'pointer',
    zIndex: 10000
};

const lightboxNavArrowStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: '#fff',
    fontSize: '28px',
    padding: '12px 16px',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 10000
};