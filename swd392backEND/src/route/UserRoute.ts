import { Router } from "express";
import UserController from "../controller/UserController.ts";
import verifyRole from "../ultis/verifyRole.ts";
const route = Router();
// Admin statistics for users
route.get('/admin/stats/users', verifyRole.verifyAdmin, UserController.getAdminUserStats);

// Search users by keyword functionality
route.get('/users/search', verifyRole.verifyAdminOrModerator, UserController.findByKeyWord);
route.get('/users', verifyRole.verifyAdminOrModerator, UserController.getAllUsers);
route.get('/users/:id', verifyRole.verifyAdminOrModerator, UserController.getUserById);
route.post('/users', verifyRole.verifyAdmin, UserController.createUser);
route.patch('/users/:id', verifyRole.verifyAdmin, UserController.updateUser);

// User status toggle route, only for admin or moderator to use
route.patch('/users/:id/status', verifyRole.verifyAdminOrModerator, UserController.toggleStatus);

// Authentication routes
route.post('/register', UserController.registerUser);
route.post('/login', UserController.loginUser);
route.get('/me', UserController.getUserInfo);
route.get('/admin/moderators', verifyRole.verifyAdmin, UserController.getListModerators);
route.delete('/admin/moderators/:id', verifyRole.verifyAdmin, UserController.deleteModerator);
// Update own profile, but needs to update token(fix this later)
route.patch('/me', UserController.updateSelf);
// Logout route
route.post('/logout', UserController.removeToken);

export default route;
