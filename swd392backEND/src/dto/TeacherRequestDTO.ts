import z from 'zod';

// Schema Reference:
// {
//     user_id, full_name, email, credential?, attachments?,
//     status: pending|approved|rejected,
//     processed_by?, processed_at?, reason?, created_at
// }

export const createTeacherRequestSchema = z.object({
    user_id: z.string().min(1),
    full_name: z.string().max(255),
    email: z.string().email().max(255),
    credential: z.string().max(1000).optional(),
    attachments: z.array(z.string().url()).optional(),
});

export const processTeacherRequestSchema = z.object({
    action: z.enum(['approve', 'reject']),
    reason: z.string().max(1000).optional(),
});

export type CreateTeacherRequestDTO = z.infer<typeof createTeacherRequestSchema>;
export type ProcessTeacherRequestDTO = z.infer<typeof processTeacherRequestSchema>;
