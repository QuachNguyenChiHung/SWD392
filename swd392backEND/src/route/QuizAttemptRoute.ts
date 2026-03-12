import { Router } from "express";
import QuizAttemptController from "../controller/QuizAttemptController.ts";
import verifyRole from "../ultis/verifyRole.ts";

const router = Router();

// Teacher-only routes: View student quiz attempts and results
router.get(
    "/quizzes/:quizId/attempts/with-results", 
    verifyRole.verifyTeacher, 
    QuizAttemptController.getQuizAttemptsWithResultsByQuizId
);
router.get(
    "/quizzes/:quizId/users/:userId/latest-attempt", 
    verifyRole.verifyTeacher, 
    QuizAttemptController.getLatestQuizAttemptWithResults
);

// Student-only routes: Submit quiz attempts
router.post(
    "/quiz-attempts/submit", 
    verifyRole.verifyStudent, 
    QuizAttemptController.createAndSubmitQuizAttempt
);

// General authenticated routes
router.get("/quiz-attempts/:attemptId", QuizAttemptController.getQuizAttemptById);
router.get(
    "/quiz-attempts/:attemptId/with-results", 
    QuizAttemptController.getQuizAttemptWithResults
);
router.get(
    "/my-quiz-attempts", 
    verifyRole.verifyStudent, 
    QuizAttemptController.getQuizAttemptsByUserId
);

// Admin/Teacher routes: Management operations
router.delete(
    "/quiz-attempts/:attemptId", 
    verifyRole.verifyTeacher, 
    QuizAttemptController.deleteQuizAttempt
);

export default router;