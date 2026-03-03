import mongoose, { Schema } from 'mongoose';
import type { IFile } from '../interface/IFile.ts';

const FileSchema: Schema = new Schema(
    {
    
        file_name: { type: String, required: true, maxlength: 255 },
        file_path: { type: String, required: true, maxlength: 500 },
    },
    { timestamps: false }
);

export const File = mongoose.model<IFile>('File', FileSchema);
