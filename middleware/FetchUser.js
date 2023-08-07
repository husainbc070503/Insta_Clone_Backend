require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const secret = process.env.JWT_SECRET

const FetchUser = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const data = jwt.verify(token, secret);

            req.user = await User.findById(data.id).select("-password");
            next();

        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    } else {
        res.status(400).json({ success: false, message: 'Bad request or Invalid Token. Please Login' });
    }
}

module.exports = FetchUser