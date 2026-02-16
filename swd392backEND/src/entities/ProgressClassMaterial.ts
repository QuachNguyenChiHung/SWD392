import mongoose, { Schema } from 'mongoose';
import type { IProgressClassMaterial } from '../interface/IProgressClassMaterial.ts';

const ProgressClassMaterialSchema: Schema = new Schema(
    {
        enroll_id: { type: Schema.Types.ObjectId, ref: 'Enroll', required: true },
        classmaterial_id: { type: Schema.Types.ObjectId, ref: 'ClassMaterial', default: null },
        completion_status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
        date_completed: { type: Date, default: null },
    },
    { timestamps: false }
);

export const ProgressClassMaterial = mongoose.model<IProgressClassMaterial>(
    'ProgressClassMaterial',
    ProgressClassMaterialSchema
);
