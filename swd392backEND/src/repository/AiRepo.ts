import { AiRequest } from '../entities/AiRequest.ts';
import { AiContent } from '../entities/AiContent.ts';
import type { Types } from 'mongoose';

const PAGE_SIZE = 20;

class AiRepo {
    /** Persist a new AI request from the user */
    async saveRequest(userId: string | Types.ObjectId | null, prompt: string, type: string) {
        const doc = new AiRequest({
            user_id: userId ?? null,
            prompt,
            type,
        });
        return await doc.save();
    }

    /** Persist the AI's response content linked to an existing request */
    async saveContent(requestId: Types.ObjectId | string, contentType: string, recordJson: any) {
        const doc = new AiContent({
            ai_request_id: requestId,
            content_type: contentType,
            record_json: recordJson,
        });
        return await doc.save();
    }

    /** Teacher: get all AI requests for their own user_id, most recent first */
    async getRequestsByUser(userId: string | Types.ObjectId) {
        return await AiRequest.find({ user_id: userId }).sort({ date: -1 }).lean();
    }

    /** Admin/Moderator: get all AI requests paginated, most recent first */
    async getAllRequests(page: number = 1) {
        const skip = (page - 1) * PAGE_SIZE;
        const [data, total] = await Promise.all([
            AiRequest.find().sort({ date: -1 }).skip(skip).limit(PAGE_SIZE).lean(),
            AiRequest.countDocuments(),
        ]);
        return { data, total, page, pageSize: PAGE_SIZE };
    }

    /** Get the AiContent record(s) linked to a given request */
    async getContentByRequest(requestId: string) {
        return await AiContent.find({ ai_request_id: requestId }).lean();
    }
}

export default new AiRepo();
