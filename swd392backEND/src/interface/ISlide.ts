import { Document, Types } from 'mongoose';

export interface ISlide extends Document {
    material_id: Types.ObjectId;
    slide_name: string;
    file_path: string;
}
