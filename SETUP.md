# Quick Setup Guide

## Step 1: Install Backend Dependencies
```bash
npm install
```

## Step 2: Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

## Step 3: Configure Environment Variables

Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

## Step 4: Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Or use MongoDB Atlas:**
- Create a free cluster at https://www.mongodb.com/cloud/atlas
- Get your connection string
- Update `MONGODB_URI` in `.env`

## Step 5: Start the Backend Server

In the root directory:
```bash
npm start
# or for development
npm run dev
```

The backend will run on `http://localhost:5000`

## Step 6: Start the Frontend Server

Open a new terminal and navigate to the client directory:
```bash
cd client
npm run dev
```

The frontend will run on `http://localhost:3000`

## Step 7: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

## Testing the Application

1. Register a new account with name, email, and password
2. After registration, you'll be redirected to the dashboard
3. Click "Add Expense" to create your first expense
4. Fill in the form: title, amount, category, date, and description
5. View your expenses in the table
6. Edit or delete expenses as needed

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `.env`
- For MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use
- Change the `PORT` in `.env` for backend
- Change the port in `vite.config.js` for frontend

### CORS Errors
- Make sure the backend is running on port 5000
- Check that the frontend is using the correct API URL

### Authentication Errors
- Clear localStorage and try logging in again
- Check that JWT_SECRET is set in `.env`
- Verify the token is being sent in request headers

