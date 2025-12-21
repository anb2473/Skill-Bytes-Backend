import express from 'express'
import dotenv from 'dotenv'
import apiRoutes from './routes/api/api.js';
import logger from './logger.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

app.get('/ping', (req, res) => {
    return res.status(200).json({ msg: 'pong' });
});

app.use('/api', apiRoutes);

// serve vite frontend assets
app.use(express.static(path.join(__dirname, './public/dist')));

// Ensure all frontend endpointed requests are routed to index
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "./public/dist", "index.html"))
})

app.listen(PORT, () => {
    logger.info(`Server local at http://127.0.0.1:${PORT}`);
});
