# MERN Stack Expense Tracker

A full-stack expense tracking application built with React, Node.js, Express, and MongoDB. Users can register, login, and manage their personal expenses with full CRUD operations.

## Features

- 🔐 **User Authentication** - Signup, Login, and Logout with JWT tokens
- 📊 **Expense Management** - Create, Read, Update, and Delete expenses
- 👤 **User-Specific Data** - Each user can only view and manage their own expenses
- 🎨 **Modern UI** - Clean and responsive design built with React and TailwindCSS
- 🔒 **Protected Routes** - Authentication middleware for secure API endpoints
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (JSON Web Tokens) for authentication
- bcryptjs for password hashing

### Frontend
- React 18
- Vite
- React Router DOM
- Redux Toolkit for state management
- React Redux
- Axios for API calls
- TailwindCSS for styling

## Project Structure

```
expense/
├── server/
│   ├── index.js              # Express server setup
│   ├── models/
│   │   ├── User.js           # User model
│   │   └── Expense.js        # Expense model
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   └── expenses.js       # Expense routes
│   └── middleware/
│       └── auth.js           # JWT authentication middleware
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── ExpenseForm.js
│   │   │   ├── ExpenseList.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Navbar.js
│   │   │   └── PrivateRoute.js
│   │   ├── store/
│   │   │   ├── store.js
│   │   │   ├── hooks.js
│   │   │   └── slices/
│   │   │       └── authSlice.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the root directory and install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

3. Start MongoDB (if running locally):
```bash
# On Windows
net start MongoDB

# On macOS/Linux
sudo systemctl start mongod
```

4. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the client directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication Routes

- `POST /api/auth/register` - Register a new user
  - Body: `{ name, email, password }`
  
- `POST /api/auth/login` - Login user
  - Body: `{ email, password }`
  
- `GET /api/auth/me` - Get current user (requires authentication)
  - Headers: `Authorization: Bearer <token>`

### Expense Routes (All require authentication)

- `GET /api/expenses` - Get all expenses for logged-in user
  - Returns: `{ count, expenses: [...] }`

- `POST /api/expenses` - Create new expense
  - Body: `{ title, amount, category, date, description }`

- `PUT /api/expenses/:id` - Update expense
  - Body: `{ title?, amount?, category?, date?, description? }`

- `DELETE /api/expenses/:id` - Delete expense

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Add Expense**: Click "Add Expense" button and fill in the form
3. **View Expenses**: All your expenses are displayed in a table on the dashboard
4. **Edit Expense**: Click "Edit" button on any expense to modify it
5. **Delete Expense**: Click "Delete" button to remove an expense
6. **View Summary**: Dashboard shows total expenses, count, and category breakdown

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - Token expiration time (default: 7d)

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Security Features

- Password hashing with bcryptjs
- JWT token-based authentication
- Protected API routes with middleware
- User data isolation (users can only access their own expenses)
- Input validation on both client and server

## Future Enhancements

- [ ] Add filters (by date, category)
- [ ] Add charts with Chart.js or Recharts
- [ ] Dark mode support
- [ ] Pagination for expenses list
- [ ] Export expenses to CSV
- [ ] Expense categories management
- [ ] Budget tracking
- [ ] Recurring expenses

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

