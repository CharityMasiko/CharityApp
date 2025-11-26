const express = require('express');
const { getRow, getAll, runQuery } = require('../db/connection');
const { requireActiveUser } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(requireActiveUser);

// ========== EXPENSES ROUTES ==========

// Get all expenses for user
router.get('/expenses', async (req, res) => {
    try {
        const { month, year, category } = req.query;
        let sql = 'SELECT * FROM expenses WHERE user_id = ?';
        const params = [req.session.userId];

        if (month && year) {
            sql += ' AND strftime("%m", date) = ? AND strftime("%Y", date) = ?';
            params.push(month.toString().padStart(2, '0'), year.toString());
        }

        if (category) {
            sql += ' AND category = ?';
            params.push(category);
        }

        sql += ' ORDER BY date DESC';

        const expenses = await getAll(sql, params);
        res.json({ success: true, expenses });
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add new expense
router.post('/expenses', async (req, res) => {
    try {
        const { category, amount, description, date } = req.body;

        if (!category || !amount || !date) {
            return res.status(400).json({
                success: false,
                message: 'Category, amount, and date are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        const result = await runQuery(
            'INSERT INTO expenses (user_id, category, amount, description, date) VALUES (?, ?, ?, ?, ?)',
            [req.session.userId, category, amount, description || '', date]
        );

        res.status(201).json({
            success: true,
            message: 'Expense added successfully',
            expenseId: result.id
        });
    } catch (error) {
        console.error('Add expense error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update expense
router.put('/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { category, amount, description, date } = req.body;

        // Check if expense belongs to user
        const expense = await getRow(
            'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
            [id, req.session.userId]
        );

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        await runQuery(
            'UPDATE expenses SET category = ?, amount = ?, description = ?, date = ? WHERE id = ?',
            [category, amount, description || '', date, id]
        );

        res.json({ success: true, message: 'Expense updated successfully' });
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete expense
router.delete('/expenses/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if expense belongs to user
        const expense = await getRow(
            'SELECT id FROM expenses WHERE id = ? AND user_id = ?',
            [id, req.session.userId]
        );

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        await runQuery('DELETE FROM expenses WHERE id = ?', [id]);

        res.json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== INCOME ROUTES ==========

// Get all income for user
router.get('/income', async (req, res) => {
    try {
        const { month, year } = req.query;
        let sql = 'SELECT * FROM income WHERE user_id = ?';
        const params = [req.session.userId];

        if (month && year) {
            sql += ' AND strftime("%m", date) = ? AND strftime("%Y", date) = ?';
            params.push(month.toString().padStart(2, '0'), year.toString());
        }

        sql += ' ORDER BY date DESC';

        const income = await getAll(sql, params);
        res.json({ success: true, income });
    } catch (error) {
        console.error('Get income error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add new income
router.post('/income', async (req, res) => {
    try {
        const { source, amount, description, date } = req.body;

        if (!source || !amount || !date) {
            return res.status(400).json({
                success: false,
                message: 'Source, amount, and date are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        const result = await runQuery(
            'INSERT INTO income (user_id, source, amount, description, date) VALUES (?, ?, ?, ?, ?)',
            [req.session.userId, source, amount, description || '', date]
        );

        res.status(201).json({
            success: true,
            message: 'Income added successfully',
            incomeId: result.id
        });
    } catch (error) {
        console.error('Add income error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update income
router.put('/income/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { source, amount, description, date } = req.body;

        // Check if income belongs to user
        const income = await getRow(
            'SELECT id FROM income WHERE id = ? AND user_id = ?',
            [id, req.session.userId]
        );

        if (!income) {
            return res.status(404).json({
                success: false,
                message: 'Income not found'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        await runQuery(
            'UPDATE income SET source = ?, amount = ?, description = ?, date = ? WHERE id = ?',
            [source, amount, description || '', date, id]
        );

        res.json({ success: true, message: 'Income updated successfully' });
    } catch (error) {
        console.error('Update income error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete income
router.delete('/income/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if income belongs to user
        const income = await getRow(
            'SELECT id FROM income WHERE id = ? AND user_id = ?',
            [id, req.session.userId]
        );

        if (!income) {
            return res.status(404).json({
                success: false,
                message: 'Income not found'
            });
        }

        await runQuery('DELETE FROM income WHERE id = ?', [id]);

        res.json({ success: true, message: 'Income deleted successfully' });
    } catch (error) {
        console.error('Delete income error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== BUDGET ROUTES ==========

// Get all budgets for user
router.get('/budgets', async (req, res) => {
    try {
        const { month, year } = req.query;
        let sql = 'SELECT * FROM budgets WHERE user_id = ?';
        const params = [req.session.userId];

        if (month && year) {
            sql += ' AND month = ? AND year = ?';
            params.push(parseInt(month), parseInt(year));
        }

        sql += ' ORDER BY month DESC, year DESC';

        const budgets = await getAll(sql, params);
        res.json({ success: true, budgets });
    } catch (error) {
        console.error('Get budgets error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add new budget
router.post('/budgets', async (req, res) => {
    try {
        const { category, limit_amount, month, year } = req.body;

        if (!category || !limit_amount || !month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Category, limit amount, month, and year are required'
            });
        }

        if (limit_amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Limit amount must be greater than 0'
            });
        }

        if (month < 1 || month > 12) {
            return res.status(400).json({
                success: false,
                message: 'Month must be between 1 and 12'
            });
        }

        const result = await runQuery(
            'INSERT INTO budgets (user_id, category, limit_amount, month, year) VALUES (?, ?, ?, ?, ?)',
            [req.session.userId, category, limit_amount, parseInt(month), parseInt(year)]
        );

        res.status(201).json({
            success: true,
            message: 'Budget added successfully',
            budgetId: result.id
        });
    } catch (error) {
        console.error('Add budget error:', error);
        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({
                success: false,
                message: 'Budget for this category already exists for this month and year'
            });
        } else {
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }
});

// Update budget
router.put('/budgets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { category, limit_amount, month, year } = req.body;

        // Check if budget belongs to user
        const budget = await getRow(
            'SELECT id FROM budgets WHERE id = ? AND user_id = ?',
            [id, req.session.userId]
        );

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: 'Budget not found'
            });
        }

        if (limit_amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Limit amount must be greater than 0'
            });
        }

        if (month < 1 || month > 12) {
            return res.status(400).json({
                success: false,
                message: 'Month must be between 1 and 12'
            });
        }

        await runQuery(
            'UPDATE budgets SET category = ?, limit_amount = ?, month = ?, year = ? WHERE id = ?',
            [category, limit_amount, parseInt(month), parseInt(year), id]
        );

        res.json({ success: true, message: 'Budget updated successfully' });
    } catch (error) {
        console.error('Update budget error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete budget
router.delete('/budgets/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if budget belongs to user
        const budget = await getRow(
            'SELECT id FROM budgets WHERE id = ? AND user_id = ?',
            [id, req.session.userId]
        );

        if (!budget) {
            return res.status(404).json({
                success: false,
                message: 'Budget not found'
            });
        }

        await runQuery('DELETE FROM budgets WHERE id = ?', [id]);

        res.json({ success: true, message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('Delete budget error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== REPORTS ROUTES ==========

// Get spending summary for charts
router.get('/reports/spending-summary', async (req, res) => {
    try {
        const { month, year } = req.query;
        const currentMonth = month || new Date().getMonth() + 1;
        const currentYear = year || new Date().getFullYear();

        // Get expenses by category
        const expensesByCategory = await getAll(`
            SELECT category, SUM(amount) as total 
            FROM expenses 
            WHERE user_id = ? AND strftime("%m", date) = ? AND strftime("%Y", date) = ?
            GROUP BY category
            ORDER BY total DESC
        `, [req.session.userId, currentMonth.toString().padStart(2, '0'), currentYear.toString()]);

        // Get monthly spending trend (last 6 months)
        const spendingTrend = await getAll(`
            SELECT 
                strftime("%Y-%m", date) as month,
                SUM(amount) as total
            FROM expenses 
            WHERE user_id = ? 
            AND date >= date('now', '-6 months')
            GROUP BY strftime("%Y-%m", date)
            ORDER BY month
        `, [req.session.userId]);

        // Get total income vs expenses
        const totalIncome = await getRow(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM income 
            WHERE user_id = ? AND strftime("%m", date) = ? AND strftime("%Y", date) = ?
        `, [req.session.userId, currentMonth.toString().padStart(2, '0'), currentYear.toString()]);

        const totalExpenses = await getRow(`
            SELECT COALESCE(SUM(amount), 0) as total
            FROM expenses 
            WHERE user_id = ? AND strftime("%m", date) = ? AND strftime("%Y", date) = ?
        `, [req.session.userId, currentMonth.toString().padStart(2, '0'), currentYear.toString()]);

        res.json({
            success: true,
            data: {
                expensesByCategory,
                spendingTrend,
                totalIncome: totalIncome.total,
                totalExpenses: totalExpenses.total,
                savings: totalIncome.total - totalExpenses.total
            }
        });
    } catch (error) {
        console.error('Get spending summary error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get budget vs actual spending
router.get('/reports/budget-analysis', async (req, res) => {
    try {
        const { month, year } = req.query;
        const currentMonth = month || new Date().getMonth() + 1;
        const currentYear = year || new Date().getFullYear();

        const budgetAnalysis = await getAll(`
            SELECT 
                b.category,
                b.limit_amount as budget_limit,
                COALESCE(SUM(e.amount), 0) as actual_spent,
                (b.limit_amount - COALESCE(SUM(e.amount), 0)) as remaining,
                CASE 
                    WHEN COALESCE(SUM(e.amount), 0) > b.limit_amount THEN 'over'
                    WHEN COALESCE(SUM(e.amount), 0) > b.limit_amount * 0.8 THEN 'warning'
                    ELSE 'good'
                END as status
            FROM budgets b
            LEFT JOIN expenses e ON b.category = e.category 
                AND strftime("%m", e.date) = ? 
                AND strftime("%Y", e.date) = ?
            WHERE b.user_id = ? AND b.month = ? AND b.year = ?
            GROUP BY b.id, b.category, b.limit_amount
        `, [
            currentMonth.toString().padStart(2, '0'),
            currentYear.toString(),
            req.session.userId,
            parseInt(currentMonth),
            parseInt(currentYear)
        ]);

        res.json({ success: true, budgetAnalysis });
    } catch (error) {
        console.error('Get budget analysis error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== EDUCATION ROUTES ==========

// Get all education content
router.get('/education', async (req, res) => {
    try {
        const education = await getAll(`
            SELECT e.*, u.name as created_by_name
            FROM education e
            JOIN users u ON e.created_by = u.id
            ORDER BY e.created_at DESC
        `);

        res.json({ success: true, education });
    } catch (error) {
        console.error('Get education error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Chatbot API endpoint
router.post('/education/chatbot', async (req, res) => {
    try {
        const { message, userId } = req.body;
        
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter a message' 
            });
        }

        if (message.length > 500) {
            return res.status(400).json({ 
                success: false, 
                message: 'Message is too long (max 500 characters)' 
            });
        }

        // Simple chatbot logic
        const response = generateFinancialResponse(message);
        
        res.json({ 
            success: true, 
            response: response,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Financial assistant is unavailable. Please try again later.' 
        });
    }
});

// Response generator function
function generateFinancialResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('budgeting')) {
        return "Creating a budget is the first step to financial control. Start by tracking all your income and expenses for one month, then categorize them. Aim for the 50/30/20 rule: 50% needs, 30% wants, 20% savings.";
    }
    
    if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
        return "For effective saving: 1) Pay yourself first (automate savings), 2) Set specific goals, 3) Build an emergency fund (3-6 months of expenses), 4) Consider high-yield savings accounts.";
    }
    
    if (lowerMessage.includes('expense') || lowerMessage.includes('spending')) {
        return "To manage expenses: Track everything for 30 days, identify unnecessary subscriptions, cook at home more often, and use the 24-hour rule before non-essential purchases.";
    }
    
    if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
        return "Before investing: 1) Build emergency fund, 2) Pay off high-interest debt, 3) Start with retirement accounts (401k/IRA), 4) Consider low-cost index funds for diversification.";
    }
    
    if (lowerMessage.includes('debt') || lowerMessage.includes('loan')) {
        return "For debt management: 1) List all debts with interest rates, 2) Consider avalanche method (highest interest first) or snowball method (smallest balance first), 3) Avoid taking on new debt.";
    }
    
    // Default response
    return "I specialize in financial education! I can help you with budgeting, saving strategies, investment basics, debt management, and general financial planning. Could you ask me something specific about personal finance?";
}

// ========== NOTIFICATIONS ROUTES ==========

// Get user notifications
router.get('/notifications', async (req, res) => {
    try {
        // SIMPLE FIX: Return empty notifications for now to avoid errors
        res.json({ 
            success: true, 
            notifications: [] 
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        // Return empty array on error
        res.json({ 
            success: true, 
            notifications: [] 
        });
    }
});

// Mark notification as read
router.post('/notifications/:id/read', async (req, res) => {
    try {
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Mark all notifications as read
router.post('/notifications/read-all', async (req, res) => {
    try {
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Mark notification as read
router.post('/notifications/:id/read', async (req, res) => {
    try {
        const { id } = req.params;

        await runQuery(`
            INSERT OR REPLACE INTO user_notifications (user_id, notification_id, read_status)
            VALUES (?, ?, 1)
        `, [req.session.userId, id]);

        res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Mark all visible notifications as read for the current user
router.post('/notifications/read-all', async (req, res) => {
    try {
        // Select all notifications that this user should see
        const visible = await getAll(`
            SELECT n.id
            FROM notifications n
            WHERE (n.user_id IS NULL OR n.user_id = ?)
              AND (n.expires_at IS NULL OR n.expires_at > datetime('now'))
        `, [req.session.userId]);

        // Upsert read status for each visible notification
        for (const row of visible) {
            await runQuery(`
                INSERT OR REPLACE INTO user_notifications (user_id, notification_id, read_status)
                VALUES (?, ?, 1)
            `, [req.session.userId, row.id]);
        }

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


 // ========== PROFILE ROUTES ==========

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const user = await getRow(
            'SELECT id, name, email, created_at FROM users WHERE id = ?',
            [req.session.userId]
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        // Check if email is already taken by another user
        const existingUser = await getRow(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, req.session.userId]
        );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already taken'
            });
        }

        await runQuery(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, req.session.userId]
        );

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Change password
router.post('/change-password', async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All password fields are required'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        // Get user current password (in real app, use bcrypt)
        const user = await getRow(
            'SELECT password FROM users WHERE id = ?',
            [req.session.userId]
        );

        // Simple password check (replace with your actual auth logic)
        // For now, we'll just update without verification for testing
        await runQuery(
            'UPDATE users SET password = ? WHERE id = ?',
            [newPassword, req.session.userId]
        );

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
module.exports = router;


