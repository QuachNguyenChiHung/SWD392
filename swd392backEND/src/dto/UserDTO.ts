import z from "zod";

const UserGetFromTokenSchema = z.object({
    role: z.enum(['student', 'teacher', 'admin', 'moderator']),
    email: z.email(),
    username: z.string(),
    status: z.enum(['active', 'inactive']),
    date_create: z.string(),
    iat: z.number(),
    exp: z.number(),
    __v: z.number(),
    _id: z.string(),
});
export type UserGetFromTokenDTO = z.infer<typeof UserGetFromTokenSchema>;
export { UserGetFromTokenSchema };