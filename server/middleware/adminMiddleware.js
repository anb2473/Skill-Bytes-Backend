import express from 'express';
import { prisma } from '../prismaClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import logger from '../logger.js';

const ADMIN_PASSW_HASH = Buffer.from(process.env.ADMIN_PASSW_HASH, 'base64').toString('utf-8');

function parseBasicAuth(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Basic ')) return null;

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [usernameOrEmail, password] = credentials.split(':');
  return { usernameOrEmail, password };
}

async function adminMiddleware (req, res, next) {
    try {
        const auth = parseBasicAuth(req);
        if (!auth) return res.status(400).json({ err: 'Missing Basic Auth' });

        const passw = auth.password;

        if (typeof passw !== 'string') {     // Input validation
            return res.status(400).json({ err: 'Invalid password' });
        }        

        // Check for valid password
        const passwCorrect = await bcrypt.compare(passw, ADMIN_PASSW_HASH);
        if (passwCorrect) {
            next();
        } else {
            return res.status(401).json({ err: 'Incorrect password' });
        }
    } catch (err) {
        logger.error('Error in login', {
            error: err,
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        return res.status(500).json({ err: 'Internal server error' });
    }
}

export default adminMiddleware;
