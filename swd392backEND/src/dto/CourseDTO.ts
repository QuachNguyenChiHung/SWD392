import z from "zod";

const CreateCourseSchema = z.object({
    course_name: z.string().max(255),
    grade_level: z.number().int().min(1).max(12),
    change_log: z.any().optional(),
});

const CourseUpdateSchema = z.object({
    course_name: z.string().max(255).optional(),
    grade_level: z.number().int().min(1).max(12).optional(),
    change_log: z.any().optional(),
    status: z.enum(["active", "inactive"]).optional(),
});

const CourseResponseSchema = z.object({
    _id: z.string(),
    course_name: z.string(),
    grade_level: z.number(),
    change_log: z.any().optional(),
    date_create: z.date(),
    status: z.string(),
});

export type CourseCreateDTO = z.infer<typeof CreateCourseSchema>;
export type CourseUpdateDTO = z.infer<typeof CourseUpdateSchema>;
export type CourseResponseDTO = z.infer<typeof CourseResponseSchema>;

export { CreateCourseSchema, CourseUpdateSchema, CourseResponseSchema }