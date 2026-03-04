import { Router } from "express";
import SlideController from "../controller/SlideController.ts";
import verifyRole from "../ultis/verifyRole.ts";

const router = Router();

// Public / authenticated reads
router.get("/slides/by-path", SlideController.findByPath);
router.get("/slides", SlideController.getAllSlides);
router.get("/slides/:id", SlideController.getSlideById);

// Teacher-only writes
router.post("/slides", verifyRole.verifyTeacher, SlideController.createSlide);
router.put("/slides/:id", verifyRole.verifyTeacher, SlideController.updateSlide);
router.delete("/slides/:id", verifyRole.verifyTeacher, SlideController.deleteSlide);

export default router;
