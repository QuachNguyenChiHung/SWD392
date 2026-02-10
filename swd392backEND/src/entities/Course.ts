import mongoose, { Schema } from 'mongoose';
import type { ICourse } from '../interface/ICourse.ts';

const CourseSchema: Schema = new Schema(
    {
        course_name: { type: String, required: true, maxlength: 255 },
        grade_level: { type: String, required: true, maxlength: 50 },
        change_log: { type: Schema.Types.Mixed, default: null },
        date_create: { type: Date, default: Date.now },
        status: { type: Boolean, default: true },
    },
    { timestamps: false }
);

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
