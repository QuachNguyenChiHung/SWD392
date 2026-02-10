import { Document, Types } from 'mongoose';

export interface IClassMaterial extends Document {
    topic_id?: Types.ObjectId;
    type: 'file' | 'slide' | '2d_render' | 'quiz';
    order_num: number;
    class_assign_id: Types.ObjectId;
    title: string;
    dateUpdate?: Date;
    dateCreate: Date;
    content_id?: Types.ObjectId;
    is_ai_material: boolean;
    ai_content_id?: Types.ObjectId;
}
