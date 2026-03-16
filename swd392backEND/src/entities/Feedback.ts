import mongoose, { Schema } from 'mongoose';
import type { IFeedback } from '../interface/IFeedback.ts';

const FeedbackSchema: Schema = new Schema(
    {
        material_id: { type: Schema.Types.ObjectId, ref: 'ClassMaterial', default: null },
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, default: null },
        comment: { type: String, default: null },
        date: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);
