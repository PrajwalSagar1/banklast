# MyBank - Full Stack Banking Application

A modern full-stack banking application with React frontend and Node.js/Express backend.

## 🏗️ **Project Structure**

```
mybank/
├── frontend/              # React + TypeScript application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # Auth context
│   │   ├── services/     # API service
│   │   └── App.tsx       # Main app component
│   └── package.json
│
└── mybank-backend/        # Node.js/Express API
    ├── src/
    │   ├── controllers/   # Route controllers
    │   ├── models/        # Mongoose schemas
    │   ├── routes/        # API routes
    │   ├── middleware/    # Express middleware
    │   └── index.ts       # Server entry point
    └── package.json
```

## ⚙️ **Tech Stack**

**Frontend:**

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Axios (HTTP client)
- Recharts (data visualization)

**Backend:**

- Node.js + Express
- MongoDB + Mongoose
- JWT (authentication)
- bcryptjs (password hashing)

## 🚀 **Getting Started**

### Prerequisites

- Node.js (v16+)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/PrajwalSagar1/banklast.git
cd banklast
```

2. **Backend Setup**

```bash
cd mybank-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB URI
# MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/mybank
# JWT_SECRET=your_secret_key

# Build TypeScript
npm run build

# Start development server (with auto-reload)
npm run dev

# Or start production server
npm start
```

3. **Frontend Setup**

```bash
# From project root
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 **API Endpoints**

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Account

- `GET /api/account/details` - Get account details
- `GET /api/account/balance` - Get account balance

### Transactions

- `GET /api/transactions` - Get transaction history
- `POST /api/transactions/deposit` - Deposit money
- `POST /api/transactions/withdraw` - Withdraw money
- `POST /api/transactions/transfer` - Transfer funds

### Profile

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Beneficiaries

- `GET /api/beneficiaries` - Get beneficiary list
- `POST /api/beneficiaries` - Add beneficiary
- `DELETE /api/beneficiaries/:id` - Remove beneficiary

## 🔒 **Features**

✅ User Registration & Login with JWT
✅ Account Balance Management
✅ Deposit & Withdrawal Transactions
✅ Fund Transfers
✅ Beneficiary Management
✅ Transaction History
✅ User Profile Management
✅ Two-Factor Authentication Support
✅ KYC Status Tracking
✅ Protected Routes

## 📦 **Environment Variables**

### Backend (.env)

```
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/mybank
NODE_ENV=production
JWT_SECRET=your_secret_key
```

### Frontend (Vite)

```
VITE_API_URL=https://api.yourdomain.com
```

## 🚢 **Deployment**

### Deploy Backend (Heroku/Render)

1. Create account on Heroku or Render
2. Connect your GitHub repository
3. Add environment variables (MONGO_URI, JWT_SECRET)
4. Deploy

### Deploy Frontend (Vercel/Netlify)

1. Build: `npm run build`
2. Deploy the `dist` folder
3. Set API endpoint as environment variable

### MongoDB Atlas

1. Create cluster on MongoDB Atlas
2. Get connection string
3. Add to backend .env as MONGO_URI

## 👤 **Sample Login Credentials**

After seeding the database:

```
Email: user@example.com
Password: password123
```

## 📖 **Scripts**

**Frontend:**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**

- `npm run dev` - Start with nodemon (auto-reload)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

## 🐛 **Troubleshooting**

**CORS Error?**

- Update backend `cors` origin in `mybank-backend/src/index.ts`
- In production, set: `origin: process.env.FRONTEND_URL`

**MongoDB Connection Error?**

- Verify MONGO_URI in .env is correct
- Check MongoDB credentials and IP whitelist
- Ensure MongoDB service is running

**API Not Responding?**

- Check backend is running on correct port
- Verify frontend API URL in axios config
- Check network requests in browser DevTools

## 📄 **License**

ISC

## 👨‍💻 **Author**

Prajwal Sagar

---

## ✅ **Deployment Checklist**

- [ ] Create .env file with production credentials
- [ ] Set MONGO_URI to production database
- [ ] Update CORS origin to production frontend URL
- [ ] Update frontend API URL to production backend
- [ ] Build frontend: `npm run build`
- [ ] Build backend: `npm run build`
- [ ] Test API endpoints
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Verify all features work in production
