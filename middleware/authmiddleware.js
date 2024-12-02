import jwt from "jsonwebtoken"
import cookie from "cookie"
import asyncHandler from 'express-async-handler';
import dotenv from "dotenv"
import userSchema from "../model/usermodel.js"
dotenv.config()


export const authsecure = asyncHandler(async (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
        const user = await userSchema.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }

        console.error(error);
        res.status(500).json({ message: "Authentication server error" });
    }
});