import express from 'express';
import { prisma } from '../../prismaClient.js';

const router = express.Router();

router.post('/set-name', async (req, res) => {
    const userId = req.userID; // From authMiddleware
    const { name } = req.body;
    
    if (typeof name !== 'string' || name.trim().length < 1) {   // input validation
        return res.status(400).json({ err: 'Name must be at least 1 character' });
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { fname: name.trim() }
        });
        return res.status(200).json({ msg: 'Name updated successfully' });
    } catch (error) {
        console.error('Error updating name:', error);
        return res.status(500).json({ err: 'Internal server error' });
    }
});

router.post('/set-username', async (req, res) => {
    const userId = req.userID; // From authMiddleware
    const { username } = req.body;

    // input validation
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ err: 'Username can only contain letters, numbers, and underscores' });
    }
    if (typeof username !== 'string' || username.trim().length < 3) {
        return res.status(400).json({ err: 'Username must be at least 3 characters' });
    }

    try {
        // Check if username already exists
        const existing = await prisma.user.findUnique({
            where: { username: username.trim() }
        });

        if (existing) {
            if (existing.id === userId) {
                return res.status(200).json({ msg: 'Username updated successfully' }); // No change needed
            }
            return res.status(409).json({ err: 'Username already taken' });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { username: username.trim() }
        });
        return res.status(200).json({ msg: 'Username updated successfully' });
    } catch (error) {
        console.error('Error updating username:', error);
        return res.status(500).json({ err: 'Internal server error' });
    }
});

export default router;