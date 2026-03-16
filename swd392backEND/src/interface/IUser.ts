import { Document } from 'mongoose';

export interface IUser extends Document {
    role: "student" | "teacher" | "admin" | "moderator";
    username: string;
    email: string;
    password: string;
    name: string;
    date_create: Date;
    status: "active" | "banned" | "deleted";
}
