import {Document} from 'mongoose';

export interface IFile extends Document {
    file_name: string;
    file_path: string;
}
