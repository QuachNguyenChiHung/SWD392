import { Document } from 'mongoose';

export interface ICourse extends Document {
    course_name: string;
    grade_level: string;
    change_log?: any;
    date_create: Date;
    status: boolean;
}
