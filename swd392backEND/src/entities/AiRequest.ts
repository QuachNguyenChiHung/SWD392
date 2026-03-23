import mongoose, { Schema } from 'mongoose';
import type { IAiRequest } from '../interface/IAiRequest.ts';

const AiRequestMessageSchema = new Schema(
    {
        responder: { type: String, enum: ['ai', 'user'], required: true },
        content: { type: String, required: true },
        at: { type: Date, default: Date.now },
    },
    { _id: false }
);

const AiRequestSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        AiSession_id: { type: Schema.Types.ObjectId, ref: 'AiSession', default: null },
        messages: { type: [AiRequestMessageSchema], default: [] },
        type: { type: String, required: true, maxlength: 100 },
        date: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

export const AiRequest = mongoose.model<IAiRequest>('AiRequest', AiRequestSchema);
