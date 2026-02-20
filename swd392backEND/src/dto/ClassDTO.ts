
// const ClassSchema: Schema = new Schema(
//     {
//         keypass: { type: String, required: true, unique: true, maxlength: 100 },
//         course_id: { type: Schema.Types.ObjectId, ref: 'Course', default: null },
//         teacher_id: { type: Schema.Types.ObjectId, ref: 'Teacher', required: true },
//         class_name: { type: String, required: true, maxlength: 255 },
//         img_cover_link: { type: String, maxlength: 500 },
//         date_create: { type: Date, default: Date.now() },
//         status: { type: String, default: "active", enum: ["active", "inactive","archived"] },
//     },
//     { timestamps: false }

import z from "zod";

// );
const createClassSchema = z.object({
    keypass: z.string().max(100),
    course_id: z.string(),
    class_name: z.string().max(255),
    img_cover_link: z.string().optional(),
    teacher_id: z.string(),
});
const updateClassSchema = z.object({
    keypass: z.string().max(100).optional(),
    class_name: z.string().max(255).optional(),
    status: z.enum(["active", "inactive", "archived"]).optional(),
    img_cover_link: z.string().optional(),
});
export type CreateClassDTO = z.infer<typeof createClassSchema>;
export type UpdateClassDTO = z.infer<typeof updateClassSchema>;
export { createClassSchema, updateClassSchema };

