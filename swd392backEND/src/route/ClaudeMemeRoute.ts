import { Router } from "express";
import ClaudeMemeController from "../controller/ClaudeMemeController.ts";
import verifyRole from "../ultis/verifyRole.ts";

const router = Router();

// Student chat
router.post("/claude", verifyRole.verifyStudent, ClaudeMemeController.studentChat);

// AI content generation (Teacher)
router.post("/teacher/ai-create-quiz", verifyRole.verifyTeacher, ClaudeMemeController.createQuiz);
router.post("/teacher/ai-create-slide", verifyRole.verifyTeacher, ClaudeMemeController.createSlide);
router.post("/teacher/ai-create-pdf", verifyRole.verifyTeacher, ClaudeMemeController.createPdf);

// Latest AI session
router.get("/teacher/ai-session", verifyRole.verifyTeacher, ClaudeMemeController.getLatestAiSession);
router.get("/student/ai-session", verifyRole.verifyStudent, ClaudeMemeController.getLatestAiSession);

// History
router.get("/teacher/ai-history", verifyRole.verifyTeacher, ClaudeMemeController.getTeacherHistory);
router.get("/student/ai-history", verifyRole.verifyStudent, ClaudeMemeController.getStudentHistory);
router.get("/admin/ai-history/:userId", verifyRole.verifyAdminOrModerator, ClaudeMemeController.getAdminHistory);
router.get("/admin/ai-history/:requestId/content", verifyRole.verifyAdminOrModerator, ClaudeMemeController.getAdminHistoryContent);

export default router;
