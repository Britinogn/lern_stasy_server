const jwt = require ('jsonwebtoken');

module.exports = (req, res, next) =>{

    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({message: 'Access denied'});
    }

    const token = header.split(' ')[1].trim();

    // Additional safety check
    if (!token || token.length === 0) {
        return res.status(401).json({message: ' Access token required '});
    }

    

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach whole decoded token + id shortcut
        req.user = decoded;
        req.userId = decoded.id;
        req.userRole = decoded.role;  

        next();

    } catch (error) {
        return res.status(401).json({message: 'Invalid token'});
    }

};



// module.exports = authenticateToken;