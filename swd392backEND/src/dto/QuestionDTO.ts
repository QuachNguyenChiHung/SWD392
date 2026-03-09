import z from "zod";

const createQuestionSchema = z.object({
    quiz_id: z.string(),
    options: z.array(z.any()).min(2), // At least 2 options
    correct_index: z.number().int().min(0),
    type: z.enum(['multiple_choice', 'true_false']).optional(),
});

const updateQuestionSchema = z.object({
    options: z.array(z.any()).min(2).optional(),
    correct_index: z.number().int().min(0).optional(),
    type: z.enum(['multiple_choice', 'true_false']).optional(),
});
export type UpdateQuestionDTO = z.infer<typeof updateQuestionSchema>;
export type CreateQuestionDTO = z.infer<typeof createQuestionSchema>;
export {
    createQuestionSchema,
    updateQuestionSchema
};