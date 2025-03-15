import { MongoClient } from 'mongodb';

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/mydb';

export let mongoClient: MongoClient;

export async function connectMongo() {
  if (!mongoClient) {
    mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
    console.log('Connected to MongoDB');
  }
}