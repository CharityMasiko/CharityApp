const express = require('express');
const bcrypt = require('bcryptjs');
const { getRow, getAll, runQuery } = require('../db/connection');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin authentication middleware to all routes
router.use(requireAdmin);

// ========== USER MANAGEMENT ROUTES ==========

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await getAll(`
            SELECT id, name, email, role, status, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
        `);

        res.json({ success: true, users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add new user
router.post('/users', async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        // Check if user already exists
        const existingUser = await getRow(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Create user
        const result = await runQuery(
            'INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
            [name, email, passwordHash, role, 'active']
        );

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            userId: result.id
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during user creation'
        });
    }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await getRow(`
            SELECT id, name, email, role, status, created_at, updated_at
            FROM users
            WHERE id = ?
        `, [id]);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update user
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, status } = req.body;

        if (!name || !email || !role || !status) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if email is already taken by another user
        const existingUser = await getRow(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, id]
        );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email is already taken by another user'
            });
        }

        await runQuery(
            'UPDATE users SET name = ?, email = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [name, email, role, status, id]
        );

        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update user status
router.put('/users/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be active or inactive'
            });
        }

        // Check if user exists
        const user = await getRow('SELECT id FROM users WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await runQuery(
            'UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, id]
        );

        res.json({ success: true, message: 'User status updated successfully' });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Reset user password
router.post('/users/:id/reset-password', async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        // Check if user exists
        const user = await getRow('SELECT id FROM users WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Hash new password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        await runQuery(
            'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [passwordHash, id]
        );

        res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const user = await getRow('SELECT id FROM users WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Don't allow admin to delete themselves
        if (parseInt(id) === req.session.userId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }

        await runQuery('DELETE FROM users WHERE id = ?', [id]);

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== EDUCATION MANAGEMENT ROUTES ==========

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

// Get education content by ID
router.get('/education/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const education = await getRow(`
            SELECT e.*, u.name as created_by_name
            FROM education e
            JOIN users u ON e.created_by = u.id
            WHERE e.id = ?
        `, [id]);

        if (!education) {
            return res.status(404).json({
                success: false,
                message: 'Education content not found'
            });
        }

        res.json({ success: true, education });
    } catch (error) {
        console.error('Get education error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add new education content
router.post('/education', async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const result = await runQuery(
            'INSERT INTO education (title, content, created_by) VALUES (?, ?, ?)',
            [title, content, req.session.userId]
        );

        res.status(201).json({
            success: true,
            message: 'Education content added successfully',
            educationId: result.id
        });
    } catch (error) {
        console.error('Add education error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update education content
router.put('/education/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        // Check if education content exists
        const education = await getRow('SELECT id FROM education WHERE id = ?', [id]);
        if (!education) {
            return res.status(404).json({
                success: false,
                message: 'Education content not found'
            });
        }

        await runQuery(
            'UPDATE education SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title, content, id]
        );

        res.json({ success: true, message: 'Education content updated successfully' });
    } catch (error) {
        console.error('Update education error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete education content
router.delete('/education/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if education content exists
        const education = await getRow('SELECT id FROM education WHERE id = ?', [id]);
        if (!education) {
            return res.status(404).json({
                success: false,
                message: 'Education content not found'
            });
        }

        await runQuery('DELETE FROM education WHERE id = ?', [id]);

        res.json({ success: true, message: 'Education content deleted successfully' });
    } catch (error) {
        console.error('Delete education error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== NOTIFICATION MANAGEMENT ROUTES ==========

// Get all notifications
router.get('/notifications', async (req, res) => {
    try {
        const notifications = await getAll(`
            SELECT n.*, COUNT(un.user_id) as read_count
            FROM notifications n
            LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.read_status = 1
            GROUP BY n.id
            ORDER BY n.created_at DESC
        `);

        res.json({ success: true, notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get single notification
router.get('/notifications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await getRow('SELECT * FROM notifications WHERE id = ?', [id]);
        
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({ success: true, notification });
    } catch (error) {
        console.error('Get notification error:', error);
        res.status(500).json({ success: false, message: 'Failed to get notification' });
    }
});

// Create new notification
router.post('/notifications', async (req, res) => {
    try {
        const { message, type = 'info', expires_at, recipients = 'all', user_id } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        if (!['info', 'warning', 'success', 'error'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notification type'
            });
        }

        if (recipients === 'specific' && !user_id) {
            return res.status(400).json({
                success: false,
                message: 'User ID required for specific notifications'
            });
        }

        // For 'specific', persist user_id; for 'all' or 'both', persist NULL so it's a broadcast
        const storedUserId = (recipients === 'specific') ? (user_id || null) : null;
        const result = await runQuery(
            'INSERT INTO notifications (message, type, expires_at, user_id) VALUES (?, ?, ?, ?)',
            [message, type, expires_at || null, storedUserId]
        );

        const notificationId = result.id;

        // If sending to all users, create user_notifications entries for all users
        if (recipients === 'all' || recipients === 'both') {
            const users = await getAll('SELECT id FROM users WHERE role = ?', ['user']);
            for (const u of users) {
                await runQuery(
                    'INSERT INTO user_notifications (user_id, notification_id, created_at) VALUES (?, ?, datetime(\'now\'))',
                    [u.id, notificationId]
                );
            }
        }
        if ((recipients === 'specific' || recipients === 'both') && user_id) {
            await runQuery(
                'INSERT INTO user_notifications (user_id, notification_id, created_at) VALUES (?, ?, datetime(\'now\'))',
                [user_id, notificationId]
            );
        }

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            notificationId: notificationId
        });
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update notification
router.put('/notifications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { message, type, expires_at } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        if (type && !['info', 'warning', 'success', 'error'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid notification type'
            });
        }

        // Check if notification exists
        const notification = await getRow('SELECT id FROM notifications WHERE id = ?', [id]);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        await runQuery(
            'UPDATE notifications SET message = ?, type = ?, expires_at = ? WHERE id = ?',
            [message, type || 'info', expires_at || null, id]
        );

        res.json({ success: true, message: 'Notification updated successfully' });
    } catch (error) {
        console.error('Update notification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Delete notification
router.delete('/notifications/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if notification exists
        const notification = await getRow('SELECT id FROM notifications WHERE id = ?', [id]);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        await runQuery('DELETE FROM notifications WHERE id = ?', [id]);

        res.json({ success: true, message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ========== SYSTEM STATISTICS ROUTES ==========

// Get system statistics
router.get('/stats', async (req, res) => {
    try {
        // Total users
        const totalUsers = await getRow('SELECT COUNT(*) as count FROM users');
        
        // Active users
        const activeUsers = await getRow('SELECT COUNT(*) as count FROM users WHERE status = "active"');
        
        // Total expenses logged
        const totalExpenses = await getRow('SELECT COUNT(*) as count FROM expenses');
        
        // Total income logged
        const totalIncome = await getRow('SELECT COUNT(*) as count FROM income');
        
        // Most used expense categories
        const topCategories = await getAll(`
            SELECT category, COUNT(*) as count
            FROM expenses
            GROUP BY category
            ORDER BY count DESC
            LIMIT 5
        `);
        
        // Recent activity (last 30 days)
        const recentActivity = await getAll(`
            SELECT 
                'expense' as type,
                category as description,
                amount,
                date,
                u.name as user_name
            FROM expenses e
            JOIN users u ON e.user_id = u.id
            WHERE e.created_at >= date('now', '-30 days')
            
            UNION ALL
            
            SELECT 
                'income' as type,
                source as description,
                amount,
                date,
                u.name as user_name
            FROM income i
            JOIN users u ON i.user_id = u.id
            WHERE i.created_at >= date('now', '-30 days')
            
            ORDER BY date DESC
            LIMIT 20
        `);

        res.json({
            success: true,
            stats: {
                totalUsers: totalUsers.count,
                activeUsers: activeUsers.count,
                totalExpenses: totalExpenses.count,
                totalIncome: totalIncome.count,
                topCategories,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get user activity for specific user
router.get('/users/:id/activity', async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 50 } = req.query;

        // Check if user exists
        const user = await getRow('SELECT name FROM users WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's recent activity
        const activity = await getAll(`
            SELECT 
                'expense' as type,
                category as description,
                amount,
                date,
                created_at
            FROM expenses
            WHERE user_id = ?
            
            UNION ALL
            
            SELECT 
                'income' as type,
                source as description,
                amount,
                date,
                created_at
            FROM income
            WHERE user_id = ?
            
            ORDER BY created_at DESC
            LIMIT ?
        `, [id, id, parseInt(limit)]);

        res.json({
            success: true,
            user: user.name,
            activity
        });
    } catch (error) {
        console.error('Get user activity error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;


