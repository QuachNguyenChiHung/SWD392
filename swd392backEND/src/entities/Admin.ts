import mongoose, { Schema } from 'mongoose';
import type { IAdmin } from '../interface/IAdmin.ts';

const AdminSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        authorization_lvl: { type: Number, required: true },
        date_create: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
