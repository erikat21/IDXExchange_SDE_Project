// frontend/src/components/Pagination.jsx
import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null; // Hide pagination if only one page exists

    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    return (
        <div style={paginationStyle}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={btnStyle(currentPage === 1)}
            >
                Previous
            </button>

            {getPageNumbers().map((page, index) => {
                if (page === '...') {
                    return <span key={`dots-${index}`} style={dotsStyle}>...</span>;
                }
                return (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        style={pageBtnStyle(currentPage === page)}
                    >
                        {page}
                    </button>
                );
            })}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={btnStyle(currentPage === totalPages)}
            >
                Next
            </button>
        </div>
    );
}

const paginationStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    margin: '32px 0'
};

const btnStyle = (disabled) => ({
    padding: '8px 14px',
    backgroundColor: disabled ? '#e9ecef' : '#007bff',
    color: disabled ? '#6c757d' : '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer'
});

const pageBtnStyle = (active) => ({
    padding: '8px 12px',
    backgroundColor: active ? '#0056b3' : '#f8f9fa',
    color: active ? '#fff' : '#333',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: active ? 'bold' : 'normal'
});

const dotsStyle = {
    padding: '0 4px',
    color: '#6c757d'
};