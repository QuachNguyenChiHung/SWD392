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
    async saveContent(requestId: Types.ObjectId | string, contentType: string, recordJson: any, fullResponse?: string) {
        if (fullResponse) {
            recordJson.full_response = fullResponse;
        }
        const doc = new AiContent({
            ai_request_id: requestId,
            content_type: contentType,
            record_json: recordJson,
        });
        return await doc.save();
    }

    /** Teacher: get all AI requests for their own user_id, most recent first */
    async getRequestsByUser(userId: string | Types.ObjectId) {
        const requests = await AiRequest.find({ user_id: userId }).sort({ date: -1 }).lean();

        if (!requests.length) return [];

        const requestIds = requests.map(r => r._id);
        const contents = await AiContent.find({ ai_request_id: { $in: requestIds } }).lean();

        const contentsByReq: Record<string, any[]> = {};
        for (const c of contents) {
            const reqId = String(c.ai_request_id);
            if (!contentsByReq[reqId]) contentsByReq[reqId] = [];
            contentsByReq[reqId].push(c);
        }

        return requests.map(r => ({
            ...r,
            contents: contentsByReq[String(r._id)] || []
        }));
    }

    /** Admin/Moderator: get all AI requests paginated, most recent first */
    async getAllRequests(page: number = 1, userId: string) {
        const skip = (page - 1) * PAGE_SIZE;
        const query = userId ? { user_id: userId } : {};
        const [data, total] = await Promise.all([
            AiRequest.find(query).sort({ date: -1 }).skip(skip).limit(PAGE_SIZE).lean(),
            AiRequest.countDocuments(query),
        ]);
        return { data, total, page, pageSize: PAGE_SIZE };
    }

    /** Get the AiContent record(s) linked to a given request */
    async getContentByRequest(requestId: string) {
        return await AiContent.find({ ai_request_id: requestId }).lean();
    }
}

export default new AiRepo();
