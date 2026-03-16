import { apiService } from "../../api";
import type { Question } from "../../../types/teacherType";

// Backend DTO (matches backend exactly)
export interface CreateQuestionDTO {
  quiz_id: string;
  title: string;
  options: any[];
  correct_index: number;
  type?: "multiple_choice" | "true_false";
}

export interface UpdateQuestionDTO {
  title?: string;
  options?: any[];
  correct_index?: number;
  type?: "multiple_choice" | "true_false";
}

// Frontend question data interface for conversion
export interface FrontendQuestionData {
  content: string;
  type: "multiple-choice" | "true-false";
  options?: string[];
  correctAnswer: string | string[];
  has2DVisualization?: boolean;
}

class QuestionApiService {
  // Convert frontend question format to backend DTO format
  private convertToBackendFormat(
    frontendData: FrontendQuestionData,
    quizId: string,
  ): CreateQuestionDTO {
    const backendType: "multiple_choice" | "true_false" =
      frontendData.type === "true-false" ? "true_false" : "multiple_choice";

    const options = frontendData.options || [];
    if (options.length < 2) {
      throw new Error("Questions must have at least 2 options");
    }

    // Find correct index from the options array
    let correctIndex = 0;
    if (typeof frontendData.correctAnswer === "string") {
      correctIndex = options.indexOf(frontendData.correctAnswer);
      if (correctIndex === -1) correctIndex = 0;
    } else if (
      Array.isArray(frontendData.correctAnswer) &&
      frontendData.correctAnswer.length > 0
    ) {
      correctIndex = options.indexOf(frontendData.correctAnswer[0]);
      if (correctIndex === -1) correctIndex = 0;
    }

    return {
      quiz_id: quizId,
      title: frontendData.content,
      options,
      correct_index: correctIndex,
      type: backendType,
    };
  }

  // Convert backend question format to frontend Question format
  private convertToFrontendFormat(backendData: any): Question {
    let frontendType: Question["type"] = "multiple-choice";
    if (backendData.type === "true_false") {
      frontendType = "true-false";
    }

    const options: string[] = backendData.options || [];
    const correctAnswer =
      backendData.correct_index != null &&
      backendData.correct_index < options.length
        ? options[backendData.correct_index]
        : "";

    return {
      _id: backendData._id,
      content: backendData.title || "",
      type: frontendType,
      options,
      correctAnswer,
      has2DVisualization: backendData.has2DVisualization || false,
    };
  }

  // Get all questions (admin only)
  async getAllQuestions(): Promise<Question[]> {
    const data = await apiService.get("/questions");
    return Array.isArray(data)
      ? data.map((q) => this.convertToFrontendFormat(q))
      : data;
  }

  // Get question by ID
  async getQuestionById(questionId: string): Promise<Question> {
    const data = await apiService.get(`/questions/${questionId}`);
    return this.convertToFrontendFormat(data);
  }

  // Get questions by quiz ID
  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    const data = await apiService.get(`/quizzes/${quizId}/questions`);
    return Array.isArray(data)
      ? data.map((q) => this.convertToFrontendFormat(q))
      : data;
  }

  // Create new question using frontend question data format
  async createQuestion(
    questionData: FrontendQuestionData,
    quizId: string,
  ): Promise<Question> {
    const backendData = this.convertToBackendFormat(questionData, quizId);
    const data = await apiService.post("/questions", backendData);
    return this.convertToFrontendFormat(data);
  }

  // Convert frontend Question format to backend UpdateQuestionDTO
  private convertToBackendUpdateFormat(
    frontendData: FrontendQuestionData,
  ): UpdateQuestionDTO {
    const backendType: "multiple_choice" | "true_false" =
      frontendData.type === "true-false" ? "true_false" : "multiple_choice";

    const options = frontendData.options || [];

    let correctIndex = 0;
    if (typeof frontendData.correctAnswer === "string") {
      correctIndex = options.indexOf(frontendData.correctAnswer);
      if (correctIndex === -1) correctIndex = 0;
    } else if (
      Array.isArray(frontendData.correctAnswer) &&
      frontendData.correctAnswer.length > 0
    ) {
      correctIndex = options.indexOf(frontendData.correctAnswer[0]);
      if (correctIndex === -1) correctIndex = 0;
    }

    return {
      title: frontendData.content,
      options,
      correct_index: correctIndex,
      type: backendType,
    };
  }

  // Update question with raw backend DTO
  async updateQuestion(
    questionId: string,
    updateData: UpdateQuestionDTO,
  ): Promise<Question> {
    const data = await apiService.put(`/questions/${questionId}`, updateData);
    return data;
  }

  // Update question using frontend Question format
  async updateQuestionFromFrontend(
    questionId: string,
    frontendData: FrontendQuestionData,
  ): Promise<Question> {
    const backendData = this.convertToBackendUpdateFormat(frontendData);
    const data = await apiService.put(`/questions/${questionId}`, backendData);
    return this.convertToFrontendFormat(data);
  }

  // Delete question
  async deleteQuestion(questionId: string): Promise<void> {
    await apiService.delete(`/questions/${questionId}`);
  }

  // Helper methods
  async addQuestionToQuiz(
    quizId: string,
    questionData: FrontendQuestionData,
  ): Promise<Question> {
    return this.createQuestion(questionData, quizId);
  }

  async removeQuestionFromQuiz(questionId: string): Promise<void> {
    return this.deleteQuestion(questionId);
  }
}

export const questionApiService = new QuestionApiService();
