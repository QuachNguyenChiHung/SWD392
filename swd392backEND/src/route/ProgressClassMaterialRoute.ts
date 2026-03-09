import { Router } from "express";
import ProgressClassMaterialController from "../controller/ProgressClassMaterialController.ts";
import verifyRole from "../ultis/verifyRole.ts";

const router = Router();

// POST /api/progress/:class_id/:classmaterial_id - Create progress for a class material (student)
router.post("/progress/:class_id/:classmaterial_id", verifyRole.verifyStudent, ProgressClassMaterialController.createProgress);

// PATCH /api/progress/:class_id/:classmaterial_id/completed - Mark progress as completed (student)
router.patch("/progress/:class_id/:classmaterial_id/completed", verifyRole.verifyStudent, ProgressClassMaterialController.markAsCompleted);

// GET /api/progress/:enroll_id - Get progress by enrollment ID
router.get("/progress/:enroll_id", verifyRole.verifyStudent, ProgressClassMaterialController.getProgressByEnroll);

// GET /api/progress/teacher/:enroll_id/ - Get all students' progress via enrollment (teacher)
router.get("/progress/teacher/:enroll_id/", verifyRole.verifyTeacher, ProgressClassMaterialController.getClassProgressForTeacher);

export default router;
