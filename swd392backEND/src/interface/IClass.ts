import { Document, Types } from 'mongoose';

export interface IClass extends Document {
    keypass: string;
    course_id?: Types.ObjectId;
    teacher_id: Types.ObjectId;
    class_name: string;
    img_cover_link?: string;
    keywords?: string;
    date_create: Date;
    status: boolean;
}
