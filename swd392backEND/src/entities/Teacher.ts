import mongoose, { Schema } from 'mongoose';
import type { ITeacher } from '../interface/ITeacher.ts';

const TeacherSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        credential: { type: String, maxlength: 500 },
        date_create: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

export const Teacher = mongoose.model<ITeacher>('Teacher', TeacherSchema);
