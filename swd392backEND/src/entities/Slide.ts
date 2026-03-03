import mongoose, { Schema } from 'mongoose';
import type { ISlide } from '../interface/ISlide.ts';

const SlideSchema: Schema = new Schema(
    {
        slide_name: { type: String, required: true, maxlength: 255 },
        file_path: { type: String, required: true, maxlength: 500 },
    },
    { timestamps: false }
);

export const Slide = mongoose.model<ISlide>('Slide', SlideSchema);
