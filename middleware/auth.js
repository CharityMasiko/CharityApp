const { getRow } = require('../db/connection');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }
    next();
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
    console.log('Admin check - Session:', req.session);
    console.log('Admin check - UserId:', req.session.userId);
    
    if (!req.session.userId) {
        console.log('No userId in session');
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }

    try {
        const user = await getRow(
            'SELECT role, status FROM users WHERE id = ?',
            [req.session.userId]
        );

        console.log('User from DB:', user);

        if (!user) {
            console.log('User not found in database');
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (user.status !== 'active') {
            console.log('User account is inactive');
            return res.status(403).json({ 
                success: false, 
                message: 'Account is inactive' 
            });
        }

        if (user.role !== 'admin') {
            console.log('User role is not admin:', user.role);
            return res.status(403).json({ 
                success: false, 
                message: 'Admin access required' 
            });
        }

        console.log('Admin check passed');
        next();
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

// Middleware to check if user is active
const requireActiveUser = async (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }

    try {
        const user = await getRow(
            'SELECT status FROM users WHERE id = ?',
            [req.session.userId]
        );

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        if (user.status !== 'active') {
            return res.status(403).json({ 
                success: false, 
                message: 'Account is inactive' 
            });
        }

        next();
    } catch (error) {
        console.error('User check error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};

module.exports = {
    requireAuth,
    requireAdmin,
    requireActiveUser
};


