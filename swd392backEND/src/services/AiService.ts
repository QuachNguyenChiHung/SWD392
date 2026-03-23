import AiRepo from "../repository/AiRepo.ts";
import type { Types } from "mongoose";

class AiService {
    async createRequest(userId: string | Types.ObjectId | null, prompt: string, type: string, inputTokens?: number, outputTokens?: number) {
        return await AiRepo.saveRequest(userId, prompt, type, inputTokens, outputTokens);
    }

    async createContent(requestId: Types.ObjectId | string, contentType: string, recordJson: any, fullResponse?: string) {
        return await AiRepo.saveContent(requestId, contentType, recordJson, fullResponse);
    }

    async getRequestsByUser(userId: string | Types.ObjectId) {
        return await AiRepo.getRequestsByUser(userId);
    }

    async getAllRequests(page: number = 1, userId?: string) {
        return await AiRepo.getAllRequests(page, userId || "");
    }

    async getContentByRequest(requestId: string) {
        return await AiRepo.getContentByRequest(requestId);
    }

    async countContentByUser(userId: string | Types.ObjectId) {
        return await AiRepo.countContentByUser(userId);
    }

    async getTokenUsageByUser(userId: string | Types.ObjectId) {
        return await AiRepo.getTokenUsageByUser(userId);
    }
}

export default new AiService();
