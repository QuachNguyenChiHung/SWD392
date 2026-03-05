import z from "zod";

// ClassMaterial Schema Reference:
// {
//     topic_id: { type: Schema.Types.ObjectId, ref: 'Topic', default: null },
//     type: {
//         type: String,
//         required: true,
//         enum: ['file', 'slide', '2d_render', 'quiz'],
//     },
//     status: { type: String, required: true, enum: ['published', 'draft','reviewed','deleted'], default: 'draft' },
//     order_num: { type: Number, required: true },
//     class_assign_id: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
//     title: { type: String, required: true, maxlength: 255 },
//     dateUpdate: { type: Date, default: null },
//     dateCreate: { type: Date, default: Date.now },
//     content_id: { type: Schema.Types.ObjectId, default: null },
//     is_ai_material: { type: Boolean, default: false },
//     ai_content_id: { type: Schema.Types.ObjectId, ref: 'AiContent', default: null },
// }

const createClassMaterialSchema = z.object({
    topic_id: z.string().optional(),
    type: z.enum(['file', 'slide', '2d_render', 'quiz']),
    status: z.enum(['published', 'draft', 'reviewed', 'deleted']).optional(),
    order_num: z.number().int().positive().optional(), // Optional as it can be auto-generated
    class_assign_id: z.string(),
    title: z.string().max(255),
    content_id: z.string().optional(),
    is_ai_material: z.boolean().optional(),
    ai_content_id: z.string().optional(),
    isFlagged: z.boolean().optional(),
    isFlaggable: z.boolean().optional(),
});

const updateClassMaterialSchema = z.object({
    topic_id: z.string().optional(),
    isFlagged: z.boolean().optional(),
    isFlaggable: z.boolean().optional(),
    type: z.enum(['file', 'slide', '2d_render', 'quiz']).optional(),
    status: z.enum(['published', 'draft', 'reviewed', 'deleted']).optional(),
    order_num: z.number().int().positive().optional(),
    title: z.string().max(255).optional(),
    content_id: z.string().optional(),
    is_ai_material: z.boolean().optional(),
    ai_content_id: z.string().optional(),
    dateUpdate: z.date().optional(),
});

const reorderMaterialsSchema = z.object({
    class_id: z.string(),
    material_ids: z.array(z.string()),
});

const toggleAiMaterialSchema = z.object({
    ai_content_id: z.string().optional(),
});

const changeStatusSchema = z.object({
    status: z.enum(['published', 'draft', 'reviewed', 'deleted']),
});

export type CreateClassMaterialDTO = z.infer<typeof createClassMaterialSchema>;
export type UpdateClassMaterialDTO = z.infer<typeof updateClassMaterialSchema>;
export type ReorderMaterialsDTO = z.infer<typeof reorderMaterialsSchema>;
export type ToggleAiMaterialDTO = z.infer<typeof toggleAiMaterialSchema>;
export type ChangeStatusDTO = z.infer<typeof changeStatusSchema>;

export {
    createClassMaterialSchema,
    updateClassMaterialSchema,
    reorderMaterialsSchema,
    toggleAiMaterialSchema,
    changeStatusSchema,
};