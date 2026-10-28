import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PropertyFilters from './PropertyFilters';

describe('PropertyFilters Component', () => {
    test('renders all six filter inputs and buttons', () => {
        render(<PropertyFilters onSearch={() => {}} onClear={() => {}} />);
        
        expect(screen.getByPlaceholderText(/City/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/ZIP Code/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Min Price/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Max Price/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue(/Any Beds/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue(/Any Baths/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Clear Filters/i })).toBeInTheDocument();
    });

    test('calls onSearch with filter values when submitted', () => {
        const handleSearch = jest.fn();
        render(<PropertyFilters onSearch={handleSearch} onClear={() => {}} />);

        fireEvent.change(screen.getByPlaceholderText(/City/i), { target: { value: 'San Diego' } });
        fireEvent.click(screen.getByRole('button', { name: /Search/i }));

        expect(handleSearch).toHaveBeenCalledWith(expect.objectContaining({ city: 'San Diego' }));
    });

    test('resets inputs and calls onClear when Clear button is clicked', () => {
        const handleClear = jest.fn();
        render(<PropertyFilters onSearch={() => {}} onClear={handleClear} />);

        const cityInput = screen.getByPlaceholderText(/City/i);
        fireEvent.change(cityInput, { target: { value: 'Los Angeles' } });
        expect(cityInput.value).toBe('Los Angeles');

        fireEvent.click(screen.getByRole('button', { name: /Clear Filters/i }));
        expect(cityInput.value).toBe('');
        expect(handleClear).toHaveBeenCalled();
    });
});