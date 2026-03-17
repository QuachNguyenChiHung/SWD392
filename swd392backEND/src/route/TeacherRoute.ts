import { Router } from 'express';
import TeacherController from '../controller/TeacherController.ts';

const route = Router();

// Public: get teacher info by teacher id
route.get('/teachers/:id', TeacherController.getTeacherById);

// Public: get teacher info by user id
route.get('/teachers/by-user/:userId', TeacherController.getTeacherByUserId);

export default route;
