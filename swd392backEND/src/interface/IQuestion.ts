import { Document, Types } from 'mongoose';

export interface IQuestion extends Document {
    quiz_id: Types.ObjectId;
    options: any[];
    correct_index: number;
}
