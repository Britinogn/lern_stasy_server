// middleware/requireInstructor.js
module.exports = (req, res, next) => {
    console.log('🔍 req.user:', req.user); // Debug line
    console.log('🔍 req.userRole:', req.userRole); // Debug line
    
    if (!req.user || !req.userRole) {
        return res.status(401).json({message: 'Authentication required'});
    }

    if (req.userRole !== 'instructor') {
        return res.status(403).json({
            message: 'Access denied. Only instructors can create courses.'
        });
    }

    next();
};