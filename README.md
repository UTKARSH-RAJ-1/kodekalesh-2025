# kodekalesh-2025

# SIM 1.0
Working on Problem statement 7 of kodekalesh-2025 final round
Delays

Weather Delay

When fog is expected, our website will fetch the current quantity of crops and notify the user if the quantity of a crop is low. Using the weather API, it will check if fog is expected in the coming days. Based on this, the system will inform the businessman how many days earlier they should place an order so that the order arrives on time.

Our system will be automated. Using weather data and inventory data, it will calculate how long the inventory will last. With the help of the weather API, it will also check how long the delivery might take. Using this information, the system will give recommendations on when and how much to order.
It will also consider the price and recommend the crop with the lowest price first.

When an order is placed, the system will use the weather API to predict how many days delivery may take. If one route takes more time because of weather conditions, we will choose an alternate route or switch the supplier.

Supplier Delay

A contract will be made, and a security deposit will be taken from the supplier. If a supplier delivers late, the security money will be seized.

The supplier must display how much quantity they have.
The supplier must also report any unlisted or unexpected delays.

Demand–Supply Gap

From previous years’ data, the system will provide recommendations to the businessman about which products’ demand is expected to increase in the coming days. Only raw materials for those specific products will be ordered.

In short:
Our inventory, weather, and demand–supply data will tell us how much quantity to order and when to order.

Inventory Data + Demand Data = How much to order

Weather Data = When to order









...... work in Progress



# SIM 2.0 (Upgraded Smart Inventory Management)

A major upgrade focusing on a modular architecture, enhanced durability, premium user experience, and smart analytics.

## Key Upgrades

### 1. Modernized Architecture
-   **Frontend/Backend Separation**: Clean separation of concerns with a dedicated `backend/` (Express.js API) and `frontend/` (Vanilla JS modules).
-   **MVC Pattern**: Backend organized into Models, Views (API responses), and Controllers for scalable logic.
-   **ES Modules**: Frontend uses modern ES6 modules (`import`/`export`) for better code organization and maintainability.

### 2. Premium UI/UX
-   **Glassmorphism Design**: A visually stunning interface featuring semi-transparent cards, blur effects, and vibrant gradients.
-   **Theme Toggle**: Fully functional **Dark/Light Mode** switcher that persists user preference.
-   **Interactive Dashboard**:
    -   **Inventory Health Chart**: Switchable views (Overview 📊, By Material 📝, Timeline 📅).
    -   **Stock Visualization**: Real-time bar charts for raw material levels.
    -   **Toast Notifications**: Non-intrusive, auto-dismissing alerts for user actions (Login, Orders).

### 3. Smart Inventory Features
-   **Weather Integration**: Real-time connection to **Open-Meteo API** to predict fog and weather delays.
-   **Expiry Tracking**: Automated tracking of batch expiry dates with visual alerts (Green/Red indicators).
-   **Batch Traceability**: Full lifecycle tracking of batches (Supplier -> Transit -> Warehouse) with "Solve Delay" suggestions.
-   **Supplier Marketplace**: Interface to view supplier stock, prices, and delivery times, with one-click "Order Inquiry".

### 4. Robust Security & Quality
-   **Authentication**: JWT-based secure login system (`admin` / `admin123`).
-   **Data Integrity**: **SQLite** database with **Sequelize ORM** for reliable data storage and relationships.
-   **Code Quality**: Integrated **ESLint** for code standardization and **Jest** for automated API testing.

## Tech Stack
-   **Backend**: Node.js, Express.js, SQLite, Sequelize, JSON Web Tokens (JWT).
-   **Frontend**: HTML5, CSS3 (Variables & Glassmorphism), Vanilla JavaScript (ES6+), Chart.js.
-   **External**: Open-Meteo Weather API.

## Project Structure
```
kodekalesh-2025/
├── backend/                # API Logic
│   ├── config/             # DB & Data Config
│   ├── controllers/        # Request Handlers
│   ├── middleware/         # Custom Middleware
│   ├── models/             # Sequelize Models
│   ├── routes/             # API Endpoints
│   ├── scripts/            # Utility Scripts
│   ├── services/           # External Integrations (Weather)
│   └── server.js           # Server Entry Point
├── js/                     # Frontend Logic (Modules)
│   ├── api.js              # API Communication
│   ├── main.js             # Main App Logic
│   ├── toast.js            # Notification Logic
│   ├── ui.js               # UI Manipulation
│   └── utils.js            # Helper Functions
├── tests/                  # Automated Tests
│   └── api.test.js
├── index.html              # Main User Interface
├── style.css               # Global Styles
├── database.sqlite         # SQLite Database
├── .eslintrc.json          # Linting Config
├── .gitignore              # Git Ignore Rules
└── package.json            # Dependencies & Scripts
```


