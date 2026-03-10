import { Router } from "express";
import TopicController from "../controller/TopicController.ts";
import verifyRole from "../ultis/verifyRole.ts";

const router = Router();

// POST: Create topic (admin only)
router.post("/topics", verifyRole.verifyAdmin, TopicController.createTopic);

// GET: Search topics by keyword (paginated)
router.get("/topics/search", TopicController.searchTopicsByKeyword);

// PUT: Update topic (admin only)
router.put("/topics/:id", verifyRole.verifyAdmin, TopicController.updateTopic);

// DELETE: Delete topic with cascade (admin only)
router.delete("/topics/:id", verifyRole.verifyAdmin, TopicController.deleteTopic);

// GET: Get topic by ID
router.get("/topics/:id", TopicController.getTopicById);


// GET: Get topics from a course (paginated)
router.get("/topics/course/:course_id", TopicController.getTopicsByCourse);

export default router;
