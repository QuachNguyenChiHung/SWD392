import { Document, Types } from 'mongoose';

export interface IResult extends Document {
    quiz_attempt_id: Types.ObjectId;
    text?: string;
    options?: any;
    options_picked_index?: number;
    isCorrect: boolean;
}
