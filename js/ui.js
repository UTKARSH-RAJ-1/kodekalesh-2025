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

// --- PAGE RENDERER: Finished Goods ---
// --- PAGE RENDERER: Finished Goods ---
export async function renderFinishedGoodsPage() {
  const mainContent = document.getElementById('content-area');
  mainContent.innerHTML = `
    <div class="header-actions">
          <h2 class="page-title">Finished Goods Inventory</h2>
          <input type="text" id="fg-search" class="glass-input" style="width: 300px; margin: 0;" placeholder="Search products...">
      </div>
      <div id="finished-goods-container" class="dashboard-grid">
        <p class="loading">Loading finished goods...</p>
      </div>
  `;

  const container = mainContent.querySelector('#finished-goods-container');
  const searchInput = mainContent.querySelector('#fg-search');

  // Fetch Data
  const allData = await API.fetchFinishedGoods();

  // Render Function
  const render = (items) => {
    container.innerHTML = '';
    if (!items || items.length === 0) {
      container.innerHTML = '<p>No finished goods found matching your search.</p>';
      return;
    }

    items.forEach((item) => {
      const percentStock = (item.current_stock / item.max_stock) * 100;

      // Styles
      let demandClass = 'demand-medium';
      if (item.market_demand.includes('High') || item.market_demand.includes('Very High')) demandClass = 'demand-high';
      if (item.market_demand.includes('Low')) demandClass = 'demand-low';

      let stockClass = '';
      if (percentStock < 20) stockClass = 'low-stock';
      if (percentStock > 90) stockClass = 'over-stock';

      const itemCard = document.createElement('div');
      itemCard.className = 'inventory-card glass-card';
      itemCard.setAttribute('data-id', item.id);

      itemCard.innerHTML = `
    <div class="card-header-flex">
                    <h3 style="margin:0">${item.name}</h3>
                    <span class="sku-tag" style="font-size: 0.8em; opacity: 0.7;">${item.sku}</span>
                </div>
                
                <div class="metric-row" style="margin: 15px 0;">
                    <div class="metric-item">
                        <span class="metric-label">Market Demand</span>
                        <span class="metric-value ${demandClass}">${item.market_demand}</span>
                    </div>
                    <div class="metric-item ai-prediction">
                        <span class="metric-label">🤖 AI Prediction</span>
                        <span class="metric-value highlight-ai">${item.predicted_production_need.toLocaleString()} units</span>
                    </div>
                </div>

                <div class="quantity-bar-container">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span class="bar-label">Current Stock</span>
                        <span class="bar-label" style="color: ${stockClass === 'low-stock' ? '#f85149' : 'inherit'}">${item.status}</span>
                    </div>
                    <div class="quantity-bar-bg">
                        <div class="quantity-bar-fill ${stockClass}" style="width: ${percentStock}%;"></div>
                    </div>
                    <div class="quantity-bar-text" style="text-align:right; margin-top:4px;">
                        ${item.current_stock.toLocaleString()} / ${item.max_stock.toLocaleString()}
                    </div>
                </div>

                <div class="card-footer-flex" style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 10px;">
                    <span class="price-tag" style="font-weight: bold; color: var(--success-color);">₹${item.unit_price.toFixed(2)}</span>
                    <button class="production-action-btn production-btn" data-name="${item.name}">Plan Production</button>
                </div>
  `;
      container.appendChild(itemCard);
    });
  };

  // Initial Render
  render(allData);

  // Search Interaction
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allData.filter(item =>
      item.name.toLowerCase().includes(term) ||
      item.sku.toLowerCase().includes(term)
    );
    render(filtered);
  });

  // Button Interaction (Delegation)
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('production-btn')) {
      const productName = e.target.getAttribute('data-name');
      showToast(`Production plan initiated for ${productName}`, 'success');
    }
  });
}

// --- PAGE RENDERER: Quality Assurance ---
export async function renderQAPage() {
  const mainContent = document.getElementById('content-area');
  mainContent.innerHTML = `
    <h2 class="page-title">Quality Assurance Dashboard</h2>
      
      <!--Section 1: Incoming Quality Overview-->
      <div class="card glass-card" style="margin-bottom: 25px;">
        <h3>Incoming Material Quality Scores (Last 30 Days)</h3>
        <div style="height: 300px;">
            <canvas id="qaChart"></canvas>
        </div>
      </div>

      <!--Section 2: Quality Incidents Log-->
    <div class="dashboard-grid" style="margin-bottom: 25px; grid-template-columns: 2fr 1fr;">
      <div class="card glass-card">
        <div class="card-header-flex">
          <h3>Quality Incidents Log</h3>
          <input type="text" id="incident-search" class="glass-input" style="width: 200px; margin:0;" placeholder="Search incidents...">
        </div>
        <div class="table-container" style="max-height: 300px; overflow-y: auto;">
          <table id="incidents-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Issue</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="incidents-body">
              <tr><td colspan="4" class="loading">Loading incidents...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 3: Compliance Status -->
      <div class="card glass-card">
        <h3>Supplier Compliance Tracker</h3>
        <div id="compliance-container" style="display: flex; flex-direction: column; gap: 15px; margin-top: 15px;">
          <p class="loading">Loading compliance data...</p>
        </div>
      </div>
    </div>
  `;

  // 1. Render Chart (Incoming Quality)
  const renderQualityChart = async () => {
    const rawMaterialBatches = await API.fetchRawMaterialBatches();
    const labels = Object.keys(rawMaterialBatches);
    const avgScores = labels.map(material => {
      const batches = rawMaterialBatches[material];
      if (!batches || batches.length === 0) return 0;
      const sum = batches.reduce((acc, b) => acc + b.qualityScore, 0);
      return (sum / batches.length).toFixed(1);
    });

    const ctxQA = document.getElementById('qaChart').getContext('2d');
    new Chart(ctxQA, {
      type: 'bar',
      data: {
        labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
        datasets: [{
          label: 'Avg Quality Score',
          data: avgScores,
          backgroundColor: avgScores.map(s => s >= 90 ? '#2ea043' : (s >= 80 ? '#d29922' : '#f85149')),
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#8b949e' } },
          x: { grid: { display: false }, ticks: { color: '#8b949e' } }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  };

  // 2. Render Incidents Table
  const renderIncidents = async () => {
    const incidents = await API.fetchQualityIncidents();
    const tbody = document.getElementById('incidents-body');
    const searchInput = document.getElementById('incident-search');

    const populateTable = (items) => {
      tbody.innerHTML = '';
      if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4">No incidents found.</td></tr>';
        return;
      }
      items.forEach(inc => {
        let badgeClass = 'status-default';
        if (inc.severity === 'High') badgeClass = 'status-delayed'; // Red
        if (inc.severity === 'Medium') badgeClass = 'status-transit'; // Orange
        if (inc.severity === 'Low') badgeClass = 'status-delivered'; // Green

        const row = document.createElement('tr');
        row.innerHTML = `
    <td>${inc.date}</td>
                    <td>
                        <div style="font-weight:bold;">${inc.type}</div>
                        <div style="font-size:0.85em; opacity:0.7;">${inc.details}</div>
                    </td>
                    <td><span class="status-tag ${badgeClass}">${inc.severity}</span></td>
                    <td>${inc.status}</td>
  `;
        tbody.appendChild(row);
      });
    };

    populateTable(incidents);

    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = incidents.filter(i =>
        i.type.toLowerCase().includes(term) ||
        i.details.toLowerCase().includes(term)
      );
      populateTable(filtered);
    });
  };

  // 3. Render Compliance Tracker
  const renderCompliance = async () => {
    const certs = await API.fetchComplianceData();
    const container = document.getElementById('compliance-container');
    container.innerHTML = '';

    certs.forEach(cert => {
      let statusColor = '#2ea043'; // Valid
      if (cert.status === 'Expiring Soon') statusColor = '#d29922';
      if (cert.status === 'Expired') statusColor = '#f85149';

      const card = document.createElement('div');
      card.style.padding = '12px';
      card.style.background = 'rgba(255,255,255,0.05)';
      card.style.borderRadius = '8px';
      card.style.borderLeft = `4px solid ${statusColor} `;

      card.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <span style="font-weight:600; font-size:0.95em;">${cert.name}</span>
                    <span style="font-size:0.8em; color:${statusColor}; border:1px solid ${statusColor}; padding:2px 6px; border-radius:4px;">${cert.status}</span>
                </div>
                <div style="font-size:0.85em; color:#8b949e; margin-bottom:2px;">Supplier: ${cert.supplier}</div>
                <div style="font-size:0.8em;">Expires: ${cert.expiry}</div>
  `;
      container.appendChild(card);
    });
  };

  // Execute all renderers
  await Promise.all([renderQualityChart(), renderIncidents(), renderCompliance()]);
}

// --- PAGE RENDERER: About ---
export function renderAboutPage() {
  const mainContent = document.getElementById('content-area');

  mainContent.innerHTML = `
    <div style="max-width: 900px; margin: 0 auto; animation: fadeIn 0.5s ease;">
        <!--Hero Section-->
        <div class="card glass-card" style="text-align: center; padding: 40px; margin-bottom: 30px; background: linear-gradient(135deg, rgba(88, 166, 255, 0.1), rgba(22, 27, 34, 0.6)); border: 1px solid var(--primary-color);">
            <div style="font-size: 3rem; margin-bottom: 10px;">🌐</div>
            <h1 style="color: var(--primary-color); margin-bottom: 15px;">Smart Inventory Management 2.0</h1>
            <p style="font-size: 1.2rem; color: var(--text-color); opacity: 0.9;">Solving the volatility of modern supply chains through data transparency and AI.</p>
        </div>

        <!--Problem Statement-->
        <div class="card glass-card" style="margin-bottom: 30px; border-left: 4px solid var(--danger-color);">
            <h3 style="color: var(--danger-color); margin-bottom: 15px;">The Challenge</h3>
            <p style="line-height: 1.8; font-size: 1.05rem; opacity: 0.85;">
                Large-scale supply chains operate as sprawling networks with volatile dependencies, where minor disruptions—logistical delays, demand fluctuations, or supplier inconsistencies—can propagate unpredictably. 
                Industries often lack the ability to anticipate these perturbations due to <strong>opaque data flows</strong> and <strong>poor synchrony</strong> between nodes. 
                This results in inventory mismatches, operational downtime, and significant financial inefficiencies.
            </p>
        </div>

        <h2 style="margin: 40px 0 20px; text-align: center;">How SIM 2.0 Solves It</h2>

        <div class="dashboard-grid" style="grid-template-columns: repeat(2, 1fr); gap: 20px;">
            
            <!-- Solution 1: Visibility -->
            <div class="card glass-card">
                <div style="display: flex; gap: 15px; align-items: start;">
                    <span style="font-size: 2rem; background: rgba(88, 166, 255, 0.1); padding: 10px; border-radius: 12px;">👁️</span>
                    <div>
                        <h3 style="margin-bottom: 10px;">Eliminating Opacity</h3>
                        <p style="font-size: 0.95rem; opacity: 0.7;">
                            <strong>Feature: Batch Traceability & Live Dashboard</strong><br>
                            We replace opaque data flows with granular, real-time tracking of every node. From raw material arrival to finished goods, users have 100% visibility into stock levels and locations.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Solution 2: Synchrony -->
            <div class="card glass-card">
                <div style="display: flex; gap: 15px; align-items: start;">
                    <span style="font-size: 2rem; background: rgba(46, 160, 67, 0.1); padding: 10px; border-radius: 12px;">🤖</span>
                    <div>
                        <h3 style="margin-bottom: 10px;">Predictive Synchrony</h3>
                        <p style="font-size: 0.95rem; opacity: 0.7;">
                            <strong>Feature: AI Demand Prediction</strong><br>
                            Instead of reacting to mismatches, our AI analyzes market trends to forecast manufacturing needs (e.g., "Predicted Need: 2400 units"), aligning production perfectly with demand.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Solution 3: Resilience -->
            <div class="card glass-card">
                <div style="display: flex; gap: 15px; align-items: start;">
                    <span style="font-size: 2rem; background: rgba(210, 153, 34, 0.1); padding: 10px; border-radius: 12px;">🛡️</span>
                    <div>
                        <h3 style="margin-bottom: 10px;">Anticipating Disruptions</h3>
                        <p style="font-size: 0.95rem; opacity: 0.7;">
                            <strong>Feature: Weather Alerts & QA Logs</strong><br>
                            We mitigate operational downtime by providing early warnings for external threats (Weather) and internal quality failures (Incidents Log), allowing for proactive resolution.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Solution 4: Efficiency -->
            <div class="card glass-card">
                <div style="display: flex; gap: 15px; align-items: start;">
                    <span style="font-size: 2rem; background: rgba(248, 81, 73, 0.1); padding: 10px; border-radius: 12px;">📉</span>
                    <div>
                        <h3 style="margin-bottom: 10px;">Financial Optimization</h3>
                        <p style="font-size: 0.95rem; opacity: 0.7;">
                            <strong>Feature: Expiry & Compliance Tracking</strong><br>
                            By tracking expiry dates and supplier compliance certificates, we drastically reduce waste and prevent costly regulatory fines, solving financial inefficiencies.
                        </p>
                    </div>
                </div>
            </div>

        </div>

        <div style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="font-size: 1.1rem; font-weight: 600; color: var(--primary-color); margin-bottom: 5px;">Developed by Team Autominds 🚀</p>
            <p style="font-size: 0.95rem; opacity: 0.9;">
                📧 <a href="mailto:autominds1024@gmail.com" style="color: var(--text-color); text-decoration: none; border-bottom: 1px dashed var(--text-color);">autominds1024@gmail.com</a>
            </p>
            <p style="font-size: 0.8rem; opacity: 0.5; margin-top: 20px;">KodeKalesh 2025 Hackathon Project • Version 2.0</p>
        </div>
      </div >
    `;
}
