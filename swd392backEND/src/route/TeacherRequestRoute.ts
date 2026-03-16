import { Router } from 'express';
import TeacherRequestController from '../controller/TeacherRequestController.ts';
import verifyRole from '../ultis/verifyRole.ts';

const router = Router();

// All teacher-request admin endpoints require admin or moderator role
router.get('/admin/teacher-requests', verifyRole.verifyAdminOrModerator, TeacherRequestController.getList);
router.get('/admin/teacher-requests/:id', verifyRole.verifyAdminOrModerator, TeacherRequestController.getById);
router.patch('/admin/teacher-requests/:id', verifyRole.verifyAdminOrModerator, TeacherRequestController.processRequest);

export default router;
