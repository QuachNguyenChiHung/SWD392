import z from "zod";


const CreateTopicSchema = z.object({
    course_id: z.string(),
    title: z.string().max(255),
    description: z.string().optional(),
    content_json: z.any().optional(),
});

const UpdateTopicSchema = z.object({
    title: z.string().max(255).optional(),
    description: z.string().optional(),
    course_id: z.string().optional(),
    content_json: z.any().optional(),
});


const TopicResponseSchema = z.object({
    _id: z.string(),
    course_id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    content_json: z.any().optional(),
});
const TopicSearchSchema = z.object({
    keyword: z.string().optional(),
    course_id: z.string().optional(),
    page: z.number().int().min(1).optional(),
});
export type TopicCreateDTO = z.infer<typeof CreateTopicSchema>;
export type TopicUpdateDTO = z.infer<typeof UpdateTopicSchema>;
export type TopicResponseDTO = z.infer<typeof TopicResponseSchema>;
export type TopicSearchDTO = z.infer<typeof TopicSearchSchema>;
export { CreateTopicSchema, UpdateTopicSchema, TopicResponseSchema, TopicSearchSchema }