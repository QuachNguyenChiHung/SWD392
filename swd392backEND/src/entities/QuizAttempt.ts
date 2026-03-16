import mongoose, { Schema } from 'mongoose';
import type { IQuizAttempt } from '../interface/IQuizAttempt.ts';

const QuizAttemptSchema: Schema = new Schema(
    {
        quiz_id: { type: Schema.Types.ObjectId, ref: 'Quiz', default: null },
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        attempt_number: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        record_json: { type: Schema.Types.Mixed, default: null },
    },
    { timestamps: false }
);

export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
