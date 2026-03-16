import { apiService } from "../../api";
import type { Quiz, Question } from "../../../types/teacherType";

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
    const data = await apiService.get("/quizzes");
    return data;
  }

  // Get quiz by ID
  async getQuizById(quizId: string): Promise<Quiz> {
    const data = await apiService.get(`/quizzes/${quizId}`);
    return data;
  }

  // Create new quiz with proper validation
  async createQuiz(quizData: CreateQuizDTO): Promise<Quiz> {
    const data = await apiService.post("/quizzes", quizData);
    return data;
  }

  // Update quiz
  async updateQuiz(quizId: string, updateData: UpdateQuizDTO): Promise<Quiz> {
    const data = await apiService.put(`/quizzes/${quizId}`, updateData);
    return data;
  }

  // Delete quiz
  async deleteQuiz(quizId: string): Promise<void> {
    await apiService.delete(`/quizzes/${quizId}`);
  }

  // Toggle quiz status
  async toggleQuizStatus(quizId: string): Promise<Quiz> {
    const data = await apiService.patch(`/quizzes/${quizId}/toggle-status`, {});
    return data;
  }

  // Quiz Attempts
  async getQuizAttemptsByQuizId(quizId: string): Promise<QuizAttempt[]> {
    const data = await apiService.get(`/quizzes/${quizId}/attempts`);
    return data;
  }

  async getQuizAttemptsByUserId(userId: string): Promise<QuizAttempt[]> {
    const data = await apiService.get(`/users/${userId}/quiz-attempts`);
    return data;
  }

  async createQuizAttempt(
    quizId: string,
    userId: string,
    attemptData: Omit<CreateQuizAttemptDTO, "quiz_id">,
  ): Promise<QuizAttempt> {
    const data = await apiService.post(
      `/quizzes/${quizId}/attempts/${userId}`,
      attemptData,
    );
    return data;
  }

  // Questions related to quizzes
  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    const data = await apiService.get(`/quizzes/${quizId}/questions`);
    return data;
  }
}

export const quizApiService = new QuizApiService();
