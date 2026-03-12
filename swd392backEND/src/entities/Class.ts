import mongoose, { Schema } from 'mongoose';
import type { IClass } from '../interface/IClass.ts';

const ClassSchema: Schema = new Schema(
    {
        keypass: { type: String, required: true, unique: true, maxlength: 100 },
        course_id: { type: Schema.Types.ObjectId, ref: 'Course', default: null },
        teacher_id: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
        class_name: { type: String, required: true, maxlength: 255 },
        img_cover_link: { type: String, default: null },
        date_create: { type: Date, default: Date.now() },
        status: { type: String, default: "active", enum: ["active", "inactive", "archived", "deleted"] },
    },
    { timestamps: false }
);

export const Class = mongoose.model<IClass>('Class', ClassSchema);
