import express from 'express';
import { prisma } from '../../prismaClient.js';
import logger from '../../logger.js';

const router = express.Router();

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

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
    } catch (err) {
        logger.error('Error in set name API method', {
            error: err,
            message: err.message,
            stack: err.stack,
            name: err.name,
        });
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
    } catch (err) {
        logger.error('Error in set username API only method', {
            error: err,
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        return res.status(500).json({ err: 'Internal server error' });
    }
});

router.get('/inbox', async (req, res) => {
    const userId = req.userID;
    
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { inbox: true }
        });
        if (!user) {
            return res.status(403).json({ err: 'User not found' });
        }

        return res.status(200).json({ messages: user.inbox });
    } catch (err) {
        logger.error('Error in inbox API only method', {
            error: err,
            message: err.message,
            stack: err.stack,
            name: err.name
        })
    }
})

router.delete('/msg:msgId', async (req, res) => {
    const userId = req.userID;
    const msgId = parseInt(req.params.msgId);
    if (isNaN(msgId)) {
        return res.status(400).json({ err: 'Invalid message ID' });
    }
    try {
        deleted = await prisma.message.delete({
            where: {
                id: msgId,
                userId: userId
            }
        });

        if (!deleted) {
            return res.status(404).json({ err: 'Message not found' });
        }
    } catch (err) {
        logger.error('Error in delete message API only method', {
            error: err,
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        return res.status(500).json({ err: 'Internal server error' });
    }
})

router.get('/get-daily-challenge', async (req, res) => {
    const userId = req.userID;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    try {
        const challenges = await prisma.challenge.findMany({
            where: {
                createdAt:{
                    gte: startOfToday,
                    lte: endOfToday
                }
            }
        })
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true }
        });

        if (!user) {
            return res.status(403).json({ err: 'User not found' });
        }

        const userPreferences = user.preferences || [];

        let preferredChallenge = null;
        let topScore = -1;
        for (const challenge of shuffle(challenges)) {
            const challengeTags = challenge.tags || [];
            const intersection = challengeTags.filter(tag => userPreferences.includes(tag));
            const score = intersection.length;
            if (score > topScore) {
                topScore = score;
                preferredChallenge = { ...challenge, score };
            }
        }
        return res.status(200).json({ challenge: preferredChallenge });
    } catch (err) {
        logger.error('Error in get daily challenge API only method', {
            error: err,
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        return res.status(500).json({ err: 'Internal server error' });
    }
})

export default router;