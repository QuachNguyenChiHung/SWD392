import { Router } from "express";
import ClassMaterialController from "../controller/ClassMaterialController.ts";

import verifyRole from "../ultis/verifyRole.ts";

const router = Router();

// Public / authenticated reads (student + teacher)
router.get("/class-materials", ClassMaterialController.getMaterialsByClass);
router.get("/class-materials/teacher", verifyRole.verifyTeacher, ClassMaterialController.getMaterialsByClassForTeacher);
router.get(
  "/class-materials/all",
  verifyRole.verifyAdmin,
  ClassMaterialController.getAllMaterials,
);
router.get("/class-materials/count", ClassMaterialController.getMaterialCount);
router.get(
  "/class-materials/teacher/count",
  verifyRole.verifyTeacher,
  ClassMaterialController.getMaterialCountForTeacher,
);
router.get(
  "/class-materials/topic/:topicId",
  ClassMaterialController.getMaterialsByTopic,
);
router.get(
  "/class-materials/topic/:topicId/class/:classId",
  ClassMaterialController.getMaterialByTopicAndClass,
);

// Moderator queue: published materials awaiting review (must be before /:id)
router.get(
  "/class-materials/moderator/pending",
  verifyRole.verifyModerator,
  ClassMaterialController.getPendingMaterials,
);

// Backwards-compatible moderator-style routes used by frontend (aliases)
router.get(
  "/moderator/materials/pending",
  verifyRole.verifyModerator,
  ClassMaterialController.getPendingMaterials,
);

// Provide alias endpoints so older/alternate frontend paths like
// /api/moderator/materials/:id work without changing the client.
router.get("/moderator/materials/:id", ClassMaterialController.getMaterialById);
router.patch(
  "/moderator/materials/:id/status",
  verifyRole.verifyModerator,
  ClassMaterialController.changeStatus,
);
router.patch(
  "/moderator/materials/:id/verify",
  verifyRole.verifyModerator,
  ClassMaterialController.verifyAfterFlag,
);

// Teacher: get all file-type materials (file, slide, 2d_render) for the authenticated teacher
router.get(
  "/class-materials/teacher/files",
  verifyRole.verifyTeacher,
  ClassMaterialController.getUploadedFilesByTeacher,
);

router.get(
  "/class-materials/teacher/quiz",
  verifyRole.verifyTeacher,
  ClassMaterialController.getQuizByTeacher,
);

router.get("/class-materials/:id", ClassMaterialController.getMaterialById);

// Teacher-only writes
router.post("/class-materials", verifyRole.verifyTeacher, ClassMaterialController.createMaterial);
router.put("/class-materials/:id", verifyRole.verifyTeacher, ClassMaterialController.updateMaterial);
router.delete("/class-materials/:id", verifyRole.verifyTeacher, ClassMaterialController.deleteMaterial);
router.patch("/class-materials/reorder", verifyRole.verifyTeacher, ClassMaterialController.reorderMaterials);
router.patch("/class-materials/:id/toggle-ai", verifyRole.verifyTeacher, ClassMaterialController.toggleAiMaterial);


// Student: flag a reviewed material for re-moderation
router.patch("/class-materials/:id/flag", verifyRole.verifyStudent, ClassMaterialController.flagMaterial);

// Moderator: change status / verify after student flag
router.patch("/class-materials/:id/status", verifyRole.verifyModerator, ClassMaterialController.changeStatus);
router.patch("/class-materials/:id/verify", verifyRole.verifyModerator, ClassMaterialController.verifyAfterFlag);

export default router;
