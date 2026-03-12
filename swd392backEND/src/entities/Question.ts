import mongoose, { Schema } from 'mongoose';
import type { IQuestion } from '../interface/IQuestion.ts';

const QuestionSchema: Schema = new Schema(
    {
        quiz_id: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
        title: { type: String, required: true },
        options: { type: [Schema.Types.Mixed], required: true },
        correct_index: { type: Number, required: true },
        type: { type: String, required: true, maxlength: 50, enum: ['multiple_choice', 'true_false'], default: 'multiple_choice' }
    },
    { timestamps: false }
);

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);
