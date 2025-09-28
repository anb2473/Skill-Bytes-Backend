import express from 'express';
import { prisma } from '../../prismaClient.js';
import logger from '../../logger.js';

const router = express.Router();

const LANGUAGES = ['javascript']

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

function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
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

router.post('/set-pref', async (req, res) => {
    const userId = req.userID;
    const { topics } = req.body;
    if (!Array.isArray(topics) || !topics.every(tag => typeof tag === 'string')) {
        return res.status(400).json({ err: 'Topics must be an array of strings' });
    }
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { preferences: topics }
        });

        return res.status(200).json({ msg: 'Preferences updated successfully' });
    } catch (err) {
        logger.error('Error in set preferences API only method', {
            error: err,
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        return res.status(500).json({ err: 'Internal server error' });
    }
});

router.post('/set-pref-lang', async (req, res) => {
    const userId = req.userID;
    const { language } = req.body;

    try {
        if (typeof language !== 'string' || !LANGUAGES.includes(language)) {
            return res.status(400).json({ err: 'Invalid language preference' });
        }
        await prisma.user.update({
            where: {id: userId},
            data: { languages: language }
        });
        
        return res.status(200).json({ msg: 'Language preference updated successfully' });
    } catch (err) {
        logger.error('Error in set language preference API only method', {
            error: err,
            message: err.message,
            stack: err.stack,
            name: err.name
        });

        return res.status(500).json({ err: 'Internal serevr error' })
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

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { preferences: true, previouslyCompleted: true, openChallengeId: true, openChallengeUpdatedAt: true }
        });

        if (!user) {
            return res.status(403).json({ err: 'User not found' });
        }

        // Check if open challenge already exists
        // Check if still same day since last update to openChallengeId and not no date exists, if so then return the existing challenge
        console.log(user.openChallengeId);
        if (user.openChallengeId && user.openChallengeUpdatedAt && isSameDay(new Date(), user.openChallengeUpdatedAt)) {
            const preferredChallenge = await prisma.challenge.findUnique({
                where: { id: user.openChallengeId }
            });
            return res.status(200).json({ challenge: preferredChallenge });
        }

        const previouslyCompleted = user.previouslyCompleted || [];

        const challenges = await prisma.challenge.findMany({
            where: {
                id: {
                    notIn: previouslyCompleted
                }
            }
        })

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
        if (preferredChallenge === null ) {
            return res.status(404).json({ err: 'No challenges available' });
        }
        await prisma.user.update({
            where: {id: userId},
            data: {
                openChallengeId: preferredChallenge.id,
                openChallengeUpdatedAt: new Date(),
                previouslyCompleted: [...previouslyCompleted, preferredChallenge.id]
            }
        });
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
});

router.get('/get-completed', async (req, res) => {
    const userId = req.userID;
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { previouslyCompleted: true }
        });

        const previouslyCompleted = user.previouslyCompleted || [];
        const challenges = await prisma.challenge.findMany({
            where: { id: { in: previouslyCompleted } }
        });

        return res.status(200).json({ challenges });
    } catch (err) {
        logger.error('Error in get completed challenges API only method', {
            error: err,
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        return res.status(500).json({ err: 'Internal server error' });
    }
});

// router.get('/get-challenge', async (req, res) => {
//     const challengeId = parseInt(req.body.challengeId);
//     if (isNaN(challengeId)) {
//         return res.status(400).json({ err: 'Invalid challenge ID' });
//     }
//     try {
//         const challenge = await prisma.challenge.findUnique({
//             where: {id: challengeId}
//         });
//         if (!challenge) {
//             return res.status(404).json({ err: 'Challenge not found' });
//         }
//         return res.status(200).json({ challenge })
//     } catch (err) {
//         logger.error({
//             error: err,
//             message: err.message,
//             stack: err.stack,
//             name: err.name
//         });
//         return res.status(500).json({ err: 'Internal server error' })
//     }
// })

export default router;