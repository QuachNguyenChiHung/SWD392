import { apiService } from '../../api';
import type { Quiz, Question } from '../../../types/teacherType';

export interface CreateQuizDTO {
    title: string;
    type: string;
    available_date?: string | Date;
    max_attempt_number?: number;
    end_date?: string | Date;
    status?: boolean;
}

export interface UpdateQuizDTO {
    title?: string;
    type?: string;
    available_date?: string | Date;
    max_attempt_number?: number;
    end_date?: string | Date;
    status?: boolean;
}

export interface CreateQuizAttemptDTO {
    quiz_id: string;
    record_json?: any;
}

export interface QuizAttempt {
    _id: string;
    quiz_id: string;
    user_id: string;
    attempt_number: number;
    date: Date;
    record_json?: any;
}

class QuizApiService {
    // Get all quizzes
    async getAllQuizzes(): Promise<Quiz[]> {
        const response = await apiService.get('/quizzes');
        return response.data || response;
    }

    // Get quiz by ID
    async getQuizById(quizId: string): Promise<Quiz> {
        const response = await apiService.get(`/quizzes/${quizId}`);
        return response.data || response;
    }

    // Create new quiz with proper validation
    async createQuiz(quizData: CreateQuizDTO): Promise<Quiz> {
        const response = await apiService.post('/quizzes', quizData);
        return response.data || response;
    }

    // Update quiz
    async updateQuiz(quizId: string, updateData: UpdateQuizDTO): Promise<Quiz> {
        const response = await apiService.put(`/quizzes/${quizId}`, updateData);
        return response.data || response;
    }

    // Delete quiz
    async deleteQuiz(quizId: string): Promise<void> {
        await apiService.delete(`/quizzes/${quizId}`);
    }

    // Toggle quiz status
    async toggleQuizStatus(quizId: string): Promise<Quiz> {
        const response = await apiService.patch(`/quizzes/${quizId}/toggle-status`, {});
        return response.data || response;
    }

    // Quiz Attempts
    async getQuizAttemptsByQuizId(quizId: string): Promise<QuizAttempt[]> {
        const response = await apiService.get(`/quizzes/${quizId}/attempts`);
        return response.data || response;
    }

    async getQuizAttemptsByUserId(userId: string): Promise<QuizAttempt[]> {
        const response = await apiService.get(`/users/${userId}/quiz-attempts`);
        return response.data || response;
    }

    async createQuizAttempt(quizId: string, userId: string, attemptData: Omit<CreateQuizAttemptDTO, 'quiz_id'>): Promise<QuizAttempt> {
        const response = await apiService.post(`/quizzes/${quizId}/attempts/${userId}`, attemptData);
        return response.data || response;
    }

    // Questions related to quizzes
    async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
        const response = await apiService.get(`/quizzes/${quizId}/questions`);
        return response.data || response;
    }
}

export const quizApiService = new QuizApiService();