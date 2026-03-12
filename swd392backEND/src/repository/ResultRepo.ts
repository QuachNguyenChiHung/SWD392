import { Result } from "../entities/Result.ts";
import type { CreateResultDTO, UpdateResultDTO } from "../dto/ResultDTO.ts";

class ResultRepo {
    async getResultById(id: string) {
        return await Result.findById(id);
    }

    async getResultsByQuizAttemptId(quizAttemptId: string) {
        return await Result.find({ quiz_attempt_id: quizAttemptId });
    }

    async getAllResults(page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await Result.find()
            .populate('quiz_attempt_id', 'attempt_number date')
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);
    }

    async createResult(resultData: CreateResultDTO) {
        const newResult = new Result(resultData);
        return await newResult.save();
    }

    async updateResult(id: string, updateData: UpdateResultDTO) {
        return await Result.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteResult(id: string) {
        return await Result.findByIdAndDelete(id);
    }

    async deleteResultsByQuizAttemptId(quizAttemptId: string) {
        return await Result.deleteMany({ quiz_attempt_id: quizAttemptId });
    }

    async getResultsCount(quizAttemptId: string) {
        return await Result.countDocuments({ quiz_attempt_id: quizAttemptId });
    }

    async getCorrectResultsCount(quizAttemptId: string) {
        return await Result.countDocuments({ 
            quiz_attempt_id: quizAttemptId, 
            isCorrect: true 
        });
    }

    async createMultipleResults(resultsData: CreateResultDTO[]) {
        return await Result.insertMany(resultsData);
    }
}

export default new ResultRepo;