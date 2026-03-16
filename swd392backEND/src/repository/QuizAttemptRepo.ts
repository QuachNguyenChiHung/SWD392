import { QuizAttempt } from "../entities/QuizAttempt.ts";
import type { CreateQuizAttemptDTO } from "../dto/QuizDTO.ts";

class QuizAttemptRepo {
    async getQuizAttemptById(id: string) {
        return await QuizAttempt.findById(id)
            .populate('quiz_id', 'title type')
            .populate('user_id', 'username email');
    }

    async getAllQuizAttempts(page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await QuizAttempt.find()
            .populate('quiz_id', 'title type')
            .populate('user_id', 'username email')
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);
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

    async createQuizAttempt(attemptData: CreateQuizAttemptDTO) {
        const newAttempt = new QuizAttempt(attemptData);
        return await newAttempt.save();
    }

    async updateQuizAttempt(id: string, updateData: Partial<CreateQuizAttemptDTO>) {
        return await QuizAttempt.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteQuizAttempt(id: string) {
        return await QuizAttempt.findByIdAndDelete(id);
    }

    async getQuizAttemptCount(quizId: string, userId: string) {
        return await QuizAttempt.countDocuments({ quiz_id: quizId, user_id: userId });
    }

    async getLatestQuizAttempt(quizId: string, userId: string) {
        return await QuizAttempt.findOne({ quiz_id: quizId, user_id: userId })
            .sort({ attempt_number: -1 })
            .limit(1);
    }

    async getAllQuizAttemptsByQuizAndUser(quizId: string, userId: string) {
        return await QuizAttempt.find({ quiz_id: quizId, user_id: userId })
            .sort({ attempt_number: 1 });
    }

    async deleteQuizAttemptsByQuizId(quizId: string) {
        return await QuizAttempt.deleteMany({ quiz_id: quizId });
    }

    async getQuizAttemptWithDetails(id: string) {
        return await QuizAttempt.findById(id)
            .populate({
                path: 'quiz_id',
                select: 'title type max_attempt_number'
            })
            .populate({
                path: 'user_id',
                select: 'username email'
            });
    }
}

export default new QuizAttemptRepo;