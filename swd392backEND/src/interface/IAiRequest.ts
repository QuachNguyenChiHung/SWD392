import { Document, Types } from 'mongoose';

export interface IAiRequestMessage {
    responder: 'ai' | 'user';
    content: string;
    at: Date;
}

export interface IAiRequest extends Document {
    user_id?: Types.ObjectId;
    AiSession_id?: Types.ObjectId;
    messages: IAiRequestMessage[];
    type: string;
    date: Date;
}
