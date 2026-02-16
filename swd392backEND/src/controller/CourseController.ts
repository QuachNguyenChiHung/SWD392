import type { NextFunction, Request, Response } from "express";
import CourseService from "../services/CourseService.ts";
import type { CourseCreateDTO, CourseUpdateDTO } from "../dto/CourseDTO.ts";

class CourseController {
    async createCourse(req: Request, res: Response, next: NextFunction) {
        try {
            const courseData: CourseCreateDTO = req.body;
            const result = await CourseService.createCourse(courseData);

            if (result && typeof result === 'object' && 'error' in result) {
                return res.status(400).json(result);
            }

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async updateCourse(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const updateData: CourseUpdateDTO = req.body;
            const result = await CourseService.updateCourse(id as string, updateData);

            if (result && typeof result === 'object' && 'error' in result) {
                return res.status(400).json(result);
            }

            if (!result) {
                return res.status(404).json({ error: "Course not found" });
            }

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async deleteCourse(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await CourseService.deleteCourse(id as string);

            if (!result) {
                return res.status(404).json({ error: "Course not found" });
            }

            res.status(200).json({ message: "Course deleted successfully" });
        } catch (error) {
            next(error);
        }
    }

    async toggleCourseStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const result = await CourseService.toggleCourseStatus(id as string);

            if (!result) {
                return res.status(404).json({ error: "Course not found" });
            }

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async searchCoursesByKeyword(req: Request, res: Response, next: NextFunction) {
        try {
            const { keyword } = req.query;
            const page = parseInt(req.query.page as string) || 1;

            if (!keyword || typeof keyword !== 'string') {
                return res.status(400).json({ error: "Keyword is required" });
            }

            const result = await CourseService.searchCoursesByKeyword(keyword, page);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default new CourseController();
