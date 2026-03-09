import { Router } from "express";
import ClassMaterialController from "../controller/ClassMaterialController.ts";

import verifyRole from "../ultis/verifyRole.ts";

const router = Router();

// Public / authenticated reads (student + teacher)
router.get("/class-materials", ClassMaterialController.getMaterialsByClass);
router.get("/class-materials/all", verifyRole.verifyAdmin, ClassMaterialController.getAllMaterials);
router.get("/class-materials/count", ClassMaterialController.getMaterialCount);
router.get("/class-materials/topic/:topicId", ClassMaterialController.getMaterialsByTopic);
router.get("/class-materials/topic/:topicId/class/:classId", ClassMaterialController.getMaterialByTopicAndClass);

// // File operations - class material specific
// router.get("/class-materials/files", FileClassMaterialController.getFilesByClass);
// router.post("/class-materials/files", verifyRole.verifyTeacher, FileClassMaterialController.createFile);
// router.put("/class-materials/files/:id", verifyRole.verifyTeacher, FileClassMaterialController.updateFile);
// router.delete("/class-materials/files/:id", verifyRole.verifyTeacher, FileClassMaterialController.deleteFile);
// router.get("/class-materials/files/:id", FileClassMaterialController.getFileById);

// Slide operations - class material specific
// router.get("/class-materials/slide", SlideClassMaterialController.getSlidesByClass);
// router.post("/class-materials/slide", verifyRole.verifyTeacher, SlideClassMaterialController.createSlide);
// router.put("/class-materials/slide/:id", verifyRole.verifyTeacher, SlideClassMaterialController.updateSlide);
// router.delete("/class-materials/slide/:id", verifyRole.verifyTeacher, SlideClassMaterialController.deleteSlide);
// router.get("/class-materials/slide/:id", SlideClassMaterialController.getSlideById);

// // Quiz operations - class material specific (with questions and answers)
// router.get("/class-materials/quiz", QuizClassMaterialController.getQuizzesByClass);
// router.post("/class-materials/quiz", verifyRole.verifyTeacher, QuizClassMaterialController.createQuiz);
// router.put("/class-materials/quiz/:id", verifyRole.verifyTeacher, QuizClassMaterialController.updateQuiz);
// router.delete("/class-materials/quiz/:id", verifyRole.verifyTeacher, QuizClassMaterialController.deleteQuiz);
// router.get("/class-materials/quiz/:id", QuizClassMaterialController.getQuizById);
// router.get("/class-materials/quiz/:id/questions", QuizClassMaterialController.getQuizQuestions);

// Moderator queue: published materials awaiting review (must be before /:id)
router.get("/class-materials/moderator/pending", verifyRole.verifyModerator, ClassMaterialController.getPendingMaterials);

// Teacher: get all file-type materials (file, slide, 2d_render) for the authenticated teacher
router.get("/class-materials/teacher/files", verifyRole.verifyTeacher, ClassMaterialController.getUploadedFilesByTeacher);

router.get("/class-materials/teacher/quiz", verifyRole.verifyTeacher, ClassMaterialController.getQuizByTeacher);


router.get("/class-materials/:id", ClassMaterialController.getMaterialById);

// Teacher-only writes
router.post("/class-materials", verifyRole.verifyTeacher, ClassMaterialController.createMaterial);
router.put("/class-materials/:id", verifyRole.verifyTeacher, ClassMaterialController.updateMaterial);
router.delete("/class-materials/:id", verifyRole.verifyTeacher, ClassMaterialController.deleteMaterial);
router.patch("/class-materials/reorder", verifyRole.verifyTeacher, ClassMaterialController.reorderMaterials);
router.patch("/class-materials/:id/toggle-ai", verifyRole.verifyTeacher, ClassMaterialController.toggleAiMaterial);


// //do it later
// // Student: flag a reviewed material for re-moderation
// router.patch("/class-materials/:id/flag", verifyRole.verifyStudent, ClassMaterialController.flagMaterial);

// // Moderator: change status / verify after student flag
// router.patch("/class-materials/:id/status", verifyRole.verifyModerator, ClassMaterialController.changeStatus);
// router.patch("/class-materials/:id/verify", verifyRole.verifyModerator, ClassMaterialController.verifyAfterFlag);

export default router;
