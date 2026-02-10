import { Document, Types } from 'mongoose';

export interface IFile extends Document {
    material_id: Types.ObjectId;
    file_name: string;
    file_path: string;
}
