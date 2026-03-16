import { Document, Types } from 'mongoose';

export interface ISlide extends Document {
    slide_name: string;
    file_path: string;
}
