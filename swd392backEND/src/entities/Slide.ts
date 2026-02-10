import mongoose, { Schema } from 'mongoose';
import type { ISlide } from '../interface/ISlide.ts';

const SlideSchema: Schema = new Schema(
    {
        material_id: { type: Schema.Types.ObjectId, ref: 'ClassMaterial', required: true, unique: true },
        slide_name: { type: String, required: true, maxlength: 255 },
        file_path: { type: String, required: true, maxlength: 500 },
    },
    { timestamps: false }
);

export const Slide = mongoose.model<ISlide>('Slide', SlideSchema);
