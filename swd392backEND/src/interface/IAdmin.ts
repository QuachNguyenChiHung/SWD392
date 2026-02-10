import { Document, Types } from 'mongoose';

export interface IAdmin extends Document {
    user_id: Types.ObjectId;
    authorization_lvl: number;
    date_create: Date;
}
