import z from "zod";

// File Schema Reference:
// {
//     file_name: { type: String, required: true, maxlength: 255 },
//     file_path: { type: String, required: true, maxlength: 500 },
// }

const createFileSchema = z.object({
    file_name: z.string().max(255),
    file_path: z.string().max(500),
});

const updateFileSchema = z.object({
    file_name: z.string().max(255).optional(),
    file_path: z.string().max(500).optional(),
});

export type CreateFileDTO = z.infer<typeof createFileSchema>;
export type UpdateFileDTO = z.infer<typeof updateFileSchema>;

export { createFileSchema, updateFileSchema };