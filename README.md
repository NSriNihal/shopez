# Shopez

Shopez is a full-stack local commerce and delivery platform built with React, Vite, Express, MongoDB, and JWT authentication. It supports customers, sellers, delivery partners, and admins with role-based dashboards for browsing stores, managing products, placing orders, assigning deliveries, tracking live locations, and managing delivery earnings.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [User Roles](#user-roles)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Overview

Shopez connects nearby stores with customers and delivery partners. Sellers can create stores, add products, manage orders, and dispatch deliveries. Customers can browse stores, place orders, save addresses, view order history, and track deliveries. Delivery partners can update availability, receive assigned orders, share live location, update delivery status, and view earnings.

## Features

### Authentication and Authorization

- User registration and login
- JWT-based authentication
- HTTP-only cookie support
- Role-based access for users, sellers, delivery partners, owners, and admins
- Protected backend routes

### Customer Features

- Browse all stores
- Search stores
- Filter stores by category
- View store details and products
- Place orders
- Manage saved delivery addresses
- View personal order history
- Track order status and delivery location

### Seller Features

- Seller profile endpoint
- Create and update store details
- Manage store products
- Add, edit, and delete products
- View seller orders
- Accept or cancel orders
- Dispatch orders to delivery partners
- Seller dashboard endpoint

### Delivery Partner Features

- Delivery partner profile
- Toggle availability
- Update live location
- View assigned orders
- Update delivery status
- View earnings

### Admin Features

- Admin-only access for protected resources
- View all orders
- View all stores
- Delete stores
- View and manage delivery earnings
- Mark delivery earnings as paid

### Uploads

- Image upload endpoint
- Local file upload fallback
- Optional Cloudinary support for production image hosting

## Tech Stack

### Frontend

- React 19
- Vite
- React Router DOM
- Tailwind CSS
- ESLint

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- cookie-parser
- CORS
- Multer
- Cloudinary
- Socket.IO dependency included

## Project Structure

```text
shopez/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── REST_API_TESTING/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── deliveryBoy/
│   │   │   ├── seller/
│   │   │   └── user/
│   │   ├── routes/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB Atlas account or local MongoDB database

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/shopez.git
cd shopez
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment

Create a `.env` file inside the `backend` folder.

```env
PORT=5000
DB_URL=your_mongodb_connection_string
SECRETKEY=your_jwt_secret_key
NODE_ENV=development

# Optional: enable Cloudinary uploads
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_FOLDER=shopez
```

### 4. Start the Backend Server

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

### 5. Install Frontend Dependencies

Open a new terminal.

```bash
cd frontend
npm install
```

### 6. Configure Frontend Environment

Create a `.env` file inside the `frontend` folder.

```env
VITE_API_URL=http://localhost:5000
```

The frontend API helper automatically appends `/api` when needed.

### 7. Start the Frontend

```bash
npm run dev
```

The frontend will usually run on:

```text
http://localhost:5173
```

## Environment Variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Backend server port. Defaults to `5000`. |
| `DB_URL` | Yes | MongoDB connection string. |
| `SECRETKEY` | Yes | Secret key used to sign JWT tokens. |
| `NODE_ENV` | No | Use `production` in deployed environments for secure cookies. |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name for hosted image uploads. |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key. |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret. |
| `CLOUDINARY_FOLDER` | No | Cloudinary folder name. Defaults to `shopez`. |

### Frontend

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Backend base URL, for example `http://localhost:5000`. |

## Available Scripts

### Backend

Run these commands inside the `backend` directory.

```bash
npm run dev
```

Starts the backend with Nodemon.

```bash
npm start
```

Starts the backend with Node.js.

### Frontend

Run these commands inside the `frontend` directory.

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Builds the frontend for production.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run lint
```

Runs ESLint.

## API Overview

The backend mounts all main routes under `/api`.

### Auth Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Register a new user. |
| `POST` | `/api/auth/signin` | Login a user. |
| `POST` | `/api/auth/signout` | Logout the current user. |
| `GET` | `/api/auth/check` | Check authenticated user session. |

### User Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/user/current` | Get current user profile. |
| `POST` | `/api/user/address` | Add a delivery address. |
| `DELETE` | `/api/user/address/:addressId` | Delete a saved address. |

### Store Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/stores` | Get all stores. |
| `GET` | `/api/stores/admin/all` | Get all stores for admin. |
| `GET` | `/api/stores/search` | Search stores. |
| `GET` | `/api/stores/category/:category` | Get stores by category. |
| `GET` | `/api/stores/:storeId/products` | Get products for a store. |
| `GET` | `/api/stores/:storeId` | Get store details. |
| `DELETE` | `/api/stores/:storeId` | Delete a store as admin. |

### Seller Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/seller/profile` | Get seller profile. |
| `POST` | `/api/seller/store` | Create seller store. |
| `GET` | `/api/seller/store` | Get seller store. |
| `PUT` | `/api/seller/store` | Update seller store. |
| `POST` | `/api/seller/products` | Add a product. |
| `GET` | `/api/seller/products` | Get seller products. |
| `PUT` | `/api/seller/products/:productId` | Update a product. |
| `DELETE` | `/api/seller/products/:productId` | Delete a product. |
| `GET` | `/api/seller/orders` | Get seller orders. |
| `GET` | `/api/seller/dashboard` | Get seller dashboard data. |

### Order Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/orders` | Create a new order. |
| `GET` | `/api/orders/my` | Get current user's orders. |
| `GET` | `/api/orders/seller` | Get seller orders. |
| `GET` | `/api/orders/status/:status` | Get orders by status. |
| `GET` | `/api/orders` | Get all orders as admin. |
| `GET` | `/api/orders/:orderId` | Get a single order. |
| `PUT` | `/api/orders/:orderId/accept` | Accept an order. |
| `PUT` | `/api/orders/:orderId/cancel` | Cancel an order. |

### Dispatch Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/dispatch` | Get all dispatches. |
| `GET` | `/api/dispatch/available-delivery-boys` | Get available delivery partners. |
| `GET` | `/api/dispatch/order/:orderId` | Get dispatch by order. |
| `GET` | `/api/dispatch/:id` | Get dispatch details. |
| `POST` | `/api/dispatch/assign/:orderId` | Assign a delivery partner to an order. |
| `PUT` | `/api/dispatch/:id/status` | Update dispatch status. |

### Delivery Partner Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/delivery-boy/profile` | Get delivery partner profile. |
| `PUT` | `/api/delivery-boy/availability` | Update availability. |
| `PUT` | `/api/delivery-boy/location` | Update live location. |
| `GET` | `/api/delivery-boy/orders` | Get assigned orders. |
| `PUT` | `/api/delivery-boy/orders/:orderId/status` | Update delivery status. |
| `GET` | `/api/delivery-boy/earnings` | Get delivery earnings. |

### Tracking Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `PUT` | `/api/tracking/location` | Update user or delivery location. |
| `GET` | `/api/tracking/available-delivery-boys` | Get available delivery partner locations. |
| `GET` | `/api/tracking/order/:orderId` | Track an order. |
| `GET` | `/api/tracking/order/:orderId/history` | Get order location history. |

### Earnings Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/earnings/my` | Get current delivery partner earnings. |
| `GET` | `/api/earnings/today` | Get today's earnings. |
| `GET` | `/api/earnings` | Get all earnings as admin. |
| `GET` | `/api/earnings/delivery-boy/:deliveryBoyId` | Get earnings for a delivery partner. |
| `PUT` | `/api/earnings/:earningId/paid` | Mark earning as paid. |

### Upload Routes

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/uploads` | Upload an image using the `image` form field. |

## User Roles

Shopez supports the following roles:

| Role | Description |
| --- | --- |
| `user` | Customer who browses stores and places orders. |
| `seller` | Store owner who manages store, products, and orders. |
| `owner` | Store management role with dispatch access. |
| `deliveryBoy` | Delivery partner who handles assigned deliveries. |
| `admin` | Admin user with elevated management access. |

## Deployment

### Backend Deployment

The backend can be deployed to platforms such as Render, Railway, Fly.io, or any Node.js hosting provider.

Important backend deployment steps:

- Add all required environment variables.
- Set `NODE_ENV=production`.
- Set `DB_URL` to a production MongoDB connection string.
- Set `SECRETKEY` to a strong secret.
- Configure Cloudinary variables if you want persistent image uploads.
- Make sure your frontend domain is allowed in the backend CORS configuration.

### Frontend Deployment

The frontend can be deployed to Vercel, Netlify, or any static hosting provider.

Important frontend deployment steps:

- Set `VITE_API_URL` to your deployed backend URL.
- Build the app using `npm run build`.
- Deploy the generated `dist` folder.

## REST API Testing

The backend includes sample HTTP request files inside:

```text
backend/REST_API_TESTING/
```

You can use these files with REST Client extensions in editors like VS Code to test backend endpoints during development.

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new feature branch.
3. Make your changes.
4. Run linting and verify the app locally.
5. Commit your changes.
6. Open a pull request.

## License

This project is licensed under the ISC License.

## Author

Built with care for local commerce, sellers, customers, and delivery partners.
