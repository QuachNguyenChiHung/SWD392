import type { NextFunction, Request, Response } from "express";
import AiService from "../services/AiService.ts";

class AiController {
    async getRequestCount(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const count = await AiService.countContentByUser(userId);
            return res.status(200).json({ request: count });
        } catch (error) {
            next(error);
        }
    }

    async getTokenUsage(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const tokenUsage = await AiService.getTokenUsageByUser(userId);
            console.log('Token usage for user', userId, ':', tokenUsage);
            
            return res.status(200).json({
                inputTokens: tokenUsage.totalInputTokens,
                outputTokens: tokenUsage.totalOutputTokens,
                totalTokens: tokenUsage.totalInputTokens + tokenUsage.totalOutputTokens
            });
        } catch (error) {
            console.error('Error getting token usage:', error);
            next(error);
        }
    }
}

export default new AiController();
