import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    role: z.enum(['student', 'teacher', 'admin', 'moderator'])
});
const registerSchema = z.object({
    email: z.email(),
    password: z.string().min(10, "Password must be at least 10 characters long").regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
    "Password must include at least one uppercase letter, one number, and one special character"),
    username: z.string(),
    role: z.enum(['student', 'teacher', 'admin', 'moderator']).optional().default('student'),
});


export type loginDTO = z.infer<typeof loginSchema>;
export type registerDTO = z.infer<typeof registerSchema>;
export { loginSchema, registerSchema };