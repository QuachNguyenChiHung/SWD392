import type { NextFunction, Request, Response } from "express";
import QuizService from "../services/QuizService.ts";
import {
    createQuizSchema,
    updateQuizSchema,
    createQuizAttemptSchema
} from "../dto/QuizDTO.ts";

class QuizController {
    async getAllQuizzes(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const quizzes = await QuizService.getAllQuizzes(page);
            return res.status(200).json(quizzes);
        } catch (error) {
            next(error);
        }
    }

    async getQuizById(req: Request, res: Response, next: NextFunction) {
        try {
            const quiz = await QuizService.getQuizById(req.params.id as string);
            if (!quiz) {
                return res.status(404).json({ message: "Quiz not found" });
            }
            return res.status(200).json(quiz);
        } catch (error) {
            next(error);
        }
    }

    async createQuiz(req: Request, res: Response, next: NextFunction) {
        try {
            const quizData = createQuizSchema.parse(req.body);
            const created = await QuizService.createQuiz(quizData);
            return res.status(201).json(created);
        } catch (error) {
            next(error);
        }
    }

    async updateQuiz(req: Request, res: Response, next: NextFunction) {
        try {
            const updateData = updateQuizSchema.parse(req.body);
            const result = await QuizService.updateQuiz(req.params.id as string, updateData);
            if ((result as any)?.error) {
                return res.status(404).json({ message: (result as any).error });
            }
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async deleteQuiz(req: Request, res: Response, next: NextFunction) {
        try {
            // Extract user info from middleware (verifyAdmin or verifyTeacher)
            const user = req.user;
            if (!user || !user.id || !user.role) {
                return res.status(401).json({ error: "Unauthorized: User not authenticated" });
            }

            const result = await QuizService.deleteQuiz(req.params.id as string, {
                id: user.id,
                role: user.role
            });

            if (!result) {
                return res.status(404).json({ error: "Quiz not found" });
            }

            return res.status(200).json({
                message: "Quiz deleted successfully",
                deleted: result
            });
        } catch (error) {
            if (error instanceof Error && error.message.includes("Permission denied")) {
                return res.status(403).json({ error: error.message });
            }
            next(error);
        }
    }

    async toggleQuizStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await QuizService.toggleQuizStatus(req.params.id as string);
            if ((result as any)?.error) {
                return res.status(404).json({ message: (result as any).error });
            }
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getQuizAttemptsByQuizId(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const result = await QuizService.getQuizAttemptsByQuizId(req.params.quizId as string, page);
            if ((result as any)?.error) {
                return res.status(404).json({ message: (result as any).error });
            }
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async getQuizAttemptsByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const attempts = await QuizService.getQuizAttemptsByUserId(req.params.userId as string, page);
            return res.status(200).json(attempts);
        } catch (error) {
            next(error);
        }
    }

    async createQuizAttempt(req: Request, res: Response, next: NextFunction) {
        try {
            const attemptData = createQuizAttemptSchema.parse(req.body);
            const { userId } = req.params;
            const result = await QuizService.createQuizAttempt(attemptData, userId as string);
            if ((result as any)?.error) {
                return res.status(400).json({ message: (result as any).error });
            }
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default new QuizController();
