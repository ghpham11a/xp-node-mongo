import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import accountsController from "./controllers/accountsController";

import { connectRedis } from './extensions/redisClient';
import { connectMongo } from './extensions/mongoClient';
import { connectKafka } from './extensions/kafkaClient';
import inspector from "./middleware/inspector";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use(inspector);

// Routes
app.use('/api/accounts', accountsController);

async function startServer() {
    try {
        // Kick off all connections in parallel
        await Promise.all([
            connectRedis(),
            connectMongo(),
            // connectKafka()
        ])
        
        // Once all connections are established, start the server
        app.listen(port, () => {
            console.log(`[server]: Server is running at http://localhost:${port}`);
        });
        
    } catch (err) {
        console.error('Error connecting services', err);
        process.exit(1);
    }
}

startServer();