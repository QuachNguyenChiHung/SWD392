import type { Request, Response, NextFunction } from "express";
import TopicService from "../services/TopicService.ts";
import { CreateTopicSchema, UpdateTopicSchema } from "../dto/TopicDTO.ts";

class TopicController {
  // POST: Create topic
  async createTopic(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = CreateTopicSchema.parse(req.body);
      const result = await TopicService.createTopic(validatedData);

      if ((result as any).error) {
        return res.status(400).json(result);
      }

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

      const result = await TopicService.updateTopic(
        id as string,
        validatedData,
      );

      if ((result as any).error) {
        return res.status(400).json(result);
      }

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

      if (!keyword || typeof keyword !== "string") {
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

      const topics = await TopicService.getTopicsByCourse(
        course_id as string,
        page,
      );
      res.status(200).json(topics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE: Delete a topic with cascade deletion of all related entities.
   *
   * Performs atomic cascade deletion of:
   * - All ClassMaterials associated with the topic
   * - All content entities (Quiz, File, Slide, Render2D, AiContent, AiRequest) via ClassMaterial
   * - All Feedback related to the materials
   * - All ProgressClassMaterial records
   * - The Topic itself
   *
   * Uses MongoDB transactions for atomicity - either all entities are deleted or none are.
   *
   * @route DELETE /topics/:id
   * @param {Request} req - Express request with topic ID in params
   * @param {Response} res - Express response
   * @param {NextFunction} next - Express error handler
   *
   * @returns {Response} 200 - Success with deletion counts
   * @returns {Response} 404 - Topic not found
   * @returns {Response} 500 - Transaction failed
   *
   * @example
   * // Success response
   * {
   *   "success": true,
   *   "message": "Topic deleted successfully",
   *   "deletedCounts": {
   *     "topics": 1,
   *     "classMaterials": 5,
   *     "quizzes": 2,
   *     "questions": 15,
   *     "aiContents": 3,
   *     ...
   *   }
   * }
   */
  async deleteTopic(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await TopicService.deleteTopicCascade(id as string);

      if (!result.success) {
        if (result.error === "Topic not found") {
          return res.status(404).json(result);
        }
        return res.status(500).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new TopicController();
