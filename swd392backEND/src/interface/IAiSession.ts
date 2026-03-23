import { Document, Types } from 'mongoose';

export interface IAiSession extends Document {
    user_id?: Types.ObjectId;
    ai_model: string;
    total_input_tokens: number;
    total_output_tokens: number;
    estimated_cost_cents: number;
    budget_cents: number;
    last_activity: Date;
    created_at: Date;
    status: string;
}
