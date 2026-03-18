import mongoose, { Schema } from 'mongoose';
import type { ITeacher } from '../interface/ITeacher.ts';

const TeacherSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        fileName: { type: String },
        credential: { type: String, maxlength: 500 },
    },
    { timestamps: false }
);

export const Teacher = mongoose.model<ITeacher>('Teacher', TeacherSchema);
