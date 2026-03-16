import { Document } from 'mongoose';

export interface ICourse extends Document {
    course_name: string;
    grade_level: number;
    change_log?: any;
    date_create: Date;
    status: "active" | "inactive";
}
