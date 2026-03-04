import QuizRepo from "../repository/QuizRepo.ts";
import QuestionRepo from "../repository/QuestionRepo.ts";
import type { CreateQuizDTO, UpdateQuizDTO, CreateQuizAttemptDTO } from "../dto/QuizDTO.ts";

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

    async deleteQuiz(id: string) {
        const quiz = await QuizRepo.getQuizById(id);
        if (!quiz) {
            return { error: "Quiz not found" };
        }
        // Delete all questions for this quiz
        await QuestionRepo.deleteQuestionsByQuizId(id);
        return await QuizRepo.deleteQuiz(id);
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