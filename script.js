document.addEventListener('DOMContentLoaded', () => {

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

  renderSuppliersPage();
});

const supplierData = [
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

// --- NEW: Function to render the suppliers page ---
function renderSuppliersPage() {
  const container = document.getElementById('page-content-container');
  container.innerHTML = ''; // Clear "Loading..." text

  // Add a title to the page
  const title = document.createElement('h2');
  title.className = 'supplier-list-title';
  title.textContent = 'Wheat Suppliers Marketplace';
  container.appendChild(title);

  // Loop through suppliers and create cards
  supplierData.forEach((supplier) => {
    const percentAvailable = (supplier.quantity / supplier.max_quantity) * 100;

    const itemCard = document.createElement('div');
    itemCard.className = 'supplier-item';

    itemCard.innerHTML = `
      <h3>${supplier.name}</h3>
      <div class="quantity-bar-container">
        <p class="quantity-bar-label">Supply Open for Sale:</p>
        <div class="quantity-bar-bg">
          <div class="quantity-bar-fill" style="width: ${percentAvailable}%;"></div>
        </div>
        <div class="quantity-bar-text">${supplier.quantity.toLocaleString()} / ${supplier.max_quantity.toLocaleString()} kg</div>
      </div>
      <div class="supplier-details">
        <div class="detail-item price">
          Price: ₹${supplier.price.toFixed(2)} / kg
        </div>
        <div class="detail-item">
          <strong>Delivery:</strong> ${supplier.delivery_time} ${
      supplier.delivery_time > 1 ? 'days' : 'day'
    }
        </div>
      </div>
    `;
    container.appendChild(itemCard);
  });
}