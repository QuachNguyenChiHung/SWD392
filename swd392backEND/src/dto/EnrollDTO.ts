import z from "zod";
import { Types } from "mongoose";

const CreateEnrollSchema = z.object({
    class_id: z.string(),
    student_id: z.string(),
    keypass: z.string(),
});

const UpdateEnrollStatusSchema = z.object({
    status: z.enum(["in_progress", "completed"]),
});

const EnrollResponseSchema = z.object({
    _id: z.string(),
    class_id: z.string(),
    student_id: z.string(),
    date_join: z.date(),
    status: z.enum(["in_progress", "completed"]),
    date_end: z.date().optional(),
});

export type CreateEnrollDTO = z.infer<typeof CreateEnrollSchema>;
export type UpdateEnrollStatusDTO = z.infer<typeof UpdateEnrollStatusSchema>;
export type EnrollResponseDTO = z.infer<typeof EnrollResponseSchema>;

export { CreateEnrollSchema, UpdateEnrollStatusSchema, EnrollResponseSchema };