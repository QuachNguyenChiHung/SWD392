import z from "zod";

const UserGetFromTokenSchema = z.object({
    role: z.enum(['student', 'teacher', 'admin', 'moderator']),
    email: z.email(),
    username: z.string(),
    status: z.enum(['active', 'banned']),
    date_create: z.string(),
    iat: z.number(),
    exp: z.number(),
    __v: z.number(),
    _id: z.string(),
});

const UserUpdateSchema = z.object({
    username: z.string().optional(),
    password: z.string().min(10, "Password must be at least 10 characters long").regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
        "Password must include at least one uppercase letter, one number, and one special character").optional(),
    role: z.enum(['student', 'teacher', 'admin', 'moderator']).optional(),
    status: z.enum(['active', 'banned']).optional(),
});

export type UserUpdateDTO = z.infer<typeof UserUpdateSchema>;
export type UserGetFromTokenDTO = z.infer<typeof UserGetFromTokenSchema>;
export { UserGetFromTokenSchema, UserUpdateSchema };