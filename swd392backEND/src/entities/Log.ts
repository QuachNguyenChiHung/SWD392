import mongoose, { Schema } from 'mongoose';
import type { ILog } from '../interface/ILog.ts';

const LogSchema: Schema = new Schema(
    {
        admin_id: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
        action: { type: String, required: true, maxlength: 255 },
        action_type: { type: String, required: true, maxlength: 100 },
        status: { type: String, required: true, maxlength: 50 },
    },
    { timestamps: false }
);

export const Log = mongoose.model<ILog>('Log', LogSchema);
