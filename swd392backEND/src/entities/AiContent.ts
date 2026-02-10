import mongoose, { Schema } from 'mongoose';
import type { IAiContent } from '../interface/IAiContent.ts';

const AiContentSchema: Schema = new Schema(
    {
        ai_request_id: { type: Schema.Types.ObjectId, ref: 'AiRequest', required: true },
        review_status: { type: String, required: true, maxlength: 50 },
        content_type: { type: String, required: true, maxlength: 100 },
        record_json: { type: Schema.Types.Mixed, required: true },
    },
    { timestamps: false }
);

export const AiContent = mongoose.model<IAiContent>('AiContent', AiContentSchema);
