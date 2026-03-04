import QuestionRepo from "../repository/QuestionRepo.ts";
import QuizRepo from "../repository/QuizRepo.ts";
import type { CreateQuestionDTO, UpdateQuestionDTO } from "../dto/QuestionDTO.ts";
class QuestionService {
    async getQuestionById(id: string) {
        return await QuestionRepo.getQuestionById(id);
    }

    async getAllQuestions(page: number = 1) {
        return await QuestionRepo.getAllQuestions(page);
    }

    async getQuestionsByQuizId(quizId: string) {
        return await QuestionRepo.getQuestionsByQuizId(quizId);
    }

    async createQuestion(questionData: CreateQuestionDTO) {
        const quiz = await QuizRepo.getQuizById(questionData.quiz_id);
        if (!quiz) {
            return { error: "Quiz not found" };
        }
        return await QuestionRepo.createQuestion(questionData);
    }

    async updateQuestion(id: string, updateData: UpdateQuestionDTO) {
        const question = await QuestionRepo.getQuestionById(id);
        if (!question) {
            return { error: "Question not found" };
        }
        return await QuestionRepo.updateQuestion(id, updateData);
    }

    async deleteQuestion(id: string) {
        const question = await QuestionRepo.getQuestionById(id);
        if (!question) {
            return { error: "Question not found" };
        }
        return await QuestionRepo.deleteQuestion(id);
    }
}

export default new QuestionService();
