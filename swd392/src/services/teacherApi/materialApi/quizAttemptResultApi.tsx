import { apiService } from '../../api';

export interface Score {
    total: number;
    correct: number;
    score: number;
    percentage: number;
}

export interface Result {
    _id: string;
    quiz_attempt_id: string;
    text?: string;
    options?: any;
    options_picked_index?: number;
    isCorrect: boolean;
}

export interface QuizAttemptWithResults {
    attempt: {
        _id: string;
        quiz_id: any;
        user_id: any;
        attempt_number: number;
        date: string;
        record_json?: any;
    };
    results: Result[];
    score: Score | null;
}

class QuizAttemptResultApiService {
    // Get all quiz attempts with results for a specific quiz (Teacher)
    async getQuizAttemptsWithResultsByQuizId(quizId: string, page: number = 1): Promise<QuizAttemptWithResults[]> {
        const response = await apiService.get(`/quizzes/${quizId}/attempts/with-results?page=${page}`);
        return response.data || response;
    }
}

export const quizAttemptResultApiService = new QuizAttemptResultApiService();
