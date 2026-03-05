import mongoose, { Schema } from 'mongoose';
import type { IClassMaterial } from '../interface/IClassMaterial.ts';

const ClassMaterialSchema: Schema = new Schema(
    {
        topic_id: { type: Schema.Types.ObjectId, ref: 'Topic', default: null },
        type: {
            type: String,
            required: true,
            enum: ['file', 'slide', '2d_render', 'quiz'],
        },
        status: { type: String, required: true, enum: ['published', 'draft', 'reviewed', 'deleted'], default: 'draft' },
        order_num: { type: Number, required: true },
        isFlagged: { type: Boolean, default: false },
        isFlaggable: { type: Boolean, default: true },
        class_assign_id: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
        title: { type: String, required: true, maxlength: 255 },
        dateUpdate: { type: Date, default: null },
        dateCreate: { type: Date, default: Date.now },
        content_id: { type: String, default: null },
        is_ai_material: { type: Boolean, default: false },
        ai_content_id: { type: Schema.Types.ObjectId, ref: 'AiContent', default: null },
    },
    { timestamps: false }
);

export const ClassMaterial = mongoose.model<IClassMaterial>('ClassMaterial', ClassMaterialSchema);
