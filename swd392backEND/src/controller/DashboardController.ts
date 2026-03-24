import type { NextFunction, Request, Response } from "express";
import DashboardService from "../services/DashboardService.ts";
import UserService from "../services/UserService.ts";

class DashboardController {
    async getDashboard(req: Request, res: Response, next: NextFunction) {
        try {
            // Check Authorization header first (for cross-domain), then fall back to signed cookies
            let token = req.headers.authorization;
            if (!token || !token.startsWith('Bearer ')) {
                token = req.signedCookies.Authorization;
            }
            
            if (!token) {
                return res.status(401).json({ message: "No token provided" });
            }
            
            const user = await UserService.getUserByToken(token);
            if (!user) return res.status(401).json({ message: "Unauthorized" });

            const handlers: Record<string, () => Promise<any>> = {
                admin: () => DashboardService.getAdminStats(),
                moderator: () => DashboardService.getModeratorStats(),
                student: () => DashboardService.getStudentStats(user.id),
                teacher: () => DashboardService.getTeacherStats(user.id)
            };

            const data = await handlers[user.role]?.();
            if (!data) return res.status(403).json({ message: "Invalid role" });

            res.status(200).json({ role: user.role, ...data });
        } catch (error) {
            next(error);
        }
    }
}

export default new DashboardController();
