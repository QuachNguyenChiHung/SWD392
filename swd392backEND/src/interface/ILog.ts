import { Document, Types } from 'mongoose';

export interface ILog extends Document {
    admin_id: Types.ObjectId;
    action: string;
    action_type: string;
    status: string;
}
