import mongoose, { Schema } from 'mongoose';
import type { IRender2D } from '../interface/IRender2D.ts';

const Render2DSchema: Schema = new Schema(
    {
        material_id: { type: Schema.Types.ObjectId, ref: 'ClassMaterial', required: true, unique: true },
        render_data: { type: Schema.Types.Mixed, required: true },
    },
    { timestamps: false }
);

export const Render2D = mongoose.model<IRender2D>('Render2D', Render2DSchema);
