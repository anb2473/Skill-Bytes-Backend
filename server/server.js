import express from 'express'
import dotenv from 'dotenv'

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Server local at http://127.0.0.1:${PORT}`);
});