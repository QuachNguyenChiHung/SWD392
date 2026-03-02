import { Document, Types } from 'mongoose';

export interface IQuiz extends Document {
    title: string;
    type: string;
    available_date?: Date;
    max_attempt_number?: number;
    end_date?: Date;
    status: boolean;
}
