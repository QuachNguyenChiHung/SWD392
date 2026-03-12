import { Document, Types } from 'mongoose';

export interface ITeacherRequest extends Document {
    user_id: Types.ObjectId;
    full_name: string;
    email: string;
    credential?: string;
    attachments?: string[];
    status: 'pending' | 'approved' | 'rejected';
    processed_by?: Types.ObjectId;
    processed_at?: Date;
    reason?: string;
    created_at: Date;
}
