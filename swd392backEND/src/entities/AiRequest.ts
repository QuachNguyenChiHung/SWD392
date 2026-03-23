import mongoose, { Schema } from 'mongoose';
import type { IAiRequest } from '../interface/IAiRequest.ts';

const AiRequestSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        prompt: { type: String, required: true },
        type: { type: String, required: true, maxlength: 100 },
        date: { type: Date, default: Date.now },
        input_tokens: { type: Number, default: 0 },
        output_tokens: { type: Number, default: 0 },
    },
    { timestamps: false }
);

export const AiRequest = mongoose.model<IAiRequest>('AiRequest', AiRequestSchema);
