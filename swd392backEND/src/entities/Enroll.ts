import mongoose, { Schema } from 'mongoose';
import type { IEnroll } from '../interface/IEnroll.ts';

const EnrollSchema: Schema = new Schema(
    {
        class_id: { type: Schema.Types.ObjectId, ref: 'Class', default: null },
        student_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        date_join: { type: Date, default: Date.now },
        status: { type: String, default: "in_progress", enum: ["in_progress", "completed"] },
        date_end: { type: Date, default: null },
    },
    { timestamps: false }
);

export const Enroll = mongoose.model<IEnroll>('Enroll', EnrollSchema);
