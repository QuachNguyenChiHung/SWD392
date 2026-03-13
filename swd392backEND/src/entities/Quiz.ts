import mongoose, { Schema } from 'mongoose';
import type { IQuiz } from '../interface/IQuiz.ts';

const QuizSchema: Schema = new Schema(
    {

        title: { type: String, required: true, maxlength: 255 },
        type: { type: String, required: true, maxlength: 50 },
        available_date: { type: Date, default: null },
        max_attempt_number: { type: Number, default: 1 },
        end_date: { type: Date, default: null },
        status: { type: Boolean, default: true },
    },
    { timestamps: false }
);

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);
