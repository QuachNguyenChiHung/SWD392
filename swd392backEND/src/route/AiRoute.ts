import { Router } from "express";
import AiController from "../controller/AiController.ts";
import verifyRole from "../ultis/verifyRole.ts";


const route = Router();

// Get AI request count for authenticated user (students and teachers)
route.get('/ai/requests/count', verifyRole.verifyUser, AiController.getRequestCount);

// Get token usage for authenticated user (both students and teachers)
route.get('/ai/tokens/usage', verifyRole.verifyUser, AiController.getTokenUsage);

export default route;
