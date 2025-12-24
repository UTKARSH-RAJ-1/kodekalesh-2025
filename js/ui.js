import * as API from './api.js';
import * as Utils from './utils.js';
import { showToast } from './toast.js';

// --- PAGE RENDERER: Dashboard ---
export async function renderDashboardPage() {
  const mainContent = document.getElementById('content-area');
  // Clear previous content but keep structure
  // Actually our new HTML has specific containers for charts, so we just populate them.
  // If we are navigating back to dashboard, we might need to restore the grid structure if it was overwritten.

  mainContent.innerHTML = `
        <div class="dashboard-grid">
            <div class="card glass-card">
                <h3>Raw Material Stock</h3>
                <canvas id="stockChart"></canvas>
            </div>
            <div class="card glass-card">
                <div class="card-header">
                    <h3>Inventory Health</h3>
                    <div class="chart-controls">
                        <button class="chart-btn active" data-mode="overview" title="Overview">📊</button>
                        <button class="chart-btn" data-mode="detailed" title="By Material">📝</button>
                        <button class="chart-btn" data-mode="timeline" title="Timeline">📅</button>
                    </div>
                </div>
                <div style="height: 250px;">
                    <canvas id="healthChart"></canvas>
                </div>
            </div>
        </div>
        
        <div id="alerts-section" class="card glass-card" style="margin-top: 20px;">
            <h3>Live Alerts</h3>
            <ul id="alert-list" class="alert-list">Loading alerts...</ul>
        </div>
    `;

  // 1. Fetch Data
  const [rawMaterials, expiryData, weatherAlerts] = await Promise.all([
    API.fetchRawMaterials(),
    API.fetchExpiryData(),
    API.fetchWeatherAlerts()
  ]);

  // 2. Render Charts
  renderCharts(rawMaterials, expiryData);

  // 3. Render Alerts
  renderAlerts(weatherAlerts);
}

function renderCharts(rawMaterials, expiryData) {
  // Stock Chart
  const ctxStock = document.getElementById('stockChart').getContext('2d');
  new Chart(ctxStock, {
    type: 'bar',
    data: {
      labels: rawMaterials.map(m => m.name),
      datasets: [{
        label: 'Current Stock',
        data: rawMaterials.map(m => m.current_stock),
        backgroundColor: 'rgba(88, 166, 255, 0.6)',
        borderColor: '#58a6ff',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#8b949e' } },
        x: { grid: { display: false }, ticks: { color: '#8b949e' } }
      }
    }
  });

  // Health Chart Wrapper
  let healthChartInstance = null;

  const renderHealthChart = (mode) => {
    const ctxHealth = document.getElementById('healthChart').getContext('2d');

    // Destroy existing chart if any
    if (healthChartInstance) {
      healthChartInstance.destroy();
    }

    let config;

    // --- MODE 1: OVERVIEW (Doughnut) ---
    if (mode === 'overview') {
      const expiredCount = expiryData.filter(i => Utils.daysUntil(i.expiryDate) <= 0).length;
      const freshCount = expiryData.length - expiredCount;

      config = {
        type: 'doughnut',
        data: {
          labels: ['Fresh', 'Expired'],
          datasets: [{
            data: [freshCount, expiredCount],
            backgroundColor: ['#2ea043', '#f85149'],
            borderColor: 'transparent'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#8b949e' } },
            title: { display: true, text: 'Overall Status', color: '#8b949e' }
          }
        }
      };
    }

    // --- MODE 2: DETAILED (Stacked Bar by Material) ---
    else if (mode === 'detailed') {
      const healthData = {};
      expiryData.forEach(item => {
        if (!healthData[item.name]) healthData[item.name] = { fresh: 0, expired: 0 };
        const daysLeft = Utils.daysUntil(item.expiryDate);
        if (daysLeft <= 0) healthData[item.name].expired += 1;
        else healthData[item.name].fresh += 1;
      });

      const labels = Object.keys(healthData);
      config = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            { label: 'Fresh', data: labels.map(n => healthData[n].fresh), backgroundColor: '#2ea043', stack: 'stack0' },
            { label: 'Expired', data: labels.map(n => healthData[n].expired), backgroundColor: '#f85149', stack: 'stack0' }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { stacked: true, ticks: { color: '#8b949e', font: { size: 10 } } },
            y: { stacked: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#8b949e' } }
          },
          plugins: {
            legend: { position: 'bottom', labels: { color: '#8b949e' } },
            title: { display: true, text: 'Health by Material', color: '#8b949e' }
          }
        }
      };
    }

    // --- MODE 3: TIMELINE (Bar by Days Left) ---
    else if (mode === 'timeline') {
      // Group by range: Expired, 0-7 days, 8-30 days, 30+ days
      const ranges = { 'Expired': 0, '< 7 Days': 0, '7-30 Days': 0, '30+ Days': 0 };

      expiryData.forEach(item => {
        const days = Utils.daysUntil(item.expiryDate);
        if (days <= 0) ranges['Expired']++;
        else if (days < 7) ranges['< 7 Days']++;
        else if (days <= 30) ranges['7-30 Days']++;
        else ranges['30+ Days']++;
      });

      config = {
        type: 'bar',
        data: {
          labels: Object.keys(ranges),
          datasets: [{
            label: 'Batches',
            data: Object.values(ranges),
            backgroundColor: ['#f85149', '#d29922', '#db6d28', '#2ea043'],
            borderColor: 'transparent'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#8b949e', stepSize: 1 } },
            x: { ticks: { color: '#8b949e' } }
          },
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Expiry Timeline', color: '#8b949e' }
          }
        }
      };
    }

    healthChartInstance = new Chart(ctxHealth, config);
  };

  // Initial Render (Overview)
  renderHealthChart('overview');

  // Event Listeners for Buttons
  const btns = document.querySelectorAll('.chart-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update Active State
      btns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');

      // Update Chart
      const mode = e.target.getAttribute('data-mode');
      renderHealthChart(mode);
    });
  });
}

function renderAlerts(alerts) {
  const list = document.getElementById('alert-list');
  list.innerHTML = '';

  if (alerts.length === 0) {
    list.innerHTML = '<li>No active alerts. Operations normal.</li>';
    return;
  }

  alerts.forEach(alert => {
    const li = document.createElement('li');
    li.innerHTML = `
            <span style="color: #d29922;">⚠️ ${alert.alertType}</span>
            <span>${alert.message}</span>
        `;
    list.appendChild(li);
  });
}


// --- PAGE RENDERER: Raw Materials ---
export async function renderRawMaterialsPage() {
  const mainContent = document.getElementById('content-area');
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

async function renderRawMaterialsList() {
  const container = document.getElementById('page-content-container');
  const rawMaterialData = await API.fetchRawMaterials();

  container.innerHTML = '';

  rawMaterialData.forEach((material) => {
    const percent_left = (material.current_stock / material.max_stock) * 100;
    const days_left = material.current_stock / material.daily_consumption;
    let stockBarClass = percent_left < 25 ? 'low-stock' : '';
    let forecastClass = days_left < 7 ? 'low' : '';

    const itemCard = document.createElement('div');
    itemCard.className = 'inventory-card clickable-card glass-card';
    itemCard.setAttribute('data-material-name', material.name);

    itemCard.innerHTML = `
      <h3>${material.name}</h3>
      <div class="quantity-bar-container">
        <p class="bar-label">Stock Level:</p>
        <div class="quantity-bar-bg">
          <div class="quantity-bar-fill ${stockBarClass}" style="width: ${percent_left}%;"></div>
        </div>
        <div class="quantity-bar-text">${material.current_stock.toLocaleString()} / ${material.max_stock.toLocaleString()} ${material.unit}</div>
      </div>
      <div class="card-details">
        <div class="detail-item"><strong>Usage:</strong> ${material.daily_consumption.toLocaleString()} ${material.unit} / day</div>
        <div class="detail-item forecast-days ${forecastClass}">
          <strong>~${days_left.toFixed(1)} days of production left</strong>
        </div>
      </div>
    `;
    container.appendChild(itemCard);
  });
}

// --- PAGE RENDERER: Batch Detail Page (Raw Materials) ---
async function renderBatchDetailPage(materialName) {
  const mainContent = document.getElementById('content-area');
  mainContent.innerHTML = `<p class="loading">Loading batch details...</p>`;

  const rawMaterialBatches = await API.fetchRawMaterialBatches();
  const batches = rawMaterialBatches[materialName] || [];

  let batchCardsHTML = '';
  if (batches.length > 0) {
    batches.forEach((batch) => {
      batchCardsHTML += `
        <div class="inventory-card glass-card">
          <h3>Batch: ${batch.batchId}</h3>
          <div class="card-details">
            <div class="detail-item"><strong>Delivered:</strong> ${batch.delivered}</div>
            <div class="detail-item"><strong>Expires:</strong> ${batch.expiry}</div>
            <div class="detail-item"><strong>Quantity:</strong> ${batch.quantity.toLocaleString()} kg</div>
          </div>
          <div class="quantity-bar-container">
            <p class="bar-label">Quality Score:</p>
            <div class="quantity-bar-bg">
              <div class="quantity-bar-fill quality-fill" style="width: ${batch.qualityScore}%;"></div>
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

  document.getElementById('back-to-raw-materials').addEventListener('click', renderRawMaterialsPage);
}

// --- PAGE RENDERER: Batch Traceability ---
export async function renderBatchTraceabilityPage() {
  const mainContent = document.getElementById('content-area');
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

  const container = mainContent.querySelector('#trace-list-container');
  container.addEventListener('click', async (event) => {
    const clickedCard = event.target.closest('.clickable-card');
    if (clickedCard && clickedCard.hasAttribute('data-batch-id')) {
      const batchId = clickedCard.getAttribute('data-batch-id');
      await renderTraceDetailPage(batchId);
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
      renderBatchList(material);
    });
  });

  await renderBatchList('wheat');
}

async function renderBatchList(material) {
  const container = document.getElementById('trace-list-container');
  container.innerHTML = `<p class="loading">Loading ${material} batches...</p>`;

  const data = await API.fetchTraceability(material);
  container.innerHTML = '';

  if (data.length === 0) {
    container.innerHTML = '<p>No active batches for this material.</p>';
    return;
  }

  data.forEach((batch) => {
    const progressPercent = (batch.coveredRoute / batch.totalRoute) * 100;
    const statusClass = batch.status.toLowerCase().replace(' ', '-');

    const itemCard = document.createElement('div');
    itemCard.className = 'inventory-card clickable-card glass-card';
    itemCard.setAttribute('data-batch-id', batch.batchId);

    itemCard.innerHTML = `
      <h3>${batch.productName} (Batch: ${batch.batchId})</h3>
      <div class="card-details">
        <div class="detail-item"><strong>Supplier:</strong> ${batch.supplierName}</div>
        <div class="detail-item">
          <span class="status-tag status-${statusClass}">${batch.status}</span>
        </div>
      </div>
      <div class="quantity-bar-container">
        <p class="bar-label">Route Progress:</p>
        <div class="quantity-bar-bg">
          <div class="quantity-bar-fill route-fill" style="width: ${progressPercent}%;"></div>
        </div>
        <div class="quantity-bar-text">${batch.coveredRoute} km / ${batch.totalRoute} km</div>
      </div>
      ${batch.delayReason ? `<div class="detail-item delay-reason" style="margin-top: 10px;"><strong>Delay:</strong> ${batch.delayReason}</div>` : ''}
    `;
    container.appendChild(itemCard);
  });
}

async function renderTraceDetailPage(batchId) {
  const mainContent = document.getElementById('content-area');
  mainContent.innerHTML = `<p class="loading">Loading batch details for ${batchId}...</p>`;

  try {
    const batch = await API.fetchBatchDetails(batchId);
    const progressPercent = (batch.coveredRoute / batch.totalRoute) * 100;
    const statusClass = batch.status.toLowerCase().replace(' ', '-');

    mainContent.innerHTML = `
      <button id="back-to-trace" class="back-btn">← Back to All Batches</button>
      <h2 class="page-title">Details for Batch: ${batch.batchId}</h2>
      
      <div class="inventory-card glass-card">
        <h3>${batch.productName}</h3>
        <div class="card-details">
          <div class="detail-item"><strong>Supplier:</strong> ${batch.supplierName}</div>
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
          <div class="quantity-bar-text">${batch.coveredRoute} km / ${batch.totalRoute} km</div>
        </div>

        <hr style="margin: 15px 0; border-top: 1px solid #eee;">

        <h4>Delay Information</h4>
        ${batch.delayReason
        ? `
              <div class="detail-item">
                <strong>Delay Reason:</strong> <span class="delay-reason">${batch.delayReason}</span>
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

    document.getElementById('back-to-trace').addEventListener('click', renderBatchTraceabilityPage);

    const solveBtn = document.getElementById('solve-delay-btn');
    if (solveBtn) {
      solveBtn.addEventListener('click', () => {
        const solutionContainer = document.getElementById('solution-container');
        solutionContainer.innerHTML = `
          <div class="solution-box glass-card">
            <strong>Suggested Solution:</strong>
            <p>${batch.solution || 'No specific solution available. Escalate to manager.'}</p>
          </div>
        `;
        solutionContainer.style.display = 'block';
        solveBtn.style.display = 'none';
      });
    }
  } catch (err) {
    mainContent.innerHTML = '<p>Error: Batch not found.</p>';
  }
}

// --- PAGE RENDERER: Suppliers ---
export async function renderSuppliersPage() {
  const mainContent = document.getElementById('content-area');
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
      const supplierName = event.target.closest('.supplier-item').querySelector('h3').textContent;
      showToast(`Order inquiry for ${supplierName} sent!`, 'success');
    }
  });

  await renderSupplierList('wheat');
}

async function renderSupplierList(material) {
  const container = document.getElementById('supplier-list-container');
  container.innerHTML = `<p class="loading">Loading ${material} suppliers...</p>`;

  const data = await API.fetchSuppliers(material);
  container.innerHTML = '';

  data.forEach((supplier) => {
    const maxQty = supplier.max_quantity || supplier.max_qantity; // handle typo in potential data
    const percentAvailable = (supplier.quantity / maxQty) * 100;

    const itemCard = document.createElement('div');
    itemCard.className = 'supplier-item glass-card';

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
            <strong>Delivery:</strong> ${supplier.delivery_time} ${supplier.delivery_time > 1 ? 'days' : 'day'}
          </div>
        </div>
        <button class="order-inquiry-btn">Order Inquiry</button>
      </div>
    `;
    container.appendChild(itemCard);
  });
}
