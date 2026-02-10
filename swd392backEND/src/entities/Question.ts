import mongoose, { Schema } from 'mongoose';
import type { IQuestion } from '../interface/IQuestion.ts';

const QuestionSchema: Schema = new Schema(
    {
        quiz_id: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
        options: { type: [Schema.Types.Mixed], required: true },
        correct_index: { type: Number, required: true },
    },
    { timestamps: false }
);

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);
