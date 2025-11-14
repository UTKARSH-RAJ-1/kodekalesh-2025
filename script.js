// This runs when the website is loaded
document.addEventListener('DOMContentLoaded', () => {
  // --- MODAL CODE (Unchanged) ---
  const loginButton = document.getElementById('login-btn');
  const loginModal = document.getElementById('login-modal');
  const closeBtn = document.querySelector('.close-btn');
  const loginForm = document.getElementById('login-form');

  loginButton.addEventListener('click', () => {
    loginModal.classList.add('modal-open');
  });
  closeBtn.addEventListener('click', () => {
    loginModal.classList.remove('modal-open');
  });
  window.addEventListener('click', (event) => {
    if (event.target == loginModal) {
      loginModal.classList.remove('modal-open');
    }
  });
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('Login successful! (Simulation)');
    loginModal.classList.remove('modal-open');
    loginButton.textContent = 'Logged In';
    loginButton.disabled = true;
  });
  // --- END MODAL CODE ---

  // --- Main Sidebar Navigation ---
  const navExpiryDashboard = document.getElementById('nav-expiry-dashboard');
  const navRawMaterials = document.getElementById('nav-raw-materials');
  const navBatchTraceability = document.getElementById(
    'nav-batch-traceability'
  );
  const navSuppliers = document.getElementById('nav-suppliers');

  navExpiryDashboard.addEventListener('click', (e) => {
    e.preventDefault();
    renderExpiryDashboardPage();
    setActiveSidebarLink('nav-expiry-dashboard');
  });

  navRawMaterials.addEventListener('click', (e) => {
    e.preventDefault();
    renderRawMaterialsPage();
    setActiveSidebarLink('nav-raw-materials');
  });

  navBatchTraceability.addEventListener('click', (e) => {
    e.preventDefault();
    renderBatchTraceabilityPage();
    setActiveSidebarLink('nav-batch-traceability');
  });

  navSuppliers.addEventListener('click', (e) => {
    e.preventDefault();
    renderSuppliersPage();
    setActiveSidebarLink('nav-suppliers');
  });

  // Load the default page
  renderExpiryDashboardPage();
});

// Helper to set active sidebar link
function setActiveSidebarLink(activeId) {
  const links = document.querySelectorAll('#sidebar li a');
  links.forEach((link) => link.classList.remove('active'));
  document.getElementById(activeId).classList.add('active');
}

// --- Date Helper Functions (Unchanged) ---
function getFutureDate(daysToAdd) {
  const today = new Date();
  today.setDate(today.getDate() + daysToAdd);
  return today.toISOString().split('T')[0];
}
function daysUntil(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// --- PAGE RENDERER: Expiry Dashboard (Unchanged) ---
function renderExpiryDashboardPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <h2 class="page-title">Expiry Dashboard</h2>
    <div id="page-content-container"></div>
  `;
  renderExpiryList();
}

// --- PAGE RENDERER: Raw Materials (UPDATED) ---
function renderRawMaterialsPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <h2 class="page-title">Raw Materials Inventory</h2>
    <div id="page-content-container"></div>
  `;

  // NEW: Add listener for card clicks
  const container = mainContent.querySelector('#page-content-container');
  container.addEventListener('click', (event) => {
    const clickedCard = event.target.closest('.clickable-card');
    // Check if a card was clicked and it's on the main list (not a batch detail)
    if (clickedCard && clickedCard.hasAttribute('data-material-name')) {
      const materialName = clickedCard.getAttribute('data-material-name');
      renderBatchDetailPage(materialName);
    }
  });

  renderRawMaterialsList();
}

// --- NEW: PAGE RENDERER: Batch Detail Page ---
function renderBatchDetailPage(materialName) {
  const mainContent = document.getElementById('main-content');
  // Find the batches for the selected material
  const batches = rawMaterialBatches[materialName] || [];

  let batchCardsHTML = '';
  if (batches.length > 0) {
    batches.forEach((batch) => {
      batchCardsHTML += `
        <div class="inventory-card"> <h3>Batch: ${batch.batchId}</h3>
          <div class="card-details">
            <div class="detail-item"><strong>Delivered:</strong> ${
              batch.delivered
            }</div>
            <div class="detail-item"><strong>Expires:</strong> ${
              batch.expiry
            }</div>
            <div class="detail-item"><strong>Quantity:</strong> ${batch.quantity.toLocaleString()} kg</div>
          </div>
          <div class="quantity-bar-container">
            <p class="bar-label">Quality Score:</p>
            <div class="quantity-bar-bg">
              <div class="quantity-bar-fill quality-fill" style="width: ${
                batch.qualityScore
              }%;"></div>
            </div>
            <div class="quantity-bar-text">${batch.qualityScore} / 100</div>
          </div>
        </div>
      `;
    });
  } else {
    batchCardsHTML = '<p>No batch information available for this material.</p>';
  }

  // Set the HTML for the whole page
  mainContent.innerHTML = `
    <button id="back-to-raw-materials" class="back-btn">← Back to All Materials</button>
    <h2 class="page-title">Batches for ${materialName}</h2>
    <div id="page-content-container">
      ${batchCardsHTML}
    </div>
  `;

  // Add listener for the new back button
  document
    .getElementById('back-to-raw-materials')
    .addEventListener('click', () => {
      renderRawMaterialsPage();
    });
}

// --- PAGE RENDERER: Batch Traceability (Unchanged) ---
function renderBatchTraceabilityPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <h2 class="page-title">Batch Traceability</h2>
    <div class="sub-nav-bar">
      <button id="tab-wheat-batch" class="nav-tab active">Wheat</button>
      <button id="tab-potato-batch" class="nav-tab">Potato</button>
      <button id="tab-maize-batch" class="nav-tab">Maize</button>
    </div>
    <div id="trace-list-container"></div>
  `;

  const navTabs = mainContent.querySelectorAll('.nav-tab');
  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      navTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      switch (tab.id) {
        case 'tab-wheat-batch':
          renderBatchList(wheatBatches);
          break;
        case 'tab-potato-batch':
          renderBatchList(potatoBatches);
          break;
        case 'tab-maize-batch':
          renderBatchList(maizeBatches);
          break;
      }
    });
  });
  renderBatchList(wheatBatches);
}

// --- PAGE RENDERER: Suppliers (Unchanged) ---
function renderSuppliersPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <h2 class="page-title">Suppliers Marketplace</h2>
    <div class="sub-nav-bar">
      <button id="tab-wheat" class="nav-tab active">Wheat</button>
      <button id="tab-potato" class="nav-tab">Potato</button>
      <button id="tab-maize" class="nav-tab">Maize</button>
    </div>
    <div id="supplier-list-container"></div>
  `;

  const navTabs = mainContent.querySelectorAll('.nav-tab');
  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      navTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      switch (tab.id) {
        case 'tab-wheat':
          renderSupplierList(wheatSupplierData);
          break;
        case 'tab-potato':
          renderSupplierList(potatoSupplierData);
          break;
        case 'tab-maize':
          renderSupplierList(maizeSupplierData);
          break;
      }
    });
  });

  const listContainer = mainContent.querySelector('#supplier-list-container');
  listContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('order-inquiry-btn')) {
      const supplierName = event.target
        .closest('.supplier-item')
        .querySelector('h3').textContent;
      alert(`Order inquiry for ${supplierName} would open here.`);
    }
  });

  renderSupplierList(wheatSupplierData);
}

// --- ALL DATA ---

// --- NEW: DATA: Raw Material Batches ---
const rawMaterialBatches = {
  'Wheat Flour': [
    {
      batchId: 'B-1001-A',
      delivered: '2025-11-01',
      expiry: '2026-05-01',
      quantity: 20000,
      qualityScore: 95,
    },
    {
      batchId: 'B-1008-C',
      delivered: '2025-11-10',
      expiry: '2026-05-10',
      quantity: 50000,
      qualityScore: 88,
    },
    {
      batchId: 'B-1009-F',
      delivered: '2025-11-12',
      expiry: '2026-02-12',
      quantity: 5000,
      qualityScore: 92,
    },
  ],
  'Potato Starch': [
    {
      batchId: 'P-045A',
      delivered: '2025-10-15',
      expiry: '2026-01-15',
      quantity: 12000,
      qualityScore: 75,
    },
  ],
  'Maize (for Corn Flour)': [
    {
      batchId: 'M-023B',
      delivered: '2025-11-05',
      expiry: '2026-06-05',
      quantity: 40000,
      qualityScore: 90,
    },
  ],
  'Refined Sugar': [
    {
      batchId: 'S-0771',
      delivered: '2025-09-20',
      expiry: '2027-09-20',
      quantity: 30000,
      qualityScore: 99,
    },
  ],
  'Vegetable Oil': [
    {
      batchId: 'V-004C',
      delivered: '2025-11-08',
      expiry: '2026-03-08',
      quantity: 5000,
      qualityScore: 85,
    },
  ],
};

// --- DATA: Batch Traceability ---
const wheatBatches = [
  {
    batchId: 'B-1001-A',
    productName: 'Wheat Flour',
    supplierName: 'Kanpur Wheat Co-op',
    orderAmount: 20000,
    status: 'In Transit',
    totalRoute: 450,
    coveredRoute: 310,
  },
  {
    batchId: 'B-1008-C',
    productName: 'Wheat Flour',
    supplierName: 'Punjab Golden Fields',
    orderAmount: 50000,
    status: 'Loading',
    totalRoute: 820,
    coveredRoute: 0,
  },
  {
    batchId: 'B-1009-F',
    productName: 'Organic Wheat',
    supplierName: 'Himalayan Organics',
    orderAmount: 10000,
    status: 'Packing',
    totalRoute: 600,
    coveredRoute: 0,
  },
];
const potatoBatches = [
  {
    batchId: 'P-045A',
    productName: 'Potato (Chip Grade)',
    supplierName: 'Agra Potato Growers',
    orderAmount: 30000,
    status: 'In Transit',
    totalRoute: 300,
    coveredRoute: 280,
  },
  {
    batchId: 'P-046B',
    productName: 'Potato',
    supplierName: 'Indore Farm Fresh',
    orderAmount: 25000,
    status: 'In Transit',
    totalRoute: 710,
    coveredRoute: 150,
  },
];
const maizeBatches = [
  {
    batchId: 'M-023B',
    productName: 'Maize (Feed Grade)',
    supplierName: 'Bihar Maize Collective',
    orderAmount: 100000,
    status: 'Packing',
    totalRoute: 550,
    coveredRoute: 0,
  },
];

// --- DATA: Expiry Data ---
const expiryData = [
  {
    name: 'Bulk Wheat Flour',
    batchId: 'B-1001-A',
    quantity: 500,
    unit: 'kg',
    expiryDate: getFutureDate(8),
  },
  {
    name: 'Active Dry Yeast',
    batchId: 'B-1003-B',
    quantity: 20,
    unit: 'kg',
    expiryDate: getFutureDate(2),
  },
  {
    name: 'Finished Biscuits',
    batchId: 'F-0982',
    quantity: 1500,
    unit: 'units',
    expiryDate: getFutureDate(35),
  },
  {
    name: 'Potato Starch',
    batchId: 'P-045A',
    quantity: 250,
    unit: 'kg',
    expiryDate: getFutureDate(-2),
  },
  {
    name: 'Vegetable Oil',
    batchId: 'V-004C',
    quantity: 120,
    unit: 'liters',
    expiryDate: getFutureDate(20),
  },
  {
    name: 'Maize Flour',
    batchId: 'M-023B',
    quantity: 400,
    unit: 'kg',
    expiryDate: getFutureDate(14),
  },
];

// --- DATA: Raw Materials ---
const rawMaterialData = [
  {
    name: 'Wheat Flour',
    current_stock: 75000,
    max_stock: 100000,
    daily_consumption: 5000,
    unit: 'kg',
  },
  {
    name: 'Potato Starch',
    current_stock: 12000,
    max_stock: 50000,
    daily_consumption: 2000,
    unit: 'kg',
  },
  {
    name: 'Maize (for Corn Flour)',
    current_stock: 40000,
    max_stock: 80000,
    daily_consumption: 3000,
    unit: 'kg',
  },
  {
    name: 'Refined Sugar',
    current_stock: 30000,
    max_stock: 30000,
    daily_consumption: 2500,
    unit: 'kg',
  },
  {
    name: 'Vegetable Oil',
    current_stock: 5000,
    max_stock: 20000,
    daily_consumption: 1500,
    unit: 'liters',
  },
];

// --- DATA: Suppliers ---
const wheatSupplierData = [
  {
    name: 'Kanpur Wheat Co-op',
    quantity: 50000,
    max_quantity: 100000,
    price: 22.5,
    delivery_time: 2,
  },
  {
    name: 'AgriGrain India',
    quantity: 80000,
    max_quantity: 80000,
    price: 21.75,
    delivery_time: 3,
  },
  {
    name: 'Punjab Golden Fields',
    quantity: 120000,
    max_quantity: 250000,
    price: 23.0,
    delivery_time: 5,
  },
  {
    name: 'UP Farm Collective',
    quantity: 35000,
    max_quantity: 40000,
    price: 22.0,
    delivery_time: 1,
  },
  {
    name: 'Himalayan Organics',
    quantity: 15000,
    max_quantity: 20000,
    price: 35.0,
    delivery_time: 4,
  },
  {
    name: 'Deccan Grains Ltd.',
    quantity: 200000,
    max_quantity: 300000,
    price: 22.8,
    delivery_time: 6,
  },
  {
    name: 'Ganges Millers',
    quantity: 75000,
    max_quantity: 150000,
    price: 21.9,
    delivery_time: 2,
  },
  {
    name: 'HarvestMark Traders',
    quantity: 42000,
    max_quantity: 50000,
    price: 22.25,
    delivery_time: 3,
  },
  {
    name: 'India Wheat Exports',
    quantity: 500000,
    max_quantity: 500000,
    price: 24.5,
    delivery_time: 7,
  },
  {
    name: 'Local Mandi Suppliers',
    quantity: 10000,
    max_quantity: 10000,
    price: 21.0,
    delivery_time: 1,
  },
];
const potatoSupplierData = [
  {
    name: 'Agra Potato Growers',
    quantity: 75000,
    max_quantity: 100000,
    price: 15.0,
    delivery_time: 2,
  },
  {
    name: 'Indore Farm Fresh',
    quantity: 50000,
    max_quantity: 50000,
    price: 14.5,
    delivery_time: 3,
  },
  {
    name: 'Gujarat Potato Co.',
    quantity: 150000,
    max_quantity: 200000,
    price: 15.5,
    delivery_time: 5,
  },
  {
    name: 'West Bengal Farms',
    quantity: 200000,
    max_quantity: 300000,
    price: 14.75,
    delivery_time: 6,
  },
  {
    name: 'Small Farm Collective',
    quantity: 20000,
    max_quantity: 25000,
    price: 16.0,
    delivery_time: 1,
  },
  {
    name: 'Deccan Produce',
    quantity: 90000,
    max_quantity: 100000,
    price: 15.2,
    delivery_time: 4,
  },
  {
    name: 'Himalayan Roots',
    quantity: 30000,
    max_quantity: 30000,
    price: 20.0,
    delivery_time: 5,
  },
  {
    name: 'Chip-Grade Suppliers',
    quantity: 250000,
    max_quantity: 500000,
    price: 16.5,
    delivery_time: 7,
  },
  {
    name: 'Punjab Potato Kings',
    quantity: 180000,
    max_quantity: 200000,
    price: 15.8,
    delivery_time: 3,
  },
  {
    name: 'Local Market Produce',
    quantity: 5000,
    max_quantity: 10000,
    price: 14.0,
    delivery_time: 1,
  },
];
const maizeSupplierData = [
  {
    name: 'Bihar Maize Collective',
    quantity: 150000,
    max_quantity: 200000,
    price: 21.0,
    delivery_time: 4,
  },
  {
    name: 'Karnataka Corn Co.',
    quantity: 300000,
    max_quantity: 300000,
    price: 20.5,
    delivery_time: 6,
  },
  {
    name: 'Central India Feeds',
    quantity: 80000,
    max_quantity: 100000,
    price: 21.2,
    delivery_time: 3,
  },
  {
    name: 'Telangana Maize Farms',
    quantity: 120000,
    max_quantity: 150000,
    price: 20.8,
    delivery_time: 5,
  },
  {
    name: 'Rajasthan Arid Crops',
    quantity: 60000,
    max_qantity: 60000,
    price: 21.5,
    delivery_time: 4,
  },
  {
    name: 'FeedGrade Suppliers',
    quantity: 400000,
    max_quantity: 500000,
    price: 20.0,
    delivery_time: 7,
  },
  {
    name: 'Local Farm Traders',
    quantity: 25000,
    max_quantity: 30000,
    price: 20.75,
    delivery_time: 2,
  },
  {
    name: 'AP Maize Producers',
    quantity: 175000,
    max_quantity: 200000,
    price: 21.1,
    delivery_time: 5,
  },
];

// --- ALL LIST RENDERERS ---

// --- LIST RENDERER: Batch Traceability List (Unchanged) ---
function renderBatchList(data) {
  const container = document.getElementById('trace-list-container');
  container.innerHTML = ''; // Clear list

  if (data.length === 0) {
    container.innerHTML = '<p>No active batches for this material.</p>';
    return;
  }

  data.forEach((batch) => {
    const progressPercent = (batch.coveredRoute / batch.totalRoute) * 100;
    const statusClass = batch.status.toLowerCase().replace(' ', '-');

    const itemCard = document.createElement('div');
    itemCard.className = 'inventory-card';
    itemCard.innerHTML = `
      <h3>${batch.productName} (Batch: ${batch.batchId})</h3>
      
      <div class="card-details">
        <div class="detail-item">
          <strong>Supplier:</strong> ${batch.supplierName}
        </div>
        <div class="detail-item">
          <strong>Order:</strong> ${batch.orderAmount.toLocaleString()} kg
        </div>
        <div class="detail-item">
          <span class="status-tag status-${statusClass}">${batch.status}</span>
        </div>
      </div>

      <div class="quantity-bar-container">
        <p class="bar-label">Route Progress:</p>
        <div class="quantity-bar-bg">
          <div class="quantity-bar-fill route-fill" style="width: ${progressPercent}%;"></div>
        </div>
        <div class="quantity-bar-text">${batch.coveredRoute} km / ${
      batch.totalRoute
    } km</div>
      </div>
    `;
    container.appendChild(itemCard);
  });
}

// --- LIST RENDERER: Expiry List (Unchanged) ---
function renderExpiryList() {
  const container = document.getElementById('page-content-container');
  container.innerHTML = '';

  const itemsWithDaysLeft = expiryData.map((item) => {
    return { ...item, days_left: daysUntil(item.expiryDate) };
  });
  itemsWithDaysLeft.sort((a, b) => a.days_left - b.days_left);

  itemsWithDaysLeft.forEach((item) => {
    let alertClass = '';
    let daysText = '';
    let daysClass = '';

    if (item.days_left <= 0) {
      alertClass = 'alert-expired';
      daysText = `EXPIRED ${Math.abs(item.days_left)} days ago`;
      daysClass = 'expired';
    } else if (item.days_left <= 7) {
      alertClass = 'alert-expiring-soon';
      daysText = `${item.days_left} ${item.days_left > 1 ? 'days' : 'day'} left`;
      daysClass = 'low';
    } else {
      daysText = `${item.days_left} days left`;
    }

    const itemCard = document.createElement('div');
    itemCard.className = `inventory-card ${alertClass}`;
    itemCard.innerHTML = `
      <h3>${item.name}</h3>
      <div class="card-details">
        <div class="detail-item">
          <strong>Batch ID:</strong> ${item.batchId}
        </div>
        <div class="detail-item">
          <strong>Quantity:</strong> ${item.quantity.toLocaleString()} ${
      item.unit
    }
        </div>
      </div>
      <div class="card-details">
        <div class="detail-item">
          <strong>Expires:</strong> ${item.expiryDate}
        </div>
        <div class="detail-item forecast-days ${daysClass}">
          <strong>${daysText}</strong>
        </div>
      </div>
    `;
    container.appendChild(itemCard);
  });
}

// --- LIST RENDERER: Raw Materials List (UPDATED) ---
function renderRawMaterialsList() {
  const container = document.getElementById('page-content-container');
  container.innerHTML = ''; // Clear

  rawMaterialData.forEach((material) => {
    const percent_left = (material.current_stock / material.max_stock) * 100;
    const days_left = material.current_stock / material.daily_consumption;
    let stockBarClass = percent_left < 25 ? 'low-stock' : '';
    let forecastClass = days_left < 7 ? 'low' : '';

    const itemCard = document.createElement('div');
    // NEW: Added clickable-card class
    itemCard.className = 'inventory-card clickable-card';
    // NEW: Added data-material-name attribute
    itemCard.setAttribute('data-material-name', material.name);

    itemCard.innerHTML = `
      <h3>${material.name}</h3>
      <div class="quantity-bar-container">
        <p class="bar-label">Stock Level:</p>
        <div class="quantity-bar-bg">
          <div class="quantity-bar-fill ${stockBarClass}" style="width: ${percent_left}%;"></div>
        </div>
        <div class="quantity-bar-text">${material.current_stock.toLocaleString()} / ${material.max_stock.toLocaleString()} ${
      material.unit
    }</div>
      </div>
      <div class="card-details">
        <div class="detail-item">
          <strong>Usage:</strong> ${material.daily_consumption.toLocaleString()} ${
      material.unit
    } / day
        </div>
        <div class="detail-item forecast-days ${forecastClass}">
          <strong>~${days_left.toFixed(1)} days of production left</strong>
        </div>
      </div>
    `;
    container.appendChild(itemCard);
  });
}

// --- LIST RENDERER: Suppliers List (Unchanged) ---
function renderSupplierList(data) {
  const container = document.getElementById('supplier-list-container');
  container.innerHTML = ''; // Clear

  data.forEach((supplier) => {
    const maxQty = supplier.max_quantity || supplier.max_qantity;
    const percentAvailable = (supplier.quantity / maxQty) * 100;

    const itemCard = document.createElement('div');
    itemCard.className = 'supplier-item';

    itemCard.innerHTML = `
      <h3>${supplier.name}</h3>
      <div class="quantity-bar-container">
        <p class="bar-label">Supply Open for Sale:</p>
        <div class="quantity-bar-bg">
          <div class="quantity-bar-fill" style="width: ${percentAvailable}%;"></div>
        </div>
        <div class="quantity-bar-text">${supplier.quantity.toLocaleString()} / ${maxQty.toLocaleString()} kg</div>
      </div>
      <div class="supplier-details">
        <div class="detail-group">
          <div class="detail-item price">
            Price: ₹${supplier.price.toFixed(2)} / kg
          </div>
          <div class="detail-item">
            <strong>Delivery:</strong> ${supplier.delivery_time} ${
      supplier.delivery_time > 1 ? 'days' : 'day'
    }
          </div>
        </div>
        <button class="order-inquiry-btn">Order Inquiry</button>
      </div>
    `;
    container.appendChild(itemCard);
  });
}