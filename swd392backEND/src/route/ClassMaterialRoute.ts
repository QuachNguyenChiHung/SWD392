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
router.get("/class-materials/:id", ClassMaterialController.getMaterialById);

// Teacher-only writes
router.post("/class-materials", verifyRole.verifyTeacher, ClassMaterialController.createMaterial);
router.put("/class-materials/:id", verifyRole.verifyTeacher, ClassMaterialController.updateMaterial);
router.delete("/class-materials/:id", verifyRole.verifyTeacher, ClassMaterialController.deleteMaterial);
router.patch("/class-materials/reorder", verifyRole.verifyTeacher, ClassMaterialController.reorderMaterials);
router.patch("/class-materials/:id/toggle-ai", verifyRole.verifyTeacher, ClassMaterialController.toggleAiMaterial);

export default router;
