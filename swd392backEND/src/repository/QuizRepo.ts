import mongoose from "mongoose";
import { Quiz } from "../entities/Quiz.ts";
import { QuizAttempt } from "../entities/QuizAttempt.ts";
import { Question } from "../entities/Question.ts";
import { ClassMaterial } from "../entities/ClassMaterial.ts";
import { ProgressClassMaterial } from "../entities/ProgressClassMaterial.ts";
import type { CreateQuizAttemptDTO, CreateQuizDTO, UpdateQuizDTO } from "../dto/QuizDTO.ts";

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
    async updateQuiz(id: string, updateData: UpdateQuizDTO) {
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
    async getQuizAttemptCount(quizId: string, userId: string) {
        return await QuizAttempt.countDocuments({ quiz_id: quizId, user_id: userId });
    }
    async getLatestQuizAttempt(quizId: string, userId: string) {
        return await QuizAttempt.findOne({ quiz_id: quizId, user_id: userId })
            .sort({ attempt_number: -1 })
            .limit(1);
    }


    async deleteQuizCascade(quizId: string, session?: mongoose.ClientSession) {
        const quiz = await Quiz.findById(quizId).session(session || null);
        if (!quiz) {
            return null;
        }

        // Find all ClassMaterials that reference this quiz
        const classMaterials = await ClassMaterial.find({
            type: 'quiz',
            content_id: quizId
        }).session(session || null);

        const classMaterialIds = classMaterials.map(cm => cm._id);

        // Perform cascade deletion
        const sessionOpt = session ? { session } : {};
        const [questionsResult, attemptsResult, progressResult, materialsResult] = await Promise.all([
            Question.deleteMany({ quiz_id: quizId }, sessionOpt),
            QuizAttempt.deleteMany({ quiz_id: quizId }, sessionOpt),
            classMaterialIds.length > 0
                ? ProgressClassMaterial.deleteMany({ classmaterial_id: { $in: classMaterialIds } }, sessionOpt)
                : Promise.resolve({ deletedCount: 0 }),
            ClassMaterial.deleteMany({ type: 'quiz', content_id: quizId }, sessionOpt)
        ]);

        await Quiz.findByIdAndDelete(quizId, sessionOpt);

        return {
            quiz: 1,
            questions: questionsResult.deletedCount || 0,
            quizAttempts: attemptsResult.deletedCount || 0,
            classMaterials: materialsResult.deletedCount || 0,
            progressClassMaterials: progressResult.deletedCount || 0
        };
    }


    async getClassIdsByQuizId(quizId: string) {
        const classMaterials = await ClassMaterial.find({
            type: 'quiz',
            content_id: quizId
        }).select('class_assign_id');

        return classMaterials.map(cm => cm.class_assign_id);
    }
}
export default new QuizRepo;