import { Document, Types } from 'mongoose';

export interface IAdmin extends Document {
    user_id: Types.ObjectId;
    authorization_lvl: 1 | 2; // 1 is moderator, 2 is admin
    date_create: Date;
}
