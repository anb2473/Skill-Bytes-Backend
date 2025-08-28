// Protects /user endpoints by checking for a valid JWT in cookies

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

function authMiddleware(req, res, next) {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(403).json({ error: "No token provided" });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log('JWT verification error:', err);
            return res.status(403).json({ error: "Invalid token" });
        }
        
        // Attatch userId from JWT for EJS
        req.userID = decoded.userId;
        next(); // Route user to user pages
    });
}

export default authMiddleware;