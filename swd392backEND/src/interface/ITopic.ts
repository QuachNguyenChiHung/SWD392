import { Document, Types } from 'mongoose';

export interface ITopic extends Document {
    course_id: Types.ObjectId;
    title: string;
    description?: string;
}
