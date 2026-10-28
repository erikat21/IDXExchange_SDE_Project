// frontend/src/App.test.js
import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ total: 0, results: [] }),
    });
});

test('renders app header after loading', async () => {
    render(<App />);
    const headerElement = await screen.findByText(/Property Listings/i);
    expect(headerElement).toBeInTheDocument();
});