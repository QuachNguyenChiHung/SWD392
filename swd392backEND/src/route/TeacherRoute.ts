import { Router } from 'express';
import TeacherController from '../controller/TeacherController.ts';

const router = Router();

// Public: get teacher info by teacher id
router.get('/teachers/:id', TeacherController.getTeacherById);

// Public: get teacher info by user id
router.get('/teachers/by-user/:userId', TeacherController.getTeacherByUserId);

export default router;
