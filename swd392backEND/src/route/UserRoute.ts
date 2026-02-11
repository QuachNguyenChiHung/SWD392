import { Router } from "express";
import UserController from "../controller/UserController.ts";
import verifyRole from "../ultis/verifyRole.ts";
const route = Router();

route.get('/users', verifyRole.verifyAdmin, UserController.getAllUsers);
route.get('/users/:id', verifyRole.verifyAdmin, UserController.getUserById);
route.post('/users', verifyRole.verifyAdmin, UserController.createUser);
route.patch('/users/:id', verifyRole.verifyAdmin, UserController.updateUser);
route.delete('/users/:id', verifyRole.verifyAdmin, UserController.deleteUser);

// User status management
route.patch('/users/:id/status', verifyRole.verifyAdmin, UserController.toggleStatus);

// Authentication routes
route.post('/register', UserController.registerUser);
route.post('/login', UserController.loginUser);
route.get('/me', UserController.getUserInfo);

// Update own profile, but needs to update token(fix this later)
route.patch('/me', UserController.updateSelf);
// Logout route
route.post('/logout', UserController.removeToken);

// Search users by keyword functionality
route.get('/users/search', verifyRole.verifyAdmin, UserController.findByKeyWord);

export default route;
