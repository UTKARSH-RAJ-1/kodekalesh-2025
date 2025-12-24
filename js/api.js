const API_URL = 'http://localhost:3000';

function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

export async function login(username, password) {
    const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
    }
    return await response.json();
}

export async function fetchExpiryData() {
    const response = await fetch(`${API_URL}/api/expiry`, { headers: getAuthHeaders() });
    return await response.json();
}

export async function fetchRawMaterials() {
    const response = await fetch(`${API_URL}/api/raw-materials`, { headers: getAuthHeaders() });
    return await response.json();
}

export async function fetchRawMaterialBatches() {
    const response = await fetch(`${API_URL}/api/raw-materials/batches`, { headers: getAuthHeaders() });
    return await response.json();
}

export async function fetchTraceability(material) {
    const response = await fetch(`${API_URL}/api/traceability?material=${material}`, { headers: getAuthHeaders() });
    return await response.json();
}

export async function fetchBatchDetails(batchId) {
    const response = await fetch(`${API_URL}/api/traceability/batch/${batchId}`, { headers: getAuthHeaders() });
    if (!response.ok) throw new Error('Batch not found');
    return await response.json();
}

export async function fetchSuppliers(material) {
    const response = await fetch(`${API_URL}/api/suppliers?material=${material}`, { headers: getAuthHeaders() });
    return await response.json();
}

export async function fetchWeatherAlerts() {
    try {
        const response = await fetch(`${API_URL}/api/alerts`);
        const data = await response.json();
        return data.alerts || [];
    } catch (error) {
        console.error('Error fetching weather alerts:', error);
        return [];
    }
}
