import type { NextFunction, Request, Response } from "express";
import QuizAttemptService from "../services/QuizAttemptService.ts";
import { submitQuizAttemptSchema } from "../dto/ResultDTO.ts";

class QuizAttemptController {
    // For teachers: Get all quiz attempts with results for a specific quiz
    async getQuizAttemptsWithResultsByQuizId(req: Request, res: Response, next: NextFunction) {
        try {
            const { quizId } = req.params;
            const page = parseInt(req.query.page as string) || 1;

            if (!quizId || Array.isArray(quizId)) {
                return res.status(400).json({ message: "Invalid Quiz ID" });
            }

            const result = await QuizAttemptService.getQuizAttemptsWithResultsByQuizId(quizId, page);

            if ('error' in result) {
                return res.status(404).json({ message: result.error });
            }

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // For teachers: Get latest quiz attempt with results for a specific student and quiz
    async getLatestQuizAttemptWithResults(req: Request, res: Response, next: NextFunction) {
        try {
            const { quizId, userId } = req.params;

            if (!quizId || !userId || Array.isArray(quizId) || Array.isArray(userId)) {
                return res.status(400).json({ message: "Valid Quiz ID and User ID are required" });
            }

            const result = await QuizAttemptService.getLatestQuizAttemptWithResults(quizId, userId);

            if ('error' in result) {
                return res.status(404).json({ message: result.error });
            }

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // For students: Create quiz attempt and submit answers in one operation
    async createAndSubmitQuizAttempt(req: Request, res: Response, next: NextFunction) {
        try {
            const submissionData = submitQuizAttemptSchema.parse(req.body);

            if (!submissionData) {
                return res.status(400).json({ message: "Invalid submission data" });
            }

            // Use authenticated user's ID from verification middleware instead of param
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ message: "User authentication required" });
            }

            const attemptData = {
                quiz_id: submissionData.quiz_id,
                user_id: userId,
                record_json: submissionData.record_json
            };

            const result = await QuizAttemptService.createAndSubmitQuizAttempt(
                attemptData,
                submissionData.answers
            );

            if ('error' in result) {
                return res.status(400).json({ message: result.error });
            }

            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    // Additional utility endpoints that might be useful

    // Get specific quiz attempt with results
    async getQuizAttemptWithResults(req: Request, res: Response, next: NextFunction) {
        try {
            const { attemptId } = req.params;

            if (!attemptId || Array.isArray(attemptId)) {
                return res.status(400).json({ message: "Valid Attempt ID is required" });
            }

            const result = await QuizAttemptService.getQuizAttemptWithResults(attemptId);

            if ('error' in result) {
                return res.status(404).json({ message: result.error });
            }

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // Get quiz attempt by ID (basic info)
    async getQuizAttemptById(req: Request, res: Response, next: NextFunction) {
        try {
            const { attemptId } = req.params;

            if (!attemptId || Array.isArray(attemptId)) {
                return res.status(400).json({ message: "Valid Attempt ID is required" });
            }

            const result = await QuizAttemptService.getQuizAttemptById(attemptId);

            if ('error' in result) {
                return res.status(404).json({ message: result.error });
            }

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // Get all quiz attempts for a user (with scores)
    async getQuizAttemptsByUserId(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;

            // Use authenticated user's ID from verification middleware instead of param
            const userId = (req as any).user?.id;

            if (!userId) {
                return res.status(401).json({ message: "User authentication required" });
            }

            const result = await QuizAttemptService.getQuizAttemptsByUserIdWithScores(userId, page);

            if ('error' in result) {
                return res.status(400).json({ message: result.error });
            }

            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // Delete quiz attempt (admin/teacher only)
    async deleteQuizAttempt(req: Request, res: Response, next: NextFunction) {
        try {
            const { attemptId } = req.params;

            if (!attemptId || Array.isArray(attemptId)) {
                return res.status(400).json({ message: "Valid Attempt ID is required" });
            }

            const result = await QuizAttemptService.deleteQuizAttempt(attemptId);

            if (result && 'error' in result) {
                return res.status(404).json({ message: result.error });
            }

            return res.status(200).json({ message: "Quiz attempt deleted successfully" });
        } catch (error) {
            next(error);
        }
    }
}

export default new QuizAttemptController();