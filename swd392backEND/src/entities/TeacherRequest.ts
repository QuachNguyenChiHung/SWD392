import mongoose, { Schema } from 'mongoose';
import type { ITeacherRequest } from '../interface/ITeacherRequest.ts';

const TeacherRequestSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        full_name: { type: String, required: true, maxlength: 255 },
        email: { type: String, required: true, maxlength: 255 },
        credential: { type: String, maxlength: 1000, default: null },
        attachments: { type: [String], default: [] },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        processed_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },
        processed_at: { type: Date, default: null },
        reason: { type: String, maxlength: 1000, default: null },
        created_at: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

export const TeacherRequest = mongoose.model<ITeacherRequest>('TeacherRequest', TeacherRequestSchema);
