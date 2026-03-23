import { AiRequest } from '../entities/AiRequest.ts';
import { AiContent } from '../entities/AiContent.ts';
import { AiSession } from '../entities/AiSession.ts';
import type { Types } from 'mongoose';

const PAGE_SIZE = 20;
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

class AiRepo {
    // ─── Session Management ──────────────────────────────────────────────────

    /**
     * Get the user's latest session (any status) with its requests for display purposes.
     */
    async getLatestSession(userId: string | Types.ObjectId) {
        const session = await AiSession.findOne({ user_id: userId })
            .sort({ created_at: -1 })
            .lean();

        if (!session) return null;

        const requests = await AiRequest.find({ AiSession_id: session._id })
            .sort({ date: -1 })
            .lean();

        return { ...session, requests };
    }

    /**
     * Get the user's latest active session, or create a new one if none exists
     * or the latest is older than 12 hours.
     */
    async getOrCreateSession(userId: string | Types.ObjectId, aiModel: string = process.env.CLAUDE_KEY_MODAL_SECONDARY || 'sonnet') {
        const latest = await AiSession.findOne({ user_id: userId, status: 'active' })
            .sort({ created_at: -1 })
            .lean();

        if (latest) {
            const age = Date.now() - new Date(latest.created_at).getTime();
            if (age < SESSION_TTL_MS) {
                // Update last_activity and return existing session
                await AiSession.updateOne({ _id: latest._id }, { last_activity: new Date() });
                return latest;
            }
            // Expire the old session
            await AiSession.updateOne({ _id: latest._id }, { status: 'expired' });
        }

        // Create a new session
        const doc = new AiSession({
            user_id: userId,
            ai_model: aiModel,
            total_input_tokens: 0,
            total_output_tokens: 0,
            estimated_cost_cents: 0,
            budget_cents: 0,
            last_activity: new Date(),
            created_at: new Date(),
            status: 'active',
        });
        return await doc.save();
    }

    /**
     * Accumulate token usage on a session.
     */
    async addTokenUsage(sessionId: string | Types.ObjectId, inputTokens: number, outputTokens: number) {
        // Estimate: Claude 3.5 Sonnet ~$3.00/M input, ~$15.00/M output
        const costCents = (inputTokens * 0.0003) + (outputTokens * 0.0015);
        return await AiSession.updateOne({ _id: sessionId }, {
            $inc: {
                total_input_tokens: inputTokens,
                total_output_tokens: outputTokens,
                estimated_cost_cents: costCents,
            },
        });
    }

    // ─── Request Management ──────────────────────────────────────────────────

    /**
     * Find the latest AiRequest for a session+type combo, or create a new one.
     * For teacher content endpoints, type distinguishes quiz/slide/pdf conversations.
     */
    async getOrCreateRequest(
        sessionId: string | Types.ObjectId,
        userId: string | Types.ObjectId | null,
        type: string
    ) {
        let request = await AiRequest.findOne({
            AiSession_id: sessionId,
            type,
        }).sort({ date: -1 });

        if (!request) {
            request = new AiRequest({
                user_id: userId ?? null,
                AiSession_id: sessionId,
                messages: [],
                type,
                date: new Date(),
            });
            await request.save();
        }

        return request;
    }

    /**
     * Create a brand new AiRequest (e.g. when teacher changes topic).
     */
    async createRequest(
        sessionId: string | Types.ObjectId,
        userId: string | Types.ObjectId | null,
        type: string
    ) {
        const doc = new AiRequest({
            user_id: userId ?? null,
            AiSession_id: sessionId,
            messages: [],
            type,
            date: new Date(),
        });
        return await doc.save();
    }

    /**
     * Push a new message onto an AiRequest's messages array.
     */
    async pushMessage(
        requestId: string | Types.ObjectId,
        responder: 'ai' | 'user',
        content: string
    ) {
        return await AiRequest.updateOne(
            { _id: requestId },
            { $push: { messages: { responder, content, at: new Date() } } }
        );
    }

    // ─── Content Management (Teacher only) ───────────────────────────────────

    /**
     * Get existing AiContent for a request+type, or create an empty one.
     */
    async getOrCreateContent(
        requestId: string | Types.ObjectId,
        contentType: string
    ) {
        let content = await AiContent.findOne({
            ai_request_id: requestId,
            content_type: contentType,
        });

        if (!content) {
            content = new AiContent({
                ai_request_id: requestId,
                content_type: contentType,
                record_json: {},
            });
            await content.save();
        }

        return content;
    }

    /**
     * Update AiContent's record_json with the latest generated data.
     */
    async updateContent(
        contentId: string | Types.ObjectId,
        recordJson: any
    ) {
        return await AiContent.updateOne(
            { _id: contentId },
            { $set: { record_json: recordJson } }
        );
    }

    // ─── History (unchanged) ─────────────────────────────────────────────────

    /** Teacher/Student: get all AI requests for their own user_id, most recent first */
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
