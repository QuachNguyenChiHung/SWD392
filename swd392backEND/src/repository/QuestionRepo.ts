import { Question } from "../entities/Question.ts";
import type { CreateQuestionDTO, UpdateQuestionDTO } from "../dto/QuestionDTO.ts";

class QuestionRepo {
    async getQuestionById(id: string) {
        return await Question.findById(id);
    }

    async getAllQuestions(page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await Question.find()
            .populate('quiz_id', 'title type')
            .sort({ _id: 1 })
            .skip(skip)
            .limit(limit);
    }

    async getQuestionsByQuizId(quizId: string) {
        return await Question.find({ quiz_id: quizId }).sort({ _id: 1 });
    }

    async createQuestion(questionData: CreateQuestionDTO) {
        const newQuestion = new Question(questionData);
        return await newQuestion.save();
    }

    async updateQuestion(id: string, updateData: UpdateQuestionDTO) {
        return await Question.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteQuestion(id: string) {
        return await Question.findByIdAndDelete(id);
    }

    async deleteQuestionsByQuizId(quizId: string) {
        return await Question.deleteMany({ quiz_id: quizId });
    }
}

export default new QuestionRepo();
