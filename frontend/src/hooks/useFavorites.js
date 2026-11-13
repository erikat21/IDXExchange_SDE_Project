import { useState, useEffect } from 'react';

export function useFavorites() {
    const [favorites, setFavorites] = useState(() => {
        try {
            const saved = localStorage.getItem('property_favorites');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('property_favorites', JSON.stringify(favorites));
        } catch (e) {
            console.error('Failed to save favorites to localStorage', e);
        }
    }, [favorites]);

    const toggleFavorite = (propertyId) => {
        setFavorites((prev) =>
            prev.includes(propertyId)
                ? prev.filter((id) => id !== propertyId)
                : [...prev, propertyId]
        );
    };

    const isFavorite = (propertyId) => favorites.includes(propertyId);

    return { favorites, toggleFavorite, isFavorite };
}