import { Document, Types } from 'mongoose';

export interface IAiContent extends Document {
    ai_request_id: Types.ObjectId;
    review_status: string;
    content_type: string;
    record_json: any;
}
