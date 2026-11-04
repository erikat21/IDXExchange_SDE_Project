// frontend/src/components/Pagination.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination Component', () => {
    test('does not render when totalPages is 1 or less', () => {
        const { container } = render(
            <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    test('disables Previous button on page 1 and Next button on last page', () => {
        render(
            <Pagination currentPage={1} totalPages={5} onPageChange={() => {}} />
        );
        expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
        expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled();
    });

    test('calls onPageChange with correct page number when clicked', () => {
        const handlePageChange = jest.fn();
        render(
            <Pagination currentPage={2} totalPages={5} onPageChange={handlePageChange} />
        );

        fireEvent.click(screen.getByRole('button', { name: '3' }));
        expect(handlePageChange).toHaveBeenCalledWith(3);
    });

    // Add to frontend/src/components/Pagination.test.jsx

    test('renders correct ellipsis near the end without duplicate last page', () => {
       render(<Pagination currentPage={22} totalPages={24} onPageChange={() => {}} />);
    
       // Get all rendered page buttons (excluding Previous/Next)
       const pageButtons = screen
           .getAllByRole('button')
          .map((btn) => btn.textContent)
          .filter((text) => text !== 'Previous' && text !== 'Next');

      // Verify '24' appears exactly once at the end
      const lastPageCount = pageButtons.filter((text) => text === '24').length;
      expect(lastPageCount).toBe(1);

      // Verify structure matches "1 ... 20 21 22 23 24"
       expect(pageButtons).toEqual(['1', '20', '21', '22', '23', '24']);
    });
});