import { fetchProperties } from './client';

describe('API Client - fetchProperties', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('fetches properties successfully without params', async () => {
        const mockResponse = { total: 1, results: [{ id: 1 }] };
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });

        const data = await fetchProperties();
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/properties');
        expect(data).toEqual(mockResponse);
    });

    test('omits empty filter parameters from query string', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ total: 0, results: [] }),
        });

        await fetchProperties({ city: 'Irvine', minPrice: '' });
        expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/properties?city=Irvine');
    });

    test('throws an error when response is not ok', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            statusText: 'Internal Server Error',
        });

        await expect(fetchProperties()).rejects.toThrow('Failed to fetch properties: Internal Server Error');
    });
});