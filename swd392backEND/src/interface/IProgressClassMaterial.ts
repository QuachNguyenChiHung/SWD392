import { Document, Types } from 'mongoose';

export interface IProgressClassMaterial extends Document {
    enroll_id: Types.ObjectId;
    classmaterial_id?: Types.ObjectId;
    completion_status: string;
    date_completed?: Date;
}
