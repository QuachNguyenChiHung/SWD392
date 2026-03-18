import { apiService } from '../../api';
import type { Question } from '../../../types/teacherType';

// Backend DTO (matches backend exactly)
export interface CreateQuestionDTO {
    quiz_id: string;
    title: string;
    options: any[];
    correct_index: number;
    type?: 'multiple_choice' | 'true_false';
}

export interface UpdateQuestionDTO {
    title?: string;
    options?: any[];
    correct_index?: number;
    type?: 'multiple_choice' | 'true_false';
}

class QuestionApiService {
    // Get all questions (admin only)
    async getAllQuestions(): Promise<Question[]> {
        const response = await apiService.get('/questions');
        const data = response.data || response;
        return Array.isArray(data) ? data : [];
    }

    // Get question by ID
    async getQuestionById(questionId: string): Promise<Question> {
        const response = await apiService.get(`/questions/${questionId}`);
        const data = response.data || response;
        return data;
    }

    // Get questions by quiz ID
    async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
        const response = await apiService.get(`/quizzes/${quizId}/questions`);
        const data = response.data || response;
        return Array.isArray(data) ? data : [];
    }

    // Create new question using backend DTO format directly
    async createQuestion(questionData: CreateQuestionDTO): Promise<Question> {
        const response = await apiService.post('/questions', questionData);
        const data = response.data || response;
        return data;
    }

    // Update question with raw backend DTO
    async updateQuestion(questionId: string, updateData: UpdateQuestionDTO): Promise<Question> {
        const response = await apiService.put(`/questions/${questionId}`, updateData);
        const data = response.data || response;
        return data;
    }

    // Delete question
    async deleteQuestion(questionId: string): Promise<void> {
        await apiService.delete(`/questions/${questionId}`);
    }

    // Helper methods
    async addQuestionToQuiz(quizId: string, questionData: Omit<CreateQuestionDTO, 'quiz_id'>): Promise<Question> {
        return this.createQuestion({ ...questionData, quiz_id: quizId });
    }

    async removeQuestionFromQuiz(questionId: string): Promise<void> {
        return this.deleteQuestion(questionId);
    }
}

export const questionApiService = new QuestionApiService();