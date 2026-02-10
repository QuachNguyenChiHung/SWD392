import { Document, Types } from 'mongoose';

export interface IEnroll extends Document {
    class_id?: Types.ObjectId;
    student_id?: Types.ObjectId;
    date_join: Date;
    status: boolean;
    date_end?: Date;
}
