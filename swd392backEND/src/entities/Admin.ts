import mongoose, { Schema } from 'mongoose';
import type { IAdmin } from '../interface/IAdmin.ts';

const AdminSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        authorization_lvl: { type: Number, required: true ,default: 1,enum: [1, 2] },
        date_create: { type: Date, default: Date.now },
    },
    { timestamps: false }
);
//1 is moderator, 2 is admin
export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
