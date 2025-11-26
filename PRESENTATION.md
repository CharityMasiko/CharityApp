# My Budget - Personal Budget Tracker
## Project Presentation

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Use Cases](#use-cases)
3. [Application Pages](#application-pages)
4. [Database Design](#database-design)
5. [Why SQLite?](#why-sqlite)
6. [Chatbot Integration](#chatbot-integration)
7. [Technology Stack](#technology-stack)

---

## 🎯 Project Overview

**My Budget** is a comprehensive full-stack web application for personal budget management that helps users track income, expenses, set budgets, and gain financial literacy through an integrated educational chatbot.

**Key Features:**
- Role-based access (Users & Admins)
- Real-time budget tracking
- Interactive analytics and reports
- Financial education content
- AI-powered financial assistant chatbot

---

## 💼 Use Cases

### For Regular Users

1. **Personal Budget Management**
   - Track daily expenses across multiple categories
   - Record income from various sources
   - Set monthly budget limits per category
   - Monitor spending against budgets in real-time

2. **Financial Analysis & Reporting**
   - View spending patterns through interactive charts
   - Analyze category-wise expense breakdown
   - Track monthly trends and savings
   - Generate spending summaries

3. **Financial Education**
   - Access educational content created by admins
   - Get instant answers from the financial chatbot
   - Learn about budgeting, saving, investing, and debt management

4. **Goal Setting & Tracking**
   - Set savings goals with target amounts and dates
   - Track progress toward financial objectives
   - Receive notifications for budget alerts

5. **Profile Management**
   - Update personal information
   - Change passwords securely
   - Manage account settings

### For Administrators

1. **User Management**
   - View all registered users
   - Activate/deactivate user accounts
   - Reset user passwords
   - Monitor user activity

2. **Content Management**
   - Create and manage financial education articles
   - Update educational content
   - Organize learning materials

3. **System Administration**
   - Send system-wide notifications
   - View system statistics and analytics
   - Monitor application usage

---

## 📄 Application Pages

### 1. **Landing Page** (`index.html`)
- **Purpose**: First point of contact for users
- **Features**:
  - Hero section with call-to-action buttons
  - Feature showcase (Analytics, Goal Setting, Security, etc.)
  - "How It Works" section
  - Login and Registration modals
- **User Flow**: Visitors can learn about features and register/login

### 2. **User Dashboard** (`user-dashboard.html`)
- **Purpose**: Main interface for regular users
- **Sections**:
  - **Overview**: Summary cards (Income, Expenses, Savings, Alerts) + Charts
  - **Expenses**: Add, edit, delete expenses with category filtering
  - **Income**: Manage income sources and records
  - **Budgets**: Set and track monthly budget limits
  - **Reports**: Interactive charts and spending analysis
  - **Education**: Access financial content + Chatbot button
  - **Notifications**: View system alerts and updates
  - **Profile**: Update personal info and change password

### 3. **Admin Dashboard** (`admin-dashboard.html`)
- **Purpose**: Administrative control panel
- **Sections**:
  - **User Management**: View, activate/deactivate users
  - **Education Management**: Create/edit financial education content
  - **Notifications**: Send announcements to all users
  - **System Statistics**: View usage analytics and metrics

---

## 🗄️ Database Design

### Database: **SQLite**

### Schema Overview

#### **Core Tables:**

1. **`users`**
   - Stores user accounts with authentication
   - Fields: `id`, `name`, `email`, `password_hash`, `role`, `status`, `created_at`
   - Supports role-based access (user/admin)

2. **`expenses`**
   - Tracks user expenses
   - Fields: `id`, `user_id`, `category`, `amount`, `description`, `date`
   - Foreign key to `users` table

3. **`income`**
   - Records user income sources
   - Fields: `id`, `user_id`, `source`, `amount`, `description`, `date`
   - Foreign key to `users` table

4. **`budgets`**
   - Monthly budget limits per category
   - Fields: `id`, `user_id`, `category`, `limit_amount`, `month`, `year`
   - Unique constraint on (user_id, category, month, year)

5. **`education`**
   - Financial education content
   - Fields: `id`, `title`, `content`, `created_by`, `created_at`
   - Managed by administrators

6. **`notifications`**
   - System-wide notifications
   - Fields: `id`, `message`, `type`, `user_id`, `created_at`, `expires_at`
   - Can be targeted to specific users or all users

7. **`savings_goals`**
   - User savings targets
   - Fields: `id`, `user_id`, `goal_name`, `target_amount`, `current_amount`, `target_date`

8. **`user_notifications`**
   - Many-to-many relationship for user notification tracking
   - Fields: `id`, `user_id`, `notification_id`, `read_status`

### Database Features:
- **Foreign Key Constraints**: Ensures data integrity
- **Indexes**: Optimized queries on frequently accessed columns
- **Data Validation**: CHECK constraints on roles, status, and month values
- **Timestamps**: Automatic tracking of creation and update times

---

## 🤔 Why SQLite?

### 1. **Simplicity & Zero Configuration**
- **No server setup required**: SQLite is file-based, eliminating the need for a separate database server
- **Easy deployment**: Single database file (`mybudget.db`) that can be easily backed up or transferred
- **Perfect for development**: Quick setup without complex database server installation

### 2. **Lightweight & Embedded**
- **Small footprint**: Minimal resource usage, ideal for small to medium applications
- **Self-contained**: All database functionality in a single library
- **No external dependencies**: Works out of the box with Node.js

### 3. **Performance for Small-Medium Scale**
- **Fast read operations**: Excellent performance for applications with moderate concurrent users
- **ACID compliant**: Ensures data integrity with transactions
- **Efficient for single-user or small team applications**: Perfect for personal budget tracking

### 4. **Cost-Effective**
- **Free and open-source**: No licensing costs
- **No hosting costs**: No need for separate database hosting service
- **Low maintenance**: Minimal administrative overhead

### 5. **Development Benefits**
- **Rapid prototyping**: Quick to set up and iterate
- **Easy testing**: Simple to create test databases
- **Portable**: Database file can be easily moved between environments

### 6. **Suitable for This Project**
- **Personal budget tracking**: Typically single-user or small family use
- **Low concurrency**: Not expecting thousands of simultaneous connections
- **Data volume**: Personal financial data is relatively small in scale
- **MVP/Prototype**: Ideal for demonstrating functionality before scaling

### **When to Consider Alternatives:**
- If scaling to thousands of concurrent users → PostgreSQL/MySQL
- If needing advanced features (stored procedures, complex queries) → PostgreSQL
- If requiring distributed systems → Cloud databases (MongoDB, DynamoDB)

---

## 🤖 Chatbot Integration

### Overview
The Financial Education Chatbot provides users with instant, AI-powered answers to financial questions, helping them learn about budgeting, saving, investing, and debt management.

### Architecture

#### **Frontend Implementation**

**Location**: `public/js/dashboard.js` and embedded in `user-dashboard.html`

**Components:**
1. **Chatbot Modal**: Floating chat interface with message history
2. **Toggle Button**: "Ask Financial Assistant" button in Education section
3. **Message Display**: Real-time message rendering with user/bot distinction
4. **Input Handler**: Text input with Enter key and send button support

**Features:**
- Modal-based chat interface
- Real-time message display with timestamps
- Loading indicators during API calls
- Error handling for network issues
- Auto-scroll to latest messages

#### **Backend Implementation**

**Location**: `routes/user.js` - `/api/education/chatbot` endpoint

**API Endpoint:**
```javascript
POST /api/education/chatbot
Body: { message: string, userId: number }
Response: { success: boolean, response: string, timestamp: string }
```

**Response Generation:**
- **Pattern Matching**: Analyzes user input for financial keywords
- **Topic Detection**: Identifies topics (budgeting, saving, investing, debt, expenses)
- **Contextual Responses**: Provides relevant financial advice based on detected topics
- **Default Fallback**: Helpful default response for unrecognized queries

**Supported Topics:**
1. **Budgeting**: 50/30/20 rule, budget creation strategies
2. **Saving**: Emergency funds, savings strategies, automation
3. **Expenses**: Expense tracking, reduction tips
4. **Investing**: Investment basics, retirement accounts, diversification
5. **Debt Management**: Debt payoff strategies (avalanche/snowball methods)

#### **Integration Flow**

```
User clicks "Ask Financial Assistant"
    ↓
Chatbot modal opens
    ↓
User types question
    ↓
Frontend sends POST request to /api/education/chatbot
    ↓
Backend processes message (pattern matching)
    ↓
Backend generates financial response
    ↓
Response sent back to frontend
    ↓
Message displayed in chat interface
```

#### **Technical Details**

**Frontend Code Structure:**
- Event listeners for modal open/close
- Async/await for API calls
- DOM manipulation for message rendering
- Error handling with user-friendly messages

**Backend Code Structure:**
- Input validation (message length, empty checks)
- Keyword-based response generation
- Error handling with appropriate HTTP status codes
- Timestamp tracking for responses

#### **User Experience**

1. **Accessibility**: Chatbot accessible from Education section
2. **Responsiveness**: Works on desktop and mobile devices
3. **Visual Feedback**: Loading spinners, message timestamps, clear UI
4. **Error Handling**: Graceful error messages if API fails

#### **Future Enhancement Opportunities**

- Integration with external AI APIs (OpenAI, etc.) for more sophisticated responses
- Conversation history storage in database
- Multi-turn conversations with context awareness
- Personalized responses based on user's financial data
- Natural language processing for better understanding

---

## 🛠️ Technology Stack

### **Backend**
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **SQLite3**: Database driver
- **bcryptjs**: Password hashing
- **express-session**: Session management

### **Frontend**
- **HTML5/CSS3**: Structure and styling
- **Vanilla JavaScript**: Client-side logic
- **Chart.js**: Data visualization
- **Font Awesome**: Icons
- **Google Fonts (Inter)**: Typography

### **Development Tools**
- **Nodemon**: Auto-restart during development

---

## 📊 Key Statistics

- **7 Database Tables**: Comprehensive data model
- **3 Main Pages**: Landing, User Dashboard, Admin Dashboard
- **8 Dashboard Sections**: Complete feature set
- **RESTful API**: Clean, organized endpoints
- **Role-Based Access**: Secure user/admin separation

---

## 🎯 Project Highlights

✅ **Full-Stack Implementation**: Complete frontend and backend  
✅ **Secure Authentication**: Password hashing and session management  
✅ **Responsive Design**: Works on all devices  
✅ **Interactive Analytics**: Beautiful charts and visualizations  
✅ **Educational Component**: Financial literacy through chatbot  
✅ **Admin Tools**: Comprehensive management features  
✅ **Production Ready**: Error handling and validation throughout  

---

## 🚀 Conclusion

**My Budget** successfully combines modern web technologies with user-centered design to create a comprehensive budget tracking solution. The integration of SQLite provides simplicity and efficiency, while the chatbot enhances user education and engagement. The application is ready for deployment and can serve as a foundation for a commercial budget tracking service.

---

**Thank you for your attention!**

Questions?




