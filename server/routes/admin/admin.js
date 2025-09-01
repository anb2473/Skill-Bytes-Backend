import express from 'express';
import { prisma } from '../../prismaClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import logger from '../../logger.js';

const router = express.Router();

router.post('/send-msg', async (req, res) => {
    const { content, icon = '📢', bannerColor = '#2821fc' } = req.body;

    if (!content || typeof content !== 'string') {
        return res.status(400).json({ err: 'Content is required and must be a string' });
    }

    try {
        const users = await prisma.user.findMany();

        for (const user of users) {
            await prisma.message.create({
                data: {
                    ownerid: user.id,
                    content,
                    icon,
                    bannerColor,
                },
            });
        }

        return res.status(200).json({ msg: 'Message sent to all users' });
    } catch (err) {
        logger.error('Error in admin route', {
            error: err,
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        return res.status(500).json({ err: 'Internal server error' });
    }
});

export default router;
