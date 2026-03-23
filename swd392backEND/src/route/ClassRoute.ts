import { Router } from "express";
import ClassController from "../controller/ClassController.ts";
import verifyRole from "../ultis/verifyRole.ts";
import { imageMulterUpload } from "../ultis/cloudinary.ts";
const router = Router();

// Admin statistics for classes
router.get("/admin/stats/classes", verifyRole.verifyAdminOrModerator, ClassController.getAdminClassStats);

// Admin delete class (no ownership check)
router.delete("/admin/classes/:id", verifyRole.verifyAdmin, ClassController.deleteClassForAdmin);
router.get("/classes/search", verifyRole.verifyAdminOrModerator, ClassController.getClassesByName);
router.get("/class/:id", ClassController.getClassById);
router.get("/teacher/class", verifyRole.verifyTeacher, ClassController.getClassesByTeacher);
router.get("/student/class", verifyRole.verifyStudent, ClassController.getClassesByStudent);
router.get("/class/:classId/students", verifyRole.verifyTeacher, ClassController.getStudentsByClass);
router.post("/class", verifyRole.verifyTeacher, ClassController.createClass);
router.put("/class/:id", verifyRole.verifyTeacher, ClassController.updateClass);
router.post("/class/:classId/generate-keypass", verifyRole.verifyTeacher, ClassController.generateKeypass);
router.post("/teacher/upload-image", verifyRole.verifyTeacher, imageMulterUpload.single("image"), ClassController.uploadImageCover);
router.put("/teacher/update-image", verifyRole.verifyTeacher, imageMulterUpload.single("image"), ClassController.updateImageCover);
router.delete("/teacher/delete-image", verifyRole.verifyTeacher, ClassController.deleteImageCover);

// Teacher delete class (with ownership check)
router.delete("/classes/:id", verifyRole.verifyTeacher, ClassController.deleteClass);

export default router;