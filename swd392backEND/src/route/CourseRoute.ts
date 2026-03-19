import { Router } from "express";
import CourseController from "../controller/CourseController.ts";
import verifyRole from "../ultis/verifyRole.ts";

const router = Router();

// Create new course
router.post("/courses",verifyRole.verifyAdminOrModerator, CourseController.createCourse);

// Update course by ID
router.put("/courses/:id", verifyRole.verifyAdminOrModerator, CourseController.updateCourse);

// Delete course by ID
router.delete("/courses/:id", verifyRole.verifyAdminOrModerator, CourseController.deleteCourse);

// Toggle course status (active/inactive)
router.patch("/courses/:id/toggle-status", verifyRole.verifyAdminOrModerator, CourseController.toggleCourseStatus);

// Search courses by keyword
router.get("/courses/search", CourseController.searchCoursesByKeyword);

// Get course by ID
router.get("/courses/:id", CourseController.getCourseById);
// Get all courses with pagination
router.get("/courses", CourseController.getAllCourses);

export default router;
