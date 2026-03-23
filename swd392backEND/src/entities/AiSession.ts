import mongoose, { Schema } from 'mongoose';
import type { IAiSession } from '../interface/IAiSession.ts';

const AiSessionSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        ai_model: { type: String, required: true, maxlength: 100 },
        total_input_tokens: { type: Number, default: 0 },
        total_output_tokens: { type: Number, default: 0 },
        estimated_cost_cents: { type: Number, default: 0 },
        budget_cents: { type: Number, default: 0 },
        last_activity: { type: Date, default: Date.now },
        created_at: { type: Date, default: Date.now },
        status: { type: String, default: 'active', enum: ['active', 'closed', 'expired'] },
    },
    { timestamps: false }
);

export const AiSession = mongoose.model<IAiSession>('AiSession', AiSessionSchema);
