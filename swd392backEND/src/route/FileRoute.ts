import { Router } from "express";
import FileController from "../controller/FileController.ts";
import verifyRole from "../ultis/verifyRole.ts";
import { filesMulterUpload } from "../ultis/cloudinary.ts";

const router = Router();

// Public / authenticated reads
router.get("/files/by-path", FileController.findByPath);
router.get("/files", FileController.getAllFiles);
router.get("/files/:id", FileController.getFileById);

// Teacher-only writes
router.post("/files", verifyRole.verifyTeacher,filesMulterUpload.single("file"), FileController.createFile);
router.put("/files/:id", verifyRole.verifyTeacher, filesMulterUpload.single("file"), FileController.updateFile);
router.delete("/files/:id", verifyRole.verifyTeacher, FileController.deleteFile);

export default router;
