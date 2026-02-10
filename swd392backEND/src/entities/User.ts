import mongoose, { Schema } from 'mongoose';
import type { IUser } from '../interface/IUser.ts';

const UserSchema: Schema = new Schema(
    {
        role: { type: String, required: true, enum: ['student', 'teacher', 'admin', 'moderator'], default: 'student' },
        username: { type: String, required: true, unique: true, maxlength: 100 },
        email: { type: String, required: true, unique: true, maxlength: 255 },
        password: { type: String, required: true, maxlength: 255 },
        date_create: { type: Date, default: Date.now },
        status: { type: String, default: "active", enum: ["active", "inactive", "banned"] },
    },
    { timestamps: false }
);

export const User = mongoose.model<IUser>('User', UserSchema); 