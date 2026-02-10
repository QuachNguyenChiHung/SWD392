import mongoose, { Schema } from 'mongoose';
import type { IQuiz } from '../interface/IQuiz.ts';

const QuizSchema: Schema = new Schema(
    {
        material_id: { type: Schema.Types.ObjectId, ref: 'ClassMaterial', required: true, unique: true },
        title: { type: String, required: true, maxlength: 255 },
        keyword: { type: String, maxlength: 500 },
        type: { type: String, required: true, maxlength: 50 },
        available_date: { type: Date, default: null },
        max_attempt_number: { type: Number, default: null },
        end_date: { type: Date, default: null },
        status: { type: Boolean, default: true },
    },
    { timestamps: false }
);

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);
