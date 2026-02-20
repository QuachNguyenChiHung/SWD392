import type { Request, Response, NextFunction } from "express";
import EnrollService from "../services/EnrollService.ts";
import { CreateEnrollSchema } from "../dto/EnrollDTO.ts";

class EnrollController {
    // POST: /api/enroll/:u_id/:class_id - Student enrollment
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
            const teacherUserId = req.user?.id;

            const result = await EnrollService.completeEnrollment(enroll_id as string, teacherUserId as string);

            if ((result as any).error) {
                return res.status(403).json(result);
            }

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default new EnrollController();