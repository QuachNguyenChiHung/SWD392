import mongoose, { Schema } from 'mongoose';
import type { ICourse } from '../interface/ICourse.ts';

const CourseSchema: Schema = new Schema(
    {
        course_name: { type: String, required: true, maxlength: 255, unique: true },
        grade_level: { type: Number, required: true, min: 1, max: 12 },
        change_log: { type: Schema.Types.Mixed, default: null },
        date_create: { type: Date, default: Date.now },
        status: { type: String, default: "active", enum: ["active", "inactive"] },
    },
    { timestamps: false }
);

export const Course = mongoose.model<ICourse>('Course', CourseSchema);
