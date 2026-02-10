import { Document, Types } from 'mongoose';

export interface IRender2D extends Document {
    material_id: Types.ObjectId;
    render_data: any;
}
