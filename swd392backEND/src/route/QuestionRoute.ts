import { Router } from "express";
import QuestionController from "../controller/QuestionController.ts";
import verifyRole from "../ultis/verifyRole.ts";

const router = Router();

// Public / authenticated reads
router.get("/questions", verifyRole.verifyAdmin, QuestionController.getAllQuestions);
router.get("/questions/:id", QuestionController.getQuestionById);
router.get("/quizzes/:quizId/questions", QuestionController.getQuestionsByQuizId);

// Teacher-only writes
router.post("/questions", verifyRole.verifyTeacher, QuestionController.createQuestion);
router.put("/questions/:id", verifyRole.verifyTeacher, QuestionController.updateQuestion);
router.delete("/questions/:id", verifyRole.verifyTeacher, QuestionController.deleteQuestion);

export default router;
