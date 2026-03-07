# SLV Online Stores – E-Commerce Shopping Website

SLV Online Stores is a full-stack e-commerce web application where users can browse products, add items to a cart, place orders, and make payments online. It provides a seamless shopping experience with a robust backend to handle user data, products, and secure transactions.

## 🚀 Live Deployment

**Live Link:** [https://slv-online-stores.vercel.app/](https://slv-online-stores.vercel.app/)

## 🔐 Admin Credentials

- **Username:** [admin@example.com](mailto:admin@example.com)
- **Password:** `123456`

## ✨ Features

- **Product browsing:** Easily navigate through various product categories.
- **Product details page:** View comprehensive details, images, and pricing for each product.
- **Shopping cart:** Add, remove, and update quantities of desired items.
- **Checkout and order confirmation:** Securely finalize purchases and receive order summaries.
- **User authentication:** Register, log in, and securely manage user sessions.
- **Wishlist:** Save favorite products for future purchases.
- **Notifications:** Receive updates on order status and important alerts.
- **Real-time chat:** Seamless communication between customer and admin.
- **Admin dashboard:** Comprehensive control panel for the store owner.
- **Product management:** Admins can add, edit, or delete inventory.
- **Order management:** Track and update customer orders efficiently.

## 💻 Frontend Technologies

- **React**
- **Vite**
- **Redux Toolkit**
- **React Router DOM**
- **Tailwind CSS**
- **Framer Motion**
- **Sonner**
- **Axios**
- **Socket.io-client**
- **PayPal integration**
- **Google Authentication**

## ⚙️ Backend Technologies

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **REST APIs**
- **Nodemon**
- **Cloudinary**

## 🛡️ Authentication & Security

- **JSON Web Tokens (JWT)**
- **Bcrypt.js**
- **Google Auth**
- **CORS**
- **Dotenv**

## 🗄️ Database Collections

- `Users`
- `Products`
- `Categories`
- `Cart`
- `Orders`
- `Order_Items`

## 🔄 Database Workflow

1. **User Registration:** User registers → stored in the `Users` collection.
2. **Product Fetching:** Products are fetched from the `Products` collection to display on the frontend.
3. **Cart Operations:** Items added to cart are managed in the `Cart` collection.
4. **Checkout Process:** Upon checkout, a new order is created in the `Orders` collection.
5. **Order Items:** Individual ordered items related to the order are stored in the `Order_Items` collection.

## 🛠️ Project Setup Instructions

Follow these step-by-step instructions to get the project running locally:

### 1. Clone Repository
```bash
# Clone the repository to your local machine (replace URL with actual project repo link)
git clone <your-repository-url>
cd slv-online-stores
```

### 2. Install Dependencies
Navigate to both the frontend and backend directories to install their respective dependencies.
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Setup MongoDB Database
Ensure you have MongoDB installed and running on your local machine, or obtain a MongoDB Atlas URI.

### 4. Environment Variables
Create a `.env` file in the `backend` directory. Keep the `backend/.env` file with the following variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/slv_online_store
JWT_SECRET=secretkey
```
*(Note: Add other necessary keys like Cloudinary or Google API secrets based on your setup).*

### 5. Run the Servers

**Run backend server:**
```bash
cd backend
npm run dev
# OR: nodemon server.js
```

**Run frontend development server:**
```bash
cd frontend
npm run dev
```

## 📖 How to Use the System

1. **Register a user:** Start by creating a new account to access personalized features.
2. **Login:** Access your account using your standard credentials or Google Authentication.
3. **Browse products:** Explore various categories and view product details securely.
4. **Add to cart:** Select products you wish to purchase and add them to your cart.
5. **Checkout:** Proceed to the checkout page when ready to purchase.
6. **Place order:** Complete the payment process to place your order successfully.

## 📸 Screenshots

### Home Page
*(Placeholder for Home Page screenshot)*  
`![Home Page Screenshot](./screenshots/home-page.png)`

### Product Page
*(Placeholder for Product Page screenshot)*  
`![Product Page Screenshot](./screenshots/product-page.png)`

### Cart Page
*(Placeholder for Cart Page screenshot)*  
`![Cart Page Screenshot](./screenshots/cart-page.png)`

### Checkout Page
*(Placeholder for Checkout Page screenshot)*  
`![Checkout Page Screenshot](./screenshots/checkout-page.png)`

### Admin Dashboard
*(Placeholder for Admin Dashboard screenshot)*  
`![Admin Dashboard Screenshot](./screenshots/admin-dashboard.png)`
