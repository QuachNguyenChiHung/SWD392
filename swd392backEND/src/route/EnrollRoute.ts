import { Router } from "express";
import EnrollController from "../controller/EnrollController.ts";
import verifyRole from "../ultis/verifyRole.ts";

const router = Router();

// POST: /api/enroll/:u_id/:class_id - Student enrollment
router.post("/enroll/:class_id", verifyRole.verifyStudent,  EnrollController.createEnrollment);

// GET: /teacher/enroll/:class_id  Get all enrollments from a class (paginated, teachers only)
router.get("/teacher/enroll/:class_id", verifyRole.verifyTeacher,  EnrollController.getEnrollmentsByClass);

// PATCH: /api/enroll/:enroll_id/completed - Mark enrollment status as completed
router.patch("/enroll/:enroll_id/completed", verifyRole.verifyTeacher, EnrollController.completeEnrollment);
//other teacher can mark the enrollment as completed, 
// but students cannot do that, only teachers can do that,
//  and the teacher must be the one who teaches that class,
//  this will be checked in the service layer
export default router;