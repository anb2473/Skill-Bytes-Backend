import express from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/auth/auth.js';
import userRoutes from './routes/user/user.js';
import authMiddleware from './middleware/authMiddleware.js';
import logger from './logger.js';
import cors from 'cors';

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.use(cors({    // Necessary to prevent browser from blocking site
    origin: 'http://localhost:5173', // your frontend URL
    credentials: true,               // if you’re using cookies/auth
}));

app.use('/auth', authRoutes);
app.use('/user', authMiddleware, userRoutes);

app.listen(PORT, () => {
    logger.info(`Server local at http://127.0.0.1:${PORT}`);
});