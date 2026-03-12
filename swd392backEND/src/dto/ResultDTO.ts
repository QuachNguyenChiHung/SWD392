import z from "zod";

// Result Schema Reference:
// {
//     quiz_attempt_id: { type: Schema.Types.ObjectId, ref: 'QuizAttempt', required: true },
//     text: { type: String, default: null },
//     options: { type: Schema.Types.Mixed, default: null },
//     options_picked_index: { type: Number, default: null },
//     isCorrect: { type: Boolean, required: true },
// }

const createResultSchema = z.object({
    quiz_attempt_id: z.string(),
    text: z.string().optional(),
    options: z.any().optional(),
    options_picked_index: z.number().int().min(0).optional(),
    isCorrect: z.boolean(),
});

const updateResultSchema = z.object({
    text: z.string().optional(),
    options: z.any().optional(),
    options_picked_index: z.number().int().min(0).optional(),
    isCorrect: z.boolean().optional(),
});

const submitQuizAnswersSchema = z.object({
    text: z.string().optional(),
    options: z.any().optional(),
    options_picked_index: z.number().int().min(0).optional(),
});

const submitQuizAttemptSchema = z.object({
    quiz_id: z.string(),
    record_json: z.any().optional(),
    answers: z.array(submitQuizAnswersSchema)
});

export type CreateResultDTO = z.infer<typeof createResultSchema>;
export type UpdateResultDTO = z.infer<typeof updateResultSchema>;
export type SubmitQuizAnswersDTO = z.infer<typeof submitQuizAnswersSchema>;
export type SubmitQuizAttemptDTO = z.infer<typeof submitQuizAttemptSchema>;

export {
    createResultSchema,
    updateResultSchema,
    submitQuizAnswersSchema,
    submitQuizAttemptSchema
};