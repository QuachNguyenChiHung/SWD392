import { Router } from "express";
import QuizController from "../controller/QuizController.ts";
import verifyRole from "../ultis/verifyRole.ts";

const router = Router();

// Public / authenticated reads
router.get("/quizzes", QuizController.getAllQuizzes);
router.get("/quizzes/:id", QuizController.getQuizById);

// Quiz attempts
router.get("/quizzes/:quizId/attempts", verifyRole.verifyTeacher, QuizController.getQuizAttemptsByQuizId);
router.get("/users/:userId/quiz-attempts", QuizController.getQuizAttemptsByUserId);
router.post("/quizzes/:quizId/attempts/:userId", QuizController.createQuizAttempt);

// Teacher-only writes
router.post("/quizzes", verifyRole.verifyTeacher, QuizController.createQuiz);
router.put("/quizzes/:id", verifyRole.verifyTeacher, QuizController.updateQuiz);
router.delete("/quizzes/:id", verifyRole.verifyTeacher, QuizController.deleteQuiz);
router.patch("/quizzes/:id/toggle-status", verifyRole.verifyTeacher, QuizController.toggleQuizStatus);

export default router;
