import express from 'express';
import { prisma } from '../../prismaClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import logger from '../../logger.js';

const SALT_ROUNDS = 10;
const maxJWTAge = 24 * 60 * 60 * 1000; // 24 hrs in ms
const minPasswLen = 6;
const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const body = req.body;
        const email = body.email.trim();
        const username = body.username.trim();
        const passw = body.passw;

        if (!validator.isEmail(email)) {
            return res.status(400).json({ err: 'Invalid email format' });
        }
        if (typeof passw !== 'string' || passw.length < minPasswLen) {
            return res.status(400).json({ err: 'Password must be at least 6 characters' });
        }
        if (typeof username !== 'string' || username.length < 3) {
            return res.status(400).json({ err: 'Username must be at least 3 characters' });
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({ err: 'Username can only contain letters, numbers, and underscores' });
        }

        // Check if email or username already exists
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            }
        });

        if (existing) {
            if (existing.email === email) {
                return res.status(409).json({ err: 'Email already in use' });
            } else {
                return res.status(409).json({ err: 'Username already taken' });
            }
        }

        try {
            const passw_hash = await bcrypt.hash(passw, SALT_ROUNDS);

            const newUser = await prisma.user.create({
                data: {
                    email,
                    username,
                    passw: passw_hash
                }
            });

            // Generate JWT token for new user
            const token = jwt.sign(
                { userId: newUser.id, email: newUser.email },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Set JWT token in HTTP-only cookie
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: maxJWTAge
            });

            return res.status(201).json({ message: 'User created successfully' });
        } catch (err) {
            logger.error('Error in signup - user creation / jwt catch:', {
                error: err,
                message: err.message,
                stack: err.stack,
                name: err.name
            });
            return res.status(500).json({ 
                err: 'Internal server error',
            });
        }           
    } catch (err) {
        logger.error('Error in signup - validation / existing check catch:', {
            error: err,
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        return res.status(500).json({ 
            err: 'Internal server error',
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const body = req.body;
        const emailOrUsername = body.emailOrUsername.trim();
        const passw = body.passw;

        // Validate input
        if (validator.isEmail(emailOrUsername)) {
            // Check domain
            const allowedDomains = ['gmail.com', 'yahoo.com', 'proton.me'];
            const domain = emailOrUsername.split('@')[1];
            if (!allowedDomains.includes(domain)) {
                return res.status(400).json({ err: 'Email domain not allowed' });
            }
        }   // If not email assume its a username 
        else if (emailOrUsername.trim() === '') {
              return res.status(400).json({ err: 'Username cannot be empty' });
        }

        if (typeof passw !== 'string' || passw.length < minPasswLen) {     // Input validation
            return res.status(400).json({ err: 'Invalid password' });
        }

        // Find user by email
        const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: emailOrUsername },
                { username: emailOrUsername }
              ]
            }
        });
          
        if (!user) {
            return res.status(404).json({ err: 'Incorrect password or email' });
        }

        // Check for valid password
        const passwCorrect = await bcrypt.compare(passw, user.passw);
        if (passwCorrect) {
            // Generate JWT token   
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Set JWT token in HTTP-only cookie
            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                maxAge: maxJWTAge
            });

            return res.status(200).json({ message: 'Login successful' });
        } else {
            return res.status(401).json({ err: 'Incorrect password or email' });
        }
    } catch (err) {
        logger.error(err);
        return res.status(500).json({ err: 'Internal server error' });
    }
});

export default router;
