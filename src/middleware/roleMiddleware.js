// middleware/roleMiddleware.js

// 🔹 Role-based authorization middleware (factory function)
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        // Check if auth middleware was called first
        if (!req.user || !req.userRole) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Handle single role
        if (typeof requiredRole === 'string') {
            if (req.userRole !== requiredRole) {
                return res.status(403).json({ 
                    message: `Access denied: ${requiredRole} role required` 
                });
            }
        }
        
        // Handle multiple roles (array)
        if (Array.isArray(requiredRole)) {
            if (!requiredRole.includes(req.userRole)) {
                return res.status(403).json({ 
                    message: `Access denied: One of [${requiredRole.join(', ')}] roles required` 
                });
            }
        }

        next();
    };
};

// 👈 PUT IT HERE - at the end of the file
module.exports = { requireRole };