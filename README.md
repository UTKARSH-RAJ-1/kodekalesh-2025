# kodekalesh-2025
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




inventory-management-system/
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── auth.js
│   │   ├── api.js
│   │   └── charts.js
│   └── assets/
├── backend/
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Inventory.js
│   │   ├── Batch.js
│   │   ├── Supplier.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── inventory.js
│   │   ├── batches.js
│   │   ├── suppliers.js
│   │   └── weather.js
│   ├── middleware/
│   │   └── auth.js
│   └── services/
│       └── weatherService.js
├── package.json
└── .env




...... work in Progress
