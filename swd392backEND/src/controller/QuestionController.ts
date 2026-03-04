import type { NextFunction, Request, Response } from "express";
import QuestionService from "../services/QuestionService.ts";
import { createQuestionSchema, updateQuestionSchema } from "../dto/QuestionDTO.ts";

class QuestionController {
    async getAllQuestions(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const questions = await QuestionService.getAllQuestions(page);
            return res.status(200).json(questions);
        } catch (error) {
            next(error);
        }
    }

    async getQuestionById(req: Request, res: Response, next: NextFunction) {
        try {
            const question = await QuestionService.getQuestionById(req.params.id as string);
            if (!question) {
                return res.status(404).json({ message: "Question not found" });
            }
            return res.status(200).json(question);
        } catch (error) {
            next(error);
        }
    }

    async getQuestionsByQuizId(req: Request, res: Response, next: NextFunction) {
        try {
            const questions = await QuestionService.getQuestionsByQuizId(req.params.quizId as string);
            return res.status(200).json(questions);
        } catch (error) {
            next(error);
        }
    }

    async createQuestion(req: Request, res: Response, next: NextFunction) {
        try {
            const questionData = createQuestionSchema.parse(req.body);
            const result = await QuestionService.createQuestion(questionData);
            if ((result as any)?.error) {
                return res.status(404).json({ message: (result as any).error });
            }
            return res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    async updateQuestion(req: Request, res: Response, next: NextFunction) {
        try {
            const updateData = updateQuestionSchema.parse(req.body);
            const result = await QuestionService.updateQuestion(req.params.id as string, updateData);
            if ((result as any)?.error) {
                return res.status(404).json({ message: (result as any).error });
            }
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    async deleteQuestion(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await QuestionService.deleteQuestion(req.params.id as string);
            if ((result as any)?.error) {
                return res.status(404).json({ message: (result as any).error });
            }
            return res.status(200).json({ message: "Question deleted successfully" });
        } catch (error) {
            next(error);
        }
    }
}

export default new QuestionController();