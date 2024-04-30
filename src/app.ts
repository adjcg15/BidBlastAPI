import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const APP_PORT = process.env.PORT;

app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${APP_PORT}`)
});