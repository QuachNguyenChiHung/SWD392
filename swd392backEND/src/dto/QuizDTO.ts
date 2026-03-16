import z from "zod";

// Quiz Schema Reference:
// {
//     title: { type: String, required: true, maxlength: 255 },
//     type: { type: String, required: true, maxlength: 50 },
//     available_date: { type: Date, default: null },
//     max_attempt_number: { type: Number, default: null },
//     end_date: { type: Date, default: null },
//     status: { type: Boolean, default: true },
// }

const createQuizSchema = z.object({
    title: z.string().max(255),
    type: z.string().max(50),
    available_date: z.coerce.date().optional(),
    max_attempt_number: z.number().int().min(1).optional(),
    end_date: z.coerce.date().optional(),
    status: z.boolean().optional(),
});

const updateQuizSchema = z.object({
    title: z.string().max(255).optional(),
    type: z.string().max(50).optional(),
    available_date: z.coerce.date().optional(),
    max_attempt_number: z.number().int().min(1).optional(),
    end_date: z.coerce.date().optional(),
    status: z.boolean().optional(),
});

// Question Schema Reference:
// {
//     quiz_id: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
//     options: { type: [Schema.Types.Mixed], required: true },
//     correct_index: { type: Number, required: true },
//     type: { type: String, required: true, maxlength: 50, enum: ['multiple_choice', 'true_false'], default: 'multiple_choice' }
// }


// QuizAttempt Schema Reference:
// {
//     quiz_id: { type: Schema.Types.ObjectId, ref: 'Quiz', default: null },
//     user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     attempt_number: { type: Number, required: true },
//     date: { type: Date, default: Date.now },
//     record_json: { type: Schema.Types.Mixed, default: null },
// }

const createQuizAttemptSchema = z.object({
    quiz_id: z.string(),
    user_id: z.string().optional(), // Will be set by service
    attempt_number: z.number().int().positive().optional(), // Will be set by service
    record_json: z.any().optional(),
});

export type CreateQuizDTO = z.infer<typeof createQuizSchema>;
export type UpdateQuizDTO = z.infer<typeof updateQuizSchema>;

export type CreateQuizAttemptDTO = z.infer<typeof createQuizAttemptSchema>;

export {
    createQuizSchema,
    updateQuizSchema,

    createQuizAttemptSchema
};