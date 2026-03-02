import { Router } from "express";
import DashboardController from "../controller/DashboardController.ts";

const router = Router();

router.get("/dashboard", DashboardController.getDashboard);

export default router;
