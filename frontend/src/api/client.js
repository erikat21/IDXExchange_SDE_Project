// frontend/src/api/client.js

const API_BASE_URL = 'http://localhost:5000';

export async function fetchProperties(params = {}) {
    const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== '' && value != null)
    );

    const queryParams = new URLSearchParams(cleanParams).toString();
    const url = `${API_BASE_URL}/api/properties${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.statusText}`);
    }
    return response.json();
}

export async function fetchPropertyDetail(id) {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch property details: ${response.statusText}`);
    }
    return response.json();
}