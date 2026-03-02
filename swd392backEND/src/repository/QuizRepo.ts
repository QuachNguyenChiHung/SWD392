import { Quiz } from "../entities/Quiz.ts";
import { Question } from "../entities/Question.ts";
import { QuizAttempt } from "../entities/QuizAttempt.ts";
import type { CreateQuizDTO } from "../dto/QuizDTO";

class QuizRepo {
    async getQuizById(id: string) {
        return await Quiz.findById(id);
    }
    async getAllQuizzes(page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await Quiz.find()
            .sort({ available_date: -1 })
            .skip(skip)
            .limit(limit);
    }
    async createQuiz(quizData: CreateQuizDTO) {
        const newQuiz = new Quiz(quizData);
        return await newQuiz.save();
    }
    async updateQuiz(id: string, updateData: any) {
        return await Quiz.findByIdAndUpdate(id, updateData, { new: true });
    }
    async deleteQuiz(id: string) {
        return await Quiz.findByIdAndDelete(id);
    }
    async toggleQuizStatus(id: string) {
        const quiz = await Quiz.findById(id);
        if (quiz) {
            quiz.status = !quiz.status;
            return await quiz.save();
        }
        return null;
    }
    async getQuestionsByQuizId(quizId: string) {
        return await Question.find({ quiz_id: quizId }).sort({ _id: 1 });
    }
    async createQuestion(questionData: any) {
        const newQuestion = new Question(questionData);
        return await newQuestion.save();
    }
    async updateQuestion(id: string, updateData: any) {
        return await Question.findByIdAndUpdate(id, updateData, { new: true });
    }
    async deleteQuestion(id: string) {
        return await Question.findByIdAndDelete(id);
    }
    async deleteQuestionsByQuizId(quizId: string) {
        return await Question.deleteMany({ quiz_id: quizId });
    }
    async getQuizAttemptsByQuizId(quizId: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await QuizAttempt.find({ quiz_id: quizId })
            .populate('user_id', 'username email')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);
    }
    async getQuizAttemptsByUserId(userId: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await QuizAttempt.find({ user_id: userId })
            .populate('quiz_id', 'title type')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);
    }
    async createQuizAttempt(attemptData: any) {
        const newAttempt = new QuizAttempt(attemptData);
        return await newAttempt.save();
    }
    async getQuizAttemptCount(quizId: string, userId: string) {
        return await QuizAttempt.countDocuments({ quiz_id: quizId, user_id: userId });
    }
    async getLatestQuizAttempt(quizId: string, userId: string) {
        return await QuizAttempt.findOne({ quiz_id: quizId, user_id: userId })
            .sort({ attempt_number: -1 })
            .limit(1);
    }
}
export default new QuizRepo;