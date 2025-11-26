# My Budget - Complete Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   ```bash
   npm run init-db
   ```

3. **Start the Application**
   ```bash
   npm start
   ```

4. **Access the Application**
   Open your browser and go to: `http://localhost:3000`

## 🔑 Getting Started

### Create Admin Account
- Click "Sign Up" on the landing page
- Fill in your details
- Choose "Admin" role for full access to all features

### Create User Account
- Click "Sign Up" on the landing page
- Fill in your details
- Choose "User" role for regular access

## 📱 Application Features

### For Regular Users
- ✅ **Dashboard Overview**: Visual summary of income, expenses, and savings
- ✅ **Expense Tracking**: Add, edit, delete expenses with categories
- ✅ **Income Management**: Track income sources and amounts
- ✅ **Budget Management**: Set monthly limits and track spending
- ✅ **Reports & Analytics**: Interactive charts and spending analysis
- ✅ **Financial Education**: Access educational content
- ✅ **Profile Management**: Update personal information and password

### For Administrators
- ✅ **User Management**: View, create, edit, and manage all users
- ✅ **Education Content**: Create and manage financial education articles
- ✅ **System Notifications**: Send announcements to all users
- ✅ **System Analytics**: View comprehensive system statistics
- ✅ **User Activity Monitoring**: Track user engagement and activity

## 🎨 Professional Design Features

- **Modern UI**: Clean, professional interface with Inter font
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Interactive Charts**: Beautiful data visualization with Chart.js
- **Smooth Animations**: Professional transitions and hover effects
- **Color-coded Elements**: Intuitive visual feedback
- **Accessibility**: Proper contrast ratios and keyboard navigation

## 🛠️ Technical Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite with sqlite3
- **Authentication**: bcryptjs for secure password hashing
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Charts**: Chart.js for data visualization
- **Icons**: Font Awesome 6
- **Fonts**: Google Fonts (Inter)

## 📊 Database Schema

The application includes these main tables:
- `users` - User accounts and authentication
- `expenses` - Expense records with categories
- `income` - Income records with sources
- `budgets` - Monthly budget limits per category
- `education` - Financial education content
- `notifications` - System-wide notifications
- `savings_goals` - User savings targets

## 🔧 Development Commands

```bash
# Start development server with auto-restart
npm run dev

# Initialize database (run once)
npm run init-db

# Start production server
npm start
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/me` - Update user profile
- `POST /api/auth/change-password` - Change password

### User Management
- `GET /api/user/expenses` - Get user expenses
- `POST /api/user/expenses` - Add expense
- `PUT /api/user/expenses/:id` - Update expense
- `DELETE /api/user/expenses/:id` - Delete expense
- Similar endpoints for income and budgets

### Admin Management
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- Similar endpoints for education and notifications

## 🎯 Usage Examples

### Adding Your First Expense
1. Login to your account
2. Click on "Expenses" in the sidebar
3. Click "Add Expense" button
4. Fill in category, amount, description, and date
5. Click "Add Expense"

### Setting Up a Budget
1. Go to "Budgets" section
2. Click "Add Budget"
3. Select category and set limit amount
4. Choose month and year
5. Click "Add Budget"

### Viewing Reports
1. Navigate to "Reports" section
2. View spending analysis charts
3. Check budget vs actual spending
4. Export data if needed

## 🔒 Security Features

- **Password Hashing**: All passwords are securely hashed with bcrypt
- **Session Management**: Secure session-based authentication
- **Input Validation**: All inputs are validated and sanitized
- **SQL Injection Prevention**: Parameterized queries used throughout
- **Role-based Access**: Different access levels for users and admins

## 📱 Mobile Responsiveness

The application is fully responsive and works great on:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (320px - 767px)

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Make sure you ran `npm run init-db`
   - Check if the database file exists in the `db/` folder

2. **Port Already in Use**
   - Change the port in `server.js` (line 8)
   - Or kill the process using port 3000

3. **Module Not Found Error**
   - Run `npm install` to install dependencies
   - Check if all files are in the correct locations

4. **Charts Not Loading**
   - Check browser console for JavaScript errors
   - Ensure internet connection for Chart.js CDN

### Getting Help

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all dependencies are installed
3. Ensure the database is properly initialized
4. Check that the server is running on the correct port

## 🚀 Deployment

For production deployment:

1. **Environment Variables**
   ```bash
   export NODE_ENV=production
   export PORT=3000
   ```

2. **Database Backup**
   - Copy the `db/mybudget.db` file
   - Store it securely for backup

3. **Process Management**
   - Use PM2 or similar for process management
   - Set up proper logging and monitoring

## 📈 Future Enhancements

- Mobile app development
- Advanced reporting features
- Banking API integration
- Multi-currency support
- Goal tracking and achievements
- Data export in multiple formats
- Advanced budget planning tools

## 🎉 Success!

Your My Budget application is now running successfully! 

- **Landing Page**: http://localhost:3000
- **User Dashboard**: http://localhost:3000/dashboard (after login)
- **Admin Dashboard**: http://localhost:3000/dashboard (admin login)

Enjoy managing your finances with this professional budget tracking application!
