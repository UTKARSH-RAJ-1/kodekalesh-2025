const API_URL = 'http://localhost:3000';

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

// --- PAGE RENDERER: Expiry Dashboard ---
async function renderExpiryDashboardPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <h2 class="page-title">Expiry Dashboard</h2>
    <div id="page-content-container">
      <p class="loading">Loading expiry data...</p>
    </div>
  `;
  await renderExpiryList();
}

// --- PAGE RENDERER: Raw Materials ---
async function renderRawMaterialsPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <h2 class="page-title">Raw Materials Inventory</h2>
    <div id="page-content-container">
      <p class="loading">Loading raw materials...</p>
    </div>
  `;

  const container = mainContent.querySelector('#page-content-container');
  container.addEventListener('click', async (event) => {
    const clickedCard = event.target.closest('.clickable-card');
    if (clickedCard && clickedCard.hasAttribute('data-material-name')) {
      const materialName = clickedCard.getAttribute('data-material-name');
      await renderBatchDetailPage(materialName);
    }
  });

  await renderRawMaterialsList();
}

// --- PAGE RENDERER: Batch Detail Page (Raw Materials) ---
async function renderBatchDetailPage(materialName) {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `<p class="loading">Loading batch details...</p>`;

  const response = await fetch(`${API_URL}/api/raw-materials/batches`);
  const rawMaterialBatches = await response.json();

  const batches = rawMaterialBatches[materialName] || [];

  let batchCardsHTML = '';
  if (batches.length > 0) {
    batches.forEach((batch) => {
      batchCardsHTML += `
        <div class="inventory-card">
          <h3>Batch: ${batch.batchId}</h3>
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

  mainContent.innerHTML = `
    <button id="back-to-raw-materials" class="back-btn">← Back to All Materials</button>
    <h2 class="page-title">Batches for ${materialName}</h2>
    <div id="page-content-container">
      ${batchCardsHTML}
    </div>
  `;

  document
    .getElementById('back-to-raw-materials')
    .addEventListener('click', () => {
      renderRawMaterialsPage();
    });
}

// --- PAGE RENDERER: Batch Traceability (UPDATED) ---
async function renderBatchTraceabilityPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <h2 class="page-title">Batch Traceability</h2>
    <div class="sub-nav-bar">
      <button id="tab-wheat-batch" class="nav-tab active">Wheat</button>
      <button id="tab-potato-batch" class="nav-tab">Potato</button>
      <button id="tab-maize-batch" class="nav-tab">Maize</button>
    </div>
    <div id="trace-list-container">
      <p class="loading">Loading batch traceability...</p>
    </div>
  `;

  // NEW: Add click listener to the container
  const container = mainContent.querySelector('#trace-list-container');
  container.addEventListener('click', async (event) => {
    const clickedCard = event.target.closest('.clickable-card');
    if (clickedCard && clickedCard.hasAttribute('data-batch-id')) {
      const batchId = clickedCard.getAttribute('data-batch-id');
      await renderTraceDetailPage(batchId); // Go to new detail page
    }
  });

  const navTabs = mainContent.querySelectorAll('.nav-tab');
  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      navTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      let material = 'wheat';
      if (tab.id === 'tab-potato-batch') material = 'potato';
      if (tab.id === 'tab-maize-batch') material = 'maize';
      renderBatchList(material); // Render the list, not the whole page
    });
  });

  await renderBatchList('wheat');
}

// --- NEW: PAGE RENDERER: Traceability Detail Page ---
async function renderTraceDetailPage(batchId) {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `<p class="loading">Loading batch details for ${batchId}...</p>`;

  const response = await fetch(`${API_URL}/api/traceability/batch/${batchId}`);
  if (!response.ok) {
    mainContent.innerHTML = '<p>Error: Batch not found.</p>';
    return;
  }
  const batch = await response.json();

  const progressPercent = (batch.coveredRoute / batch.totalRoute) * 100;
  const statusClass = batch.status.toLowerCase().replace(' ', '-');

  // Build the HTML for the page
  mainContent.innerHTML = `
    <button id="back-to-trace" class="back-btn">← Back to All Batches</button>
    <h2 class="page-title">Details for Batch: ${batch.batchId}</h2>
    
    <div class="inventory-card">
      <h3>${batch.productName}</h3>
      <div class="card-details">
        <div class="detail-item"><strong>Supplier:</strong> ${
          batch.supplierName
        }</div>
        <div class="detail-item"><strong>Order:</strong> ${batch.orderAmount.toLocaleString()} kg</div>
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

      <hr style="margin: 15px 0; border-top: 1px solid #eee;">

      <h4>Delay Information</h4>
      ${
        batch.delayReason
          ? `
            <div class="detail-item">
              <strong>Delay Reason:</strong> <span class="delay-reason">${
                batch.delayReason
              }</span>
            </div>
            <button id="solve-delay-btn" class="solve-btn">Solve the Delay</button>
            <div id="solution-container" style="display: none;"></div>
          `
          : `
            <div class="detail-item">
              <strong>Status:</strong> On Track (No Delays Reported)
            </div>
          `
      }
    </div>
  `;

  // Add listener for the new "Back" button
  document.getElementById('back-to-trace').addEventListener('click', () => {
    renderBatchTraceabilityPage();
  });

  // Add listener for the "Solve" button (if it exists)
  const solveBtn = document.getElementById('solve-delay-btn');
  if (solveBtn) {
    solveBtn.addEventListener('click', () => {
      const solutionContainer = document.getElementById('solution-container');
      solutionContainer.innerHTML = `
        <div class="solution-box">
          <strong>Suggested Solution:</strong>
          <p>${
            batch.solution || 'No specific solution available. Escalate to manager.'
          }</p>
        </div>
      `;
      solutionContainer.style.display = 'block';
      solveBtn.style.display = 'none'; // Hide button after clicking
    });
  }
}

// --- PAGE RENDERER: Suppliers ---
async function renderSuppliersPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <h2 class="page-title">Suppliers Marketplace</h2>
    <div class="sub-nav-bar">
      <button id="tab-wheat" class="nav-tab active">Wheat</button>
      <button id="tab-potato" class="nav-tab">Potato</button>
      <button id="tab-maize" class="nav-tab">Maize</button>
    </div>
    <div id="supplier-list-container">
      <p class="loading">Loading suppliers...</p>
    </div>
  `;

  const navTabs = mainContent.querySelectorAll('.nav-tab');
  navTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      navTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      let material = 'wheat';
      if (tab.id === 'tab-potato') material = 'potato';
      if (tab.id === 'tab-maize') material = 'maize';
      renderSupplierList(material);
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

  await renderSupplierList('wheat');
}

// --- ALL LIST RENDERERS ---

// --- LIST RENDERER: Batch Traceability List (UPDATED) ---
async function renderBatchList(material) {
  const container = document.getElementById('trace-list-container');
  container.innerHTML = `<p class="loading">Loading ${material} batches...</p>`;

  const response = await fetch(`${API_URL}/api/traceability?material=${material}`);
  const data = await response.json();

  container.innerHTML = '';

  if (data.length === 0) {
    container.innerHTML = '<p>No active batches for this material.</p>';
    return;
  }

  data.forEach((batch) => {
    const progressPercent = (batch.coveredRoute / batch.totalRoute) * 100;
    const statusClass = batch.status.toLowerCase().replace(' ', '-');

    const itemCard = document.createElement('div');
    // NEW: Added clickable-card and data-batch-id
    itemCard.className = 'inventory-card clickable-card';
    itemCard.setAttribute('data-batch-id', batch.batchId);

    itemCard.innerHTML = `
      <h3>${batch.productName} (Batch: ${batch.batchId})</h3>
      <div class="card-details">
        <div class="detail-item"><strong>Supplier:</strong> ${
          batch.supplierName
        }</div>
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
      ${
        batch.delayReason
          ? `<div class="detail-item delay-reason" style="margin-top: 10px;"><strong>Delay:</strong> ${batch.delayReason}</div>`
          : ''
      }
    `;
    container.appendChild(itemCard);
  });
}

// --- LIST RENDERER: Expiry List ---
async function renderExpiryList() {
  const container = document.getElementById('page-content-container');
  container.innerHTML = `<p class="loading">Loading expiry data...</p>`;

  const response = await fetch(`${API_URL}/api/expiry`);
  const expiryData = await response.json();

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
        <div class="detail-item"><strong>Batch ID:</strong> ${
          item.batchId
        }</div>
        <div class="detail-item"><strong>Quantity:</strong> ${item.quantity.toLocaleString()} ${
      item.unit
    }</div>
      </div>
      <div class="card-details">
        <div class="detail-item"><strong>Expires:</strong> ${item.expiryDate}</div>
        <div class="detail-item forecast-days ${daysClass}">
          <strong>${daysText}</strong>
        </div>
      </div>
    `;
    container.appendChild(itemCard);
  });
}

// --- LIST RENDERER: Raw Materials List ---
async function renderRawMaterialsList() {
  const container = document.getElementById('page-content-container');
  container.innerHTML = `<p class="loading">Loading raw materials...</p>`;

  const response = await fetch(`${API_URL}/api/raw-materials`);
  const rawMaterialData = await response.json();

  container.innerHTML = '';

  rawMaterialData.forEach((material) => {
    const percent_left = (material.current_stock / material.max_stock) * 100;
    const days_left = material.current_stock / material.daily_consumption;
    let stockBarClass = percent_left < 25 ? 'low-stock' : '';
    let forecastClass = days_left < 7 ? 'low' : '';

    const itemCard = document.createElement('div');
    itemCard.className = 'inventory-card clickable-card';
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
        <div class="detail-item"><strong>Usage:</strong> ${material.daily_consumption.toLocaleString()} ${
      material.unit
    } / day</div>
        <div class="detail-item forecast-days ${forecastClass}">
          <strong>~${days_left.toFixed(1)} days of production left</strong>
        </div>
      </div>
    `;
    container.appendChild(itemCard);
  });
}

// --- LIST RENDERER: Suppliers List ---
async function renderSupplierList(material) {
  const container = document.getElementById('supplier-list-container');
  container.innerHTML = `<p class="loading">Loading ${material} suppliers...</p>`;

  const response = await fetch(`${API_URL}/api/suppliers?material=${material}`);
  const data = await response.json();

  container.innerHTML = '';

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