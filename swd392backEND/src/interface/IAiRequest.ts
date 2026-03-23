import { Document, Types } from 'mongoose';

export interface IAiRequest extends Document {
    user_id?: Types.ObjectId;
    prompt: string;
    type: string;
    date: Date;
    input_tokens?: number;
    output_tokens?: number;
}
