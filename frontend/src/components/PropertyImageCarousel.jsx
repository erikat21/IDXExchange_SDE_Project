import React, { useState } from 'react';

export default function PropertyImageCarousel({ photos = [] }) {
    let parsedPhotos = [];
    try {
        parsedPhotos = typeof photos === 'string' ? JSON.parse(photos) : photos;
    } catch {
        parsedPhotos = [];
    }

    const [currentIndex, setCurrentIndex] = useState(0);

    if (!parsedPhotos || parsedPhotos.length === 0) {
        return (
            <div style={fallbackStyle}>
                <span>No Image Available</span>
            </div>
        );
    }

    const handlePrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? parsedPhotos.length - 1 : prev - 1));
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev === parsedPhotos.length - 1 ? 0 : prev + 1));
    };

    return (
        <div style={containerStyle}>
            <img 
                src={parsedPhotos[currentIndex]} 
                alt="Property preview" 
                style={imgStyle} 
            />
            {parsedPhotos.length > 1 && (
                <>
                    <button onClick={handlePrev} style={leftArrowStyle}>❮</button>
                    <button onClick={handleNext} style={rightArrowStyle}>❯</button>
                    <div style={counterStyle}>
                        {currentIndex + 1} / {parsedPhotos.length}
                    </div>
                </>
            )}
        </div>
    );
}

const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '200px',
    backgroundColor: '#eee',
    overflow: 'hidden',
    borderRadius: '8px 8px 0 0'
};

const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
};

const fallbackStyle = {
    width: '100%',
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9ecef',
    color: '#6c757d',
    borderRadius: '8px 8px 0 0'
};

const arrowStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    border: 'none',
    padding: '6px 10px',
    cursor: 'pointer',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '12px'
};

const leftArrowStyle = { ...arrowStyle, left: '8px' };
const rightArrowStyle = { ...arrowStyle, right: '8px' };

const counterStyle = {
    position: 'absolute',
    bottom: '8px',
    right: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px'
};