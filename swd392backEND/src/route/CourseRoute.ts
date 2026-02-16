import { Router } from "express";
import CourseController from "../controller/CourseController.ts";
import verifyRole from "../ultis/verifyRole.ts";

const router = Router();

// Create new course
router.post("/courses",verifyRole.verifyAdmin, CourseController.createCourse);

// Update course by ID
router.put("/courses/:id", verifyRole.verifyAdmin, CourseController.updateCourse);

// Delete course by ID
router.delete("/courses/:id", verifyRole.verifyAdmin, CourseController.deleteCourse);

// Toggle course status (active/inactive)
router.patch("/courses/:id/toggle-status", verifyRole.verifyAdmin, CourseController.toggleCourseStatus);

// Search courses by keyword
router.get("/courses/search", CourseController.searchCoursesByKeyword);

export default router;
