# My Budget - Personal Budget Tracker

A comprehensive full-stack role-based web application for personal budget management built with Node.js, Express.js, SQLite, and vanilla JavaScript.

## Features

### 🔐 Authentication & User Roles
- User registration and login system
- Role-based access control (User/Admin)
- Secure password hashing with bcrypt
- Session-based authentication

### 👤 User Features
- **Profile Management**: Edit personal information and change passwords
- **Income & Expense Tracking**: Add, edit, delete income and expenses with categorization
- **Budget Management**: Set monthly budget limits with alerts
- **Reports & Analytics**: Interactive charts showing spending patterns
- **Financial Education**: Access educational content from admins
- **Smart Notifications**: Get alerts for budget limits and important updates

### 👨‍💼 Admin Features
- **User Management**: View, activate/deactivate, and manage user accounts
- **Financial Education Management**: Create and manage educational content
- **System Monitoring**: View system statistics and user activity
- **Notification System**: Send announcements to all users

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite with sqlite3
- **Authentication**: bcryptjs for password hashing
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Charts**: Chart.js for data visualization
- **Styling**: Custom CSS with responsive design

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd my-budget-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize Database
```bash
npm run init-db
```

This will create the SQLite database with all necessary tables. You'll need to register an admin account through the web interface.

### 4. Start the Application
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

### 5. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## Database Schema

The application uses the following main tables:

- **users**: User accounts with roles and authentication
- **expenses**: User expense records with categories
- **income**: User income records with sources
- **budgets**: Monthly budget limits per category
- **education**: Financial education content (admin-managed)
- **notifications**: System-wide notifications
- **savings_goals**: User savings targets

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/change-password` - Change password

### User Management
- `GET /api/user/expenses` - Get user expenses
- `POST /api/user/expenses` - Add expense
- `PUT /api/user/expenses/:id` - Update expense
- `DELETE /api/user/expenses/:id` - Delete expense
- `GET /api/user/income` - Get user income
- `POST /api/user/income` - Add income
- `PUT /api/user/income/:id` - Update income
- `DELETE /api/user/income/:id` - Delete income
- `GET /api/user/budgets` - Get user budgets
- `POST /api/user/budgets` - Add budget
- `PUT /api/user/budgets/:id` - Update budget
- `DELETE /api/user/budgets/:id` - Delete budget

### Reports & Analytics
- `GET /api/user/reports/spending-summary` - Get spending analysis
- `GET /api/user/reports/budget-analysis` - Get budget vs actual analysis

### Admin Management
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Add new user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id/status` - Toggle user status
- `POST /api/admin/users/:id/reset-password` - Reset user password
- `GET /api/admin/education` - Get education content
- `POST /api/admin/education` - Add education content
- `PUT /api/admin/education/:id` - Update education content
- `DELETE /api/admin/education/:id` - Delete education content
- `GET /api/admin/notifications` - Get notifications
- `POST /api/admin/notifications` - Create notification
- `DELETE /api/admin/notifications/:id` - Delete notification
- `GET /api/admin/stats` - Get system statistics

## Project Structure

```
my-budget-tracker/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   ├── dashboard.js
│   │   └── admin-dashboard.js
│   ├── images/
│   ├── index.html
│   ├── user-dashboard.html
│   └── admin-dashboard.html
├── db/
│   ├── init.js
│   ├── init.sql
│   └── connection.js
├── routes/
│   ├── auth.js
│   ├── user.js
│   └── admin.js
├── middleware/
│   └── auth.js
├── controllers/
├── models/
├── server.js
├── package.json
└── README.md
```

## Usage

### For Regular Users
1. Register a new account or login with existing credentials
2. Add your income sources and expense categories
3. Set monthly budget limits for different categories
4. Track your spending and view analytics
5. Access financial education content
6. Monitor your progress towards savings goals

### For Administrators
1. Login with admin credentials
2. Manage user accounts (activate/deactivate, reset passwords)
3. Create and manage financial education content
4. Send system-wide notifications
5. Monitor system usage and user activity
6. View comprehensive system reports

## Security Features

- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- Session-based authentication
- CSRF protection

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.

## Future Enhancements

- Mobile app development
- Advanced reporting features
- Integration with banking APIs
- Multi-currency support
- Goal tracking and achievements
- Data export in multiple formats
- Advanced budget planning tools


