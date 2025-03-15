import express, { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';

import { Account } from '../models/account';
import { mongoClient } from '../extensions/mongoClient';
import { getKafkaProducer } from '../extensions/kafkaClient'; // Not used yet
import { redisClient } from '../extensions/redisClient';       // Not used yet

const router = express.Router();

/**
 * @desc   Get all accounts
 * @route  GET /api/accounts
 */
export const getAccounts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string, 10);
        const db = mongoClient.db(process.env.MONGO_DB);
        const collection = db.collection<Account>(process.env.MONGO_COLLECTION || "");

        let cursor = collection.find({});

        // If "limit" is valid, apply it
        if (!isNaN(limit) && limit > 0) {
            cursor = cursor.limit(limit);
        }

        const results = await cursor.toArray();
        res.status(200).json(results);
    } catch (err) {
        next(err);
    }
};

export const getAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const id = req.params.id;
        const cacheKey = `account:${id}`;

        // 1. Check the Redis cache
        const cachedAccount = await redisClient.get(cacheKey);
        if (cachedAccount) {
            // If the account was found in cache, return it
            const accountFromCache = JSON.parse(cachedAccount);
            res.setHeader('X-Cache', 'HIT');
            res.status(200).json(accountFromCache);
        }

        // 2. If not in cache, fetch from MongoDB
        const db = mongoClient.db(process.env.MONGO_DB);
        const collection = db.collection<Account>(process.env.MONGO_COLLECTION || "");

        const account = await collection.findOne({ _id: new ObjectId(id) });
        if (!account) {
            const error = new Error(`Account with id ${id} not found.`);
            (error as any).status = 404;
            next(error);
        }

        // 3. Store the result in Redis before returning the data
        // Optionally set an expiration (in seconds) if desired: 
        // await redisClient.set(cacheKey, JSON.stringify(account), { EX: 60 * 5 }); // expires in 5 min
        await redisClient.set(cacheKey, JSON.stringify(account));

        res.status(200).json(account);
    } catch (err) {
        next(err);
    }
};

/**
 * @desc   Create new account
 * @route  POST /api/accounts
 */
export const createAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, dateOfBirth, accountNumber, balance } = req.body as Account;

        // Basic validation (e.g., check for required fields)
        if (!email) {
            const error = new Error(`Please include an "email" field.`);
            (error as any).status = 400;
            next(error);
        }

        const db = mongoClient.db(process.env.MONGO_DB);
        const collection = db.collection<Account>(process.env.MONGO_COLLECTION || "");

        const newAccount: Account = {
            email,
            dateOfBirth,
            accountNumber,
            balance,
            createdAt: new Date().toISOString(),
        };

        const result = await collection.insertOne(newAccount);
        // newAccount.id = parseInt(result.insertedid.toString());
        res.status(201).json(newAccount);
    } catch (err) {
        next(err);
    }
};

/**
 * @desc   Update account by _id
 * @route  PUT /api/accounts/:id
 */
export const updateAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const db = mongoClient.db(process.env.MONGO_DB);
        const collection = db.collection<Account>(process.env.MONGO_COLLECTION || "");

        // Extract updated fields from request body
        const { email, dateOfBirth, accountNumber, balance } = req.body as Account;

        // Build the "$set" object dynamically
        const updateFields: Partial<Account> = {};
        if (email !== undefined) updateFields.email = email;
        if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth;
        if (accountNumber !== undefined) updateFields.accountNumber = accountNumber;
        if (balance !== undefined) updateFields.balance = balance;

        const result = await collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: updateFields },
            { returnDocument: 'after' }
        );

        if (!result) {
            const error = new Error(`Account with id ${id} not found or not updated.`);
            (error as any).status = 404;
            next(error);
        }

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
};

/**
 * @desc   Delete an account by _id
 * @route  DELETE /api/accounts/:id
 */
export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;
        const db = mongoClient.db(process.env.MONGO_DB);
        const collection = db.collection<Account>(process.env.MONGO_COLLECTION || "");

        const result = await collection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            const error = new Error(`Account with id ${id} not found.`);
            (error as any).status = 404;
            next(error);
        }

        res.status(200).json({ message: `Account with id ${id} has been deleted.` });
    } catch (err) {
        next(err);
    }
};

// Attach controller methods to Express router
router.get('/', getAccounts);
router.get('/:id', getAccount);
router.post('/', createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

export default router;