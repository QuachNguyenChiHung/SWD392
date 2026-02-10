import mongoose, { Schema } from 'mongoose';
import type { IResult } from '../interface/IResult.ts';

const ResultSchema: Schema = new Schema(
    {
        quiz_attempt_id: { type: Schema.Types.ObjectId, ref: 'QuizAttempt', required: true },
        text: { type: String, default: null },
        options: { type: Schema.Types.Mixed, default: null },
        options_picked_index: { type: Number, default: null },
        isCorrect: { type: Boolean, required: true },
    },
    { timestamps: false }
);

export const Result = mongoose.model<IResult>('Result', ResultSchema);
