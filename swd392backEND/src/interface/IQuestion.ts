import { Document, Types } from 'mongoose';

export interface IQuestion extends Document {
    quiz_id: Types.ObjectId;
    title: string;
    type: 'multiple_choice' | 'true_false';
    options: any[];
    correct_index: number;
}
