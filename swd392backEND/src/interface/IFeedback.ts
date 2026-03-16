import { Document, Types } from 'mongoose';

export interface IFeedback extends Document {
    material_id?: Types.ObjectId;
    user_id: Types.ObjectId;
    rating?: number;
    comment?: string;
    date: Date;
}
