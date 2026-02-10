import { Document, Types } from 'mongoose';

export interface IQuiz extends Document {
    material_id: Types.ObjectId;
    title: string;
    keyword?: string;
    type: string;
    available_date?: Date;
    max_attempt_number?: number;
    end_date?: Date;
    status: boolean;
}
