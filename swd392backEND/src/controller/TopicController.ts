import type { Request, Response, NextFunction } from "express";
import TopicService from "../services/TopicService.ts";
import { CreateTopicSchema, UpdateTopicSchema } from "../dto/TopicDTO.ts";

class TopicController {
    // POST: Create topic
    async createTopic(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = CreateTopicSchema.parse(req.body);
            const result = await TopicService.createTopic(validatedData);


            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    }

    // PUT: Update topic
    async updateTopic(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const validatedData = UpdateTopicSchema.parse(req.body);

            const result = await TopicService.updateTopic(id as string, validatedData);
            if (!result) {
                return res.status(404).json({ error: "Topic not found" });
            }

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // GET: Get topic by ID
    async getTopicById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const topic = await TopicService.getTopicById(id as string);

            if (!topic) {
                return res.status(404).json({ error: "Topic not found" });
            }

            res.status(200).json(topic);
        } catch (error) {
            next(error);
        }
    }

    // GET: Search topics by keyword (paginated)
    async searchTopicsByKeyword(req: Request, res: Response, next: NextFunction) {
        try {
            const { keyword } = req.query;
            const page = parseInt(req.query.page as string) || 1;

            if (!keyword || typeof keyword !== 'string') {
                return res.status(400).json({ error: "Keyword is required" });
            }

            const result = await TopicService.searchTopicsByKeyword(keyword, page);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    // GET: Get topics from a course (paginated)
    async getTopicsByCourse(req: Request, res: Response, next: NextFunction) {
        try {
            const { course_id } = req.params;
            const page = parseInt(req.query.page as string) || 1;

            const topics = await TopicService.getTopicsByCourse(course_id as string, page);
            res.status(200).json(topics);
        } catch (error) {
            next(error);
        }
    }
}

export default new TopicController();
