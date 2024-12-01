import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userroute from './router/userrouter.js';
import { connectdb } from './service/mongoconnect.js';
import dotenv from 'dotenv';
dotenv.config();
connectdb();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL.trim().replace(/\/$/, ''),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  })
);

app.use(cookieParser());

app.use('/', userroute);

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Backend connected http://localhost:${port}`);
});
