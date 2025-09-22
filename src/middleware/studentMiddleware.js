// middleware/requireStudent.js  
module.exports = (req, res, next) => {
    // Make sure user is authenticated first
    if (!req.user || !req.userRole) {
        return res.status(401).json({message: 'Authentication required'});
    }

    // Check if user is student
    if (req.userRole !== 'student') {
        return res.status(403).json({
            message: 'Access denied. Only students can enroll in courses.'
        });
    }

    next(); // User is student, allow access
};
