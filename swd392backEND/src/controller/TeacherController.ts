import type { NextFunction, Request, Response } from 'express';
import TeacherService from '../services/TeacherService.ts';

class TeacherController {
    /** GET /teachers/:id — return credential + user info (exclude password) */
    async getTeacherById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id as string;
            const teacher = await TeacherService.getTeacherById(id);
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher not found' });
            }

            // teacher.user_id is populated by the repo (without password).
            // Cast to any for TypeScript because mongoose returns ObjectId when not populated.
            const populatedUser: any = (teacher as any).user_id ?? null;
            const user = populatedUser ? {
                _id: populatedUser._id,
                username: populatedUser.username,
                email: populatedUser.email,
                name: populatedUser.name,
                role: populatedUser.role,
                date_create: populatedUser.date_create,
                status: populatedUser.status,
            } : null;

            return res.status(200).json({
                credential: teacher.credential ?? null,
                user
            });
        } catch (error) {
            next(error);
        }
    }

    /** GET /teachers/by-user/:userId — return credential + user info by user ID */
    async getTeacherByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.userId as string;
            const teacher = await TeacherService.getTeacherByUserId(userId);
            if (!teacher) {
                return res.status(404).json({ message: 'Teacher not found for the given user' });
            }

            const populatedUser: any = (teacher as any).user_id ?? null;
            const user = populatedUser ? {
                _id: populatedUser._id,
                username: populatedUser.username,
                email: populatedUser.email,
                name: populatedUser.name,
                role: populatedUser.role,
                date_create: populatedUser.date_create,
                status: populatedUser.status,
            } : null;

            return res.status(200).json({
                credential: teacher.credential ?? null,
                user
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new TeacherController();
