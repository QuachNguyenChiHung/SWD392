import z from "zod";

// Slide Schema Reference:
// {
//     slide_name: { type: String, required: true, maxlength: 255 },
//     file_path: { type: String, required: true, maxlength: 500 },
// }

const createSlideSchema = z.object({
    slide_name: z.string().max(255),
    file_path: z.string().max(500),
});

const updateSlideSchema = z.object({
    slide_name: z.string().max(255).optional(),
    file_path: z.string().max(500).optional(),
});

export type CreateSlideDTO = z.infer<typeof createSlideSchema>;
export type UpdateSlideDTO = z.infer<typeof updateSlideSchema>;

export { createSlideSchema, updateSlideSchema };