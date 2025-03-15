import { ObjectId } from "mongodb";

export interface Account {
    _id?: ObjectId;
    email?: string;
    dateOfBirth?: string;       
    accountNumber?: string;
    balance?: number;          
    createdAt?: string;         
}