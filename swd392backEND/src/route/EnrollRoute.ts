import { Router } from "express";
import EnrollController from "../controller/EnrollController.ts";
import verifyRole from "../ultis/verifyRole.ts";

const router = Router();

// POST: /api/enroll/:u_id/:class_id - Student enrollment
router.post("/enroll/:u_id/:class_id", verifyRole.verifyStudent, EnrollController.createEnrollment);

// GET: /api/enroll/:class_id - Get all enrollments from a class (paginated, teachers only)
router.get("/enroll/:class_id", verifyRole.verifyTeacher, EnrollController.getEnrollmentsByClass);

// PATCH: /api/enroll/:enroll_id/completed - Mark enrollment status as completed
router.patch("/enroll/:enroll_id/completed", verifyRole.verifyTeacher, EnrollController.completeEnrollment);

export default router;