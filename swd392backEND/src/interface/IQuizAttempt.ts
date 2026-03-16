import { Document, Types } from 'mongoose';

export interface IQuizAttempt extends Document {
    quiz_id?: Types.ObjectId;
    user_id: Types.ObjectId;
    attempt_number: number;
    date: Date;
    record_json?: any;
}
