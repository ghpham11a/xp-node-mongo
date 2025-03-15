import express, { Request, Response, NextFunction } from 'express';

import { Account } from '../models/account';

import { mongoClient } from '../extensions/mongoClient';
import { getKafkaProducer } from '../extensions/kafkaClient';
import { redisClient } from '../extensions/redisClient';

const router = express.Router();

var accounts: Account[] = [
  {
    id: 1,
    email: 'john.doe@example.com',
    dateOfBirth: '1985-06-15',
    accountNumber: 'ACC123',
    balance: 1000,
    createdAt: '2023-03-14T10:00:00Z',
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    dateOfBirth: '1990-09-10',
    accountNumber: 'ACC456',
    balance: 2500,
    createdAt: '2023-03-14T12:30:00Z',
  },
  {
    id: 3,
    email: 'alice.jones@example.com',
    dateOfBirth: '1978-01-22',
    accountNumber: 'ACC789',
    balance: 4200.5,
    createdAt: '2023-03-14T15:45:00Z',
  },
];

// @desc   Get all posts
// @route  GET /api/posts
const getAccounts = (req: Request, res: Response, next: NextFunction) => {
    // const limit = parseInt(req.query.limit as string);

    const limit: number = parseInt((req.query as any).limit, 10);

    if (!isNaN(limit) && limit > 0) {
        res.status(200).json(accounts.slice(0, limit));
    }

    res.status(200).json(accounts);
};

// @desc    Get single post
// @route   GET /api/posts/:id
const getAccount = (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const post = accounts.find((accounts) => accounts.id === id);

    if (!post) {
        const error = new Error(`A post with the id of ${id} was not found`);
        (error as any).status = 404;
        return next(error);
    }

    res.status(200).json(post);
};

// @desc    Create new post
// @route   POST /api/posts
const createAccount = (req: Request, res: Response, next: NextFunction) => {
    const newPost = {
        id: accounts.length + 1,
        title: req.body.title,
    };

    if (!newPost.title) {
        const error = new Error(`Please include a title`);
        (error as any).status = 400;
        return next(error);
    }

    accounts.push(newPost);
    res.status(201).json(accounts);
};

// @desc    Update post
// @route   PUT /api/posts/:id
const updateAccount = (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const post = accounts.find((post) => post.id === id);

    if (!post) {
        const error = new Error(`A post with the id of ${id} was not found`);
        (error as any).status = 404;
        return next(error);
    }

    post.email = req.body.title;
    res.status(200).json(accounts);
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
const deleteAccount = (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const account = accounts.find((account) => account.id === id);

    if (!account) {
        const error = new Error(`A post with the id of ${id} was not found`);
        (error as any).status = 404;
        return next(error);
    }

    accounts = accounts.filter((account) => account.id !== id);
    res.status(200).json(accounts);
};

// Get all posts
router.get('/', getAccounts);

// Get single post
router.get('/:id', getAccount);

// Create new post
router.post('/', createAccount);

// Update Post
router.put('/:id', updateAccount);

// Delete Post
router.delete('/:id', deleteAccount);

export default router;