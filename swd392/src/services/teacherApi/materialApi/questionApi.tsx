import { apiService } from '../../api';
import type { Question } from '../../../types/teacherType';

// Backend DTO (matches backend exactly)
export interface CreateQuestionDTO {
    quiz_id: string;
    options: any[];
    correct_index: number;
    type?: 'multiple_choice' | 'true_false';
}

export interface UpdateQuestionDTO {
    options?: any[];
    correct_index?: number;
    type?: 'multiple_choice' | 'true_false';
}

// Frontend question data interface for conversion
export interface FrontendQuestionData {
    content: string;
    type: "multiple-choice" | "true-false" | "short-answer";
    options?: string[];
    correctAnswer: string | string[];
    has2DVisualization?: boolean;
}

class QuestionApiService {
    // Convert frontend question format to backend DTO format
    private convertToBackendFormat(frontendData: FrontendQuestionData, quizId: string): CreateQuestionDTO {
        // Convert type from frontend format to backend format
        let backendType: 'multiple_choice' | 'true_false';
        if (frontendData.type === 'multiple-choice') {
            backendType = 'multiple_choice';
        } else if (frontendData.type === 'true-false') {
            backendType = 'true_false';
        } else {
            // Default to multiple_choice for unsupported types like 'short-answer'
            backendType = 'multiple_choice';
        }

        // Build options array - include question content as first element if needed
        let options = frontendData.options || [];

        // If we have content but no options, create options with the content
        if (frontendData.content && options.length === 0) {
            if (backendType === 'true_false') {
                options = [frontendData.content, 'True', 'False'];
            } else {
                options = [frontendData.content, 'Option A', 'Option B'];
            }
        } else if (frontendData.content && !options.includes(frontendData.content)) {
            // Prepend content to options if it's not already included
            options = [frontendData.content, ...options];
        }

        if (options.length < 2) {
            throw new Error('Questions must have at least 2 options');
        }

        // Find correct index - adjust for content being prepended
        let correctIndex = 0;
        if (typeof frontendData.correctAnswer === 'string') {
            correctIndex = options.indexOf(frontendData.correctAnswer);
            if (correctIndex === -1) {
                // If exact match not found, default to 1 (first actual option, not content)
                correctIndex = frontendData.content ? 1 : 0;
            }
        } else if (Array.isArray(frontendData.correctAnswer) && frontendData.correctAnswer.length > 0) {
            // For multiple correct answers, take the first one
            correctIndex = options.indexOf(frontendData.correctAnswer[0]);
            if (correctIndex === -1) {
                correctIndex = frontendData.content ? 1 : 0;
            }
        }

        return {
            quiz_id: quizId,
            options: options,
            correct_index: correctIndex,
            type: backendType
        };
    }

    // Convert backend question format to frontend Question format
    private convertToFrontendFormat(backendData: any): Question {
        // Backend stores: options = [questionContent, ...actualOptions]
        // correct_index is the index in that full array
        const options: string[] = backendData.options || [];
        const content = options.length > 0 ? options[0] : '';
        const frontendOptions = options.length > 1 ? options.slice(1) : [];

        // Map backend type to frontend type
        let frontendType: Question['type'] = 'multiple-choice';
        if (backendData.type === 'true_false') {
            frontendType = 'true-false';
        } else if (backendData.type === 'multiple_choice') {
            frontendType = 'multiple-choice';
        }

        // Resolve correct answer from correct_index
        const correctAnswer = backendData.correct_index != null && backendData.correct_index < options.length
            ? options[backendData.correct_index]
            : '';

        return {
            _id: backendData._id,
            content,
            type: frontendType,
            options: frontendOptions,
            correctAnswer,
            has2DVisualization: backendData.has2DVisualization || false,
        };
    }

    // Get all questions (admin only)
    async getAllQuestions(): Promise<Question[]> {
        const response = await apiService.get('/questions');
        const data = response.data || response;
        return Array.isArray(data) ? data.map(q => this.convertToFrontendFormat(q)) : data;
    }

    // Get question by ID
    async getQuestionById(questionId: string): Promise<Question> {
        const response = await apiService.get(`/questions/${questionId}`);
        const data = response.data || response;
        return this.convertToFrontendFormat(data);
    }

    // Get questions by quiz ID
    async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
        const response = await apiService.get(`/quizzes/${quizId}/questions`);
        const data = response.data || response;
        return Array.isArray(data) ? data.map(q => this.convertToFrontendFormat(q)) : data;
    }

    // Create new question using frontend question data format
    async createQuestion(questionData: FrontendQuestionData, quizId: string): Promise<Question> {
        try {
            const backendData = this.convertToBackendFormat(questionData, quizId);
            console.log('Converted question data for backend:', backendData);
            const response = await apiService.post('/questions', backendData);
            return response.data || response;
        } catch (error) {
            console.error('Error converting question data:', error);
            throw error;
        }
    }

    // Update question
    async updateQuestion(questionId: string, updateData: UpdateQuestionDTO): Promise<Question> {
        const response = await apiService.put(`/questions/${questionId}`, updateData);
        return response.data || response;
    }

    // Delete question
    async deleteQuestion(questionId: string): Promise<void> {
        await apiService.delete(`/questions/${questionId}`);
    }

    // Helper methods for question management
    async addQuestionToQuiz(quizId: string, questionData: FrontendQuestionData): Promise<Question> {
        return this.createQuestion(questionData, quizId);
    }

    async removeQuestionFromQuiz(questionId: string): Promise<void> {
        return this.deleteQuestion(questionId);
    }

    async updateQuestionContent(questionId: string, content: string): Promise<Question> {
        // Since backend doesn't support content field directly,
        // we need to update the first option to be the content
        const question = await this.getQuestionById(questionId);
        const newOptions = [content, ...(question.options?.slice(1) || [])];
        return this.updateQuestion(questionId, { options: newOptions });
    }

    async updateQuestionOptions(questionId: string, options: string[], correctAnswer: string | string[]): Promise<Question> {
        let correct_index = 0;
        if (typeof correctAnswer === 'string') {
            correct_index = options.indexOf(correctAnswer);
        } else if (Array.isArray(correctAnswer) && correctAnswer.length > 0) {
            correct_index = options.indexOf(correctAnswer[0]);
        }
        return this.updateQuestion(questionId, { options, correct_index });
    }
}

export const questionApiService = new QuestionApiService();