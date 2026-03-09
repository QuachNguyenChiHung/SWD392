import type { Request, Response, NextFunction } from "express";
import ProgressClassMaterialService from "../services/ProgressClassMaterialService.ts";

class ProgressClassMaterialController {
    // POST /api/progress/:class_id/:classmaterial_id - Create progress for a class material
    async createProgress(req: Request, res: Response, next: NextFunction) {
        try {
            const class_id = req.params.class_id as string;
            const classmaterial_id = req.params.classmaterial_id as string;
            const student_id = req.user?.id as string;

            if (!student_id) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!class_id || !classmaterial_id) {
                return res.status(400).json({ error: "Missing required parameters" });
            }

            const result = await ProgressClassMaterialService.createProgressByClassAndStudent(
                class_id,
                student_id,
                classmaterial_id
            );

            if ((result as any).error) {
                return res.status(400).json(result);
            }

            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    // PATCH /api/progress/:class_id/:classmaterial_id/completed - Mark progress as completed
    async markAsCompleted(req: Request, res: Response, next: NextFunction) {
        try {
            const class_id = req.params.class_id as string;
            const classmaterial_id = req.params.classmaterial_id as string;
            const student_id = req.user?.id as string;

            if (!student_id) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            if (!class_id || !classmaterial_id) {
                return res.status(400).json({ error: "Missing required parameters" });
            }


            const result = await ProgressClassMaterialService.markAsCompletedByClassAndStudent(
                class_id,
                student_id,
                classmaterial_id
            );

            if ((result as any).error) {
                return res.status(400).json(result);
            }

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/progress/:enroll_id - Get all progress for an enrollment
    async getProgressByEnroll(req: Request, res: Response, next: NextFunction) {
        try {
            const enroll_id = req.params.enroll_id as string;

            if (!enroll_id) {
                return res.status(400).json({ error: "Missing required parameters" });
            }

            const result = await ProgressClassMaterialService.getProgressByEnroll(enroll_id);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // GET /api/progress/teacher/:enroll_id/ - Get students' progress in a class (teacher)
    async getClassProgressForTeacher(req: Request, res: Response, next: NextFunction) {
        try {
            const enroll_id = req.params.enroll_id as string;

            if (!enroll_id) {
                return res.status(400).json({ error: "Missing required parameters" });
            }

            const result = await ProgressClassMaterialService.getProgressByEnroll(enroll_id);
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default new ProgressClassMaterialController();
