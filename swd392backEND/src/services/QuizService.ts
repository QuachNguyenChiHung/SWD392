import mongoose from "mongoose";
import QuizRepo from "../repository/QuizRepo.ts";
import QuestionRepo from "../repository/QuestionRepo.ts";
import ClassRepo from "../repository/ClassRepo.ts";
import type { CreateQuizDTO, UpdateQuizDTO, CreateQuizAttemptDTO } from "../dto/QuizDTO.ts";
import TopicService from "./TopicService.ts";

class QuizService {
    async getQuizById(id: string) {
        return await QuizRepo.getQuizById(id);
    }

    async getAllQuizzes(page: number = 1) {
        return await QuizRepo.getAllQuizzes(page);
    }

    async createQuiz(quizData: CreateQuizDTO) {
        return await QuizRepo.createQuiz(quizData);
    }

    async updateQuiz(id: string, updateData: UpdateQuizDTO) {
        const quiz = await QuizRepo.getQuizById(id);
        if (!quiz) {
            return { error: "Quiz not found" };
        }
        return await QuizRepo.updateQuiz(id, updateData);
    }


    async deleteQuiz(id: string, user: { id: string; role: string }) {
        const quiz = await QuizRepo.getQuizById(id);
        if (!quiz) {
            return null;
        }

        // Permission check: teachers can only delete quizzes from their classes
        if (user.role === 'teacher') {
            // Get all class IDs associated with this quiz
            const classIds = await QuizRepo.getClassIdsByQuizId(id);

            if (classIds.length === 0) {
                // Quiz not assigned to any class - orphaned quiz, allow deletion
            } else {
                // Check if teacher owns at least one of the classes
                const teacherOwnsClass = await Promise.all(
                    classIds.map(async (classId) => {
                        const classDoc = await ClassRepo.getClassById(classId.toString());
                        return classDoc && classDoc.teacher_id.toString() === user.id;
                    })
                );

                if (!teacherOwnsClass.some(owns => owns)) {
                    throw new Error("Permission denied: You can only delete quizzes from your own classes");
                }
            }
        }
        // Admin can delete any quiz - no permission check needed

        // Use transaction for atomic cascade deletion
        const session = await mongoose.startSession();
        let result;

        try {
            await session.withTransaction(async () => {
                result = await QuizRepo.deleteQuizCascade(id, session);
            });
        } finally {
            await session.endSession();
        }

        return result;
    }

    async toggleQuizStatus(id: string) {
        const quiz = await QuizRepo.getQuizById(id);
        if (!quiz) {
            return { error: "Quiz not found" };
        }
        return await QuizRepo.toggleQuizStatus(id);
    }

    async getQuizAttemptsByQuizId(quizId: string, page: number = 1) {
        const quiz = await QuizRepo.getQuizById(quizId);
        if (!quiz) {
            return { error: "Quiz not found" };

        }
        return await QuizRepo.getQuizAttemptsByQuizId(quizId, page);
    }
    async createQuizWithAI(topicId: string) {
        const topic = await TopicService.getTopicById(topicId);
        if (!topic) {
            return { error: "Topic not found" };
        }
        // const createQuizSchema = z.object({
        //     title: z.string().max(255),
        //     type: z.string().max(50),
        //     available_date: z.coerce.date().optional(),
        //     max_attempt_number: z.number().int().min(1).optional(),
        //     end_date: z.coerce.date().optional(),
        //     status: z.boolean().optional(),
        // });
        const title = topic.title;
        const desc = topic.description;
        let prompt = '';

    }
    async getQuizAttemptsByUserId(userId: string, page: number = 1) {
        return await QuizRepo.getQuizAttemptsByUserId(userId, page);
    }

    async createQuizAttempt(attemptData: CreateQuizAttemptDTO, studentUserId: string) {
        const quiz = await QuizRepo.getQuizById(attemptData.quiz_id);
        if (!quiz) {
            return { error: "Quiz not found" };
        }

        // Check if quiz is available
        if (!quiz.status) {
            return { error: "Quiz is not available" };
        }

        if (quiz.available_date && new Date() < quiz.available_date) {
            return { error: "Quiz is not yet available" };
        }

        if (quiz.end_date && new Date() > quiz.end_date) {
            return { error: "Quiz has ended" };
        }

        // Check attempt limits
        if (quiz.max_attempt_number) {
            const attemptCount = await QuizRepo.getQuizAttemptCount(attemptData.quiz_id, studentUserId);
            if (attemptCount >= quiz.max_attempt_number) {
                return { error: "Maximum attempts reached" };
            }
        }

        // Set attempt number
        const latestAttempt = await QuizRepo.getLatestQuizAttempt(attemptData.quiz_id, studentUserId);
        attemptData.attempt_number = latestAttempt ? latestAttempt.attempt_number + 1 : 1;
        attemptData.user_id = studentUserId;

        return await QuizRepo.createQuizAttempt(attemptData);
    }
}

export default new QuizService();