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

export async function fetchFinishedGoods() {
    // Mock Data for Finished Goods
    return [
        {
            id: 'FG-001',
            name: 'Spicy Potato Chips',
            sku: 'SPC-100g',
            current_stock: 1200,
            max_stock: 5000,
            market_demand: 'High ⬆️',
            predicted_production_need: 850,
            unit_price: 20.00,
            status: 'In Stock'
        },
        {
            id: 'FG-002',
            name: 'Salted Corn Rings',
            sku: 'SCR-50g',
            current_stock: 450,
            max_stock: 3000,
            market_demand: 'Medium ➡️',
            predicted_production_need: 1200,
            unit_price: 15.00,
            status: 'Low Stock'
        },
        {
            id: 'FG-003',
            name: 'Masala Wheat Sticks',
            sku: 'MWS-100g',
            current_stock: 2800,
            max_stock: 4000,
            market_demand: 'Low ⬇️',
            predicted_production_need: 0,
            unit_price: 25.00,
            status: 'Overstocked'
        },
        {
            id: 'FG-004',
            name: 'Classic Salted Wafers',
            sku: 'CSW-200g',
            current_stock: 100,
            max_stock: 2500,
            market_demand: 'Very High ⬆️',
            predicted_production_need: 2400,
            unit_price: 40.00,
            status: 'Critical Low'
        },
        {
            id: 'FG-005',
            name: 'Cheese Balls',
            sku: 'CB-150g',
            current_stock: 3200,
            max_stock: 4000,
            market_demand: 'High ⬆️',
            predicted_production_need: 500,
            unit_price: 35.00,
            status: 'In Stock'
        },
        {
            id: 'FG-006',
            name: 'Corn Puffs',
            sku: 'CP-80g',
            current_stock: 1500,
            max_stock: 3000,
            market_demand: 'Medium ➡️',
            predicted_production_need: 1000,
            unit_price: 18.00,
            status: 'In Stock'
        },
        {
            id: 'FG-007',
            name: 'Baked Wheat Sticks',
            sku: 'BWS-120g',
            current_stock: 4800,
            max_stock: 5000,
            market_demand: 'Low ⬇️',
            predicted_production_need: 0,
            unit_price: 30.00,
            status: 'Overstocked'
        },
        {
            id: 'FG-008',
            name: 'Veggie Chips',
            sku: 'VC-100g',
            current_stock: 50,
            max_stock: 2000,
            market_demand: 'Very High ⬆️',
            predicted_production_need: 1950,
            unit_price: 55.00,
            status: 'Critical Low'
        },
        {
            id: 'FG-009',
            name: 'Masala Munch',
            sku: 'MM-200g',
            current_stock: 800,
            max_stock: 5000,
            market_demand: 'High ⬆️',
            predicted_production_need: 3000,
            unit_price: 45.00,
            status: 'Low Stock'
        }
    ];
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

export async function fetchQualityIncidents() {
    return [
        { id: 'QI-001', date: '2025-10-24', type: 'Foreign Material', details: 'Plastic fragment found in Potato Batch B-102', severity: 'High', status: 'Open' },
        { id: 'QI-002', date: '2025-10-22', type: 'Moisture Content', details: 'Wheat Batch W-908 exceeds moisture limit (14%)', severity: 'Medium', status: 'Investigating' },
        { id: 'QI-003', date: '2025-10-15', type: 'Packaging', details: 'Damaged seals on Oil drums from Supplier X', severity: 'Low', status: 'Resolved' },
        { id: 'QI-004', date: '2025-10-10', type: 'Pest Control', details: 'Minor pest activity detected near storage unit C', severity: 'Medium', status: 'Resolved' }
    ];
}

export async function fetchComplianceData() {
    return [
        { id: 'C-001', name: 'FSSAI License', supplier: 'Agro Farms Ltd', expiry: '2025-12-31', status: 'Valid' },
        { id: 'C-002', name: 'ISO 9001:2015', supplier: 'Global Spices Corp', expiry: '2025-11-15', status: 'Expiring Soon' },
        { id: 'C-003', name: 'Organic Certification', supplier: 'Green Earth Supplies', expiry: '2025-09-30', status: 'Expired' },
        { id: 'C-004', name: 'Halal Certification', supplier: 'Pure Oils Pvt Ltd', expiry: '2026-06-20', status: 'Valid' }
    ];
}

