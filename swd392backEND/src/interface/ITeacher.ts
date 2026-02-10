import { Document, Types } from 'mongoose';

export interface ITeacher extends Document {
    user_id: Types.ObjectId;
    credential?: string;
    date_create: Date;
}
