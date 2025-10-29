const jwt = require('jsonwebtoken');

// 1. Get the secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET; 

const fetchuser = (req, res, next) => {
    // 2. Get the token from the standard 'Authorization' header
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Format: "{Bearer,TOKEN}" 

    if (!token) {
        // 401 : unauthorized user
        return res.status(401).send({ error: "Access denied. No token provided." });
    }

    try {
        // 3. Verify the token using the secret
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        // 401 : unauthorized user
        res.status(401).send({ error: "Access denied. Invalid token." });
    }
};

module.exports = fetchuser;