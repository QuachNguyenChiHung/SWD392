import type { Request, Response, NextFunction } from "express";
import EnrollService from "../services/EnrollService.ts";
import { CreateEnrollSchema, EnrollByKeypassSchema, InviteStudentSchema } from "../dto/EnrollDTO.ts";

class EnrollController {
    // POST: /api/enroll/ - Student enrollment
    async createEnrollment(req: Request, res: Response, next: NextFunction) {
        try {
            const { class_id } = req.params;
            const { keypass } = req.body;

            const enrollData = {
                student_id: req.user?.id,
                class_id: class_id,
                keypass: keypass
            };

            const validatedData = CreateEnrollSchema.parse(enrollData);
            const result = await EnrollService.createEnrollment(validatedData);

            if ((result as any).error) {
                return res.status(400).json(result);
            }

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    // POST: /api/enroll/keypass - Student enrolls by keypass
    async enrollByKeypass(req: Request, res: Response, next: NextFunction) {
        try {
            const student_id = req.user?.id as string;
            const { keypass } = req.body;

            if (!student_id) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const validatedData = EnrollByKeypassSchema.parse({ student_id, keypass });
            const result = await EnrollService.enrollByKeypass(validatedData);

            if ((result as any).error) {
                return res.status(400).json(result);
            }

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    // POST: /api/enroll/invite/:class_id - Teacher invites student to class
    async inviteStudent(req: Request, res: Response, next: NextFunction) {
        try {
            const { class_id } = req.params;
            const { student_id } = req.body;
            const teacher_id = req.teacher?._id?.toString();

            if (!teacher_id) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const validatedData = InviteStudentSchema.parse({ student_id, class_id });
            const result = await EnrollService.inviteStudent(validatedData, teacher_id);

            if ((result as any).error) {
                return res.status(400).json(result);
            }

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    // GET: /api/enroll/:class_id - Get all enrollments from a class (paginated)
    async getEnrollmentsByClass(req: Request, res: Response, next: NextFunction) {
        try {
            const { class_id } = req.params;
            const page = parseInt(req.query.page as string) || 1;

            const enrollments = await EnrollService.getEnrollmentsByClass(class_id as string, page);
            res.status(200).json(enrollments);
        } catch (error) {
            next(error);
        }
    }

    // PATCH: /api/enroll/:enroll_id/completed - Mark enrollment status as completed
    async completeEnrollment(req: Request, res: Response, next: NextFunction) {
        try {
            const { enroll_id } = req.params;
            const teacher_id = req.teacher?._id?.toString();

            const result = await EnrollService.completeEnrollment(enroll_id as string, teacher_id as string);

            if ((result as any).error) {
                return res.status(403).json(result);
            }

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // GET: /api/enroll/student - Get all enrollments for the authenticated student
    async getMyEnrollments(req: Request, res: Response, next: NextFunction) {
        try {
            const student_id = req.user?.id as string;

            if (!student_id) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const enrollments = await EnrollService.getStudentEnrollments(student_id);
            res.status(200).json(enrollments);
        } catch (error) {
            next(error);
        }
    }

    async getAdminEnrollmentStats(req: Request, res: Response, next: NextFunction) {
        try {
            const { timeRange, status } = req.query;
            const result = await EnrollService.getAdminEnrollmentStats(
                timeRange as string,
                status as string
            );

            if ((result as any).error) {
                return res.status(400).json(result);
            }

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default new EnrollController();