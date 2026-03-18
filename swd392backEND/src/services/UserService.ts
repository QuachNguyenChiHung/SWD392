import { de } from "zod/locales";
import type { loginDTO, registerDTO } from "../dto/AuthDTO.ts";
import type { UserUpdateDTO } from "../dto/UserDTO.ts";
import UserRepo from "../repository/UserRepo.ts";
import jwt from "jsonwebtoken";
import type { IUser } from "../interface/IUser.ts";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

class UserService {
    async getUserById(userId: string) {
        return await UserRepo.getUserById(userId);
    }
    async createUser(userData: registerDTO) {
        const findEmail = await this.findByMail(userData.email);
        if (findEmail) {
            return "Email already exists";
        }
        const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
        return await UserRepo.createUser({ ...userData, password: hashedPassword });
    }
    async updateUser(userId: string, updateData: UserUpdateDTO) {
        return await UserRepo.updateUser(userId, updateData);
    }
    async loginUser(userLogin: loginDTO) {
        const user = await UserRepo.findByMail(userLogin.email);
        console.log("User found for login:", user);
        if (user && await bcrypt.compare(userLogin.password, user.password)) {
            const { password, ...cleanedUser } = user.toObject();
            return cleanedUser;
        }
        return null;
    }

    async toggleStatus(userId: string) {
        return await UserRepo.toggleStatus(userId);
    }
    async generateToken(user: any) {
        const token = jwt.sign(user, process.env.SECRET_KEY as string, { expiresIn: '1h' });
        return token;
    }
    async getUserByToken(token: string) {
        try {
            // Bearer 'token' or just 'token'
            const split = (token.startsWith('Bearer ') ? token.split(' ')[1] : token) as string;
            const decoded = jwt.verify(split, process.env.SECRET_KEY as string) as any;

            let user = await this.getUserById(decoded.id_);
            const { password, status, username, email, date_create, _id, role } = user as IUser;
            return { password, status, username, email, date_create, id: _id.toString(), role };
        } catch (error) {
            return null;
        }
    }

    async getAllUsers(page: number) {
        return await UserRepo.getAllUsers(page);
    }
    async getListUsersByRole(role: string, page: number) {
        return await UserRepo.getListUsersByRole(role, page);
    }
    async findByMail(email: string) {
        return await UserRepo.findByMail(email);
    }
    async findByKeyWord(keyword: string = '', page: number) {
        return await UserRepo.findByKeyWord(keyword, page);
    }

    async getAdminUserStats(timeRange: string = '30days', role: string = 'all') {
        const validTimeRanges = ['7days', '30days', '3months', '1year', 'all'];
        const validRoles = ['admin', 'moderator', 'teacher', 'student', 'all'];

        if (!validTimeRanges.includes(timeRange)) {
            return { error: "Invalid timeRange parameter. Must be one of: 7days, 30days, 3months, 1year, all" };
        }
        if (!validRoles.includes(role)) {
            return { error: "Invalid role parameter. Must be one of: admin, moderator, teacher, student, all" };
        }

        const stats = await UserRepo.getAdminUserStats(timeRange, role);

        // Format byRole data
        const byRole: any = {};
        if (stats.byRole) {
            stats.byRole.forEach((item: any) => {
                byRole[item._id] = item.count;
            });
        }

        // Format byStatus data
        let activeUsers = 0;
        let inactiveUsers = 0;
        if (stats.byStatus) {
            stats.byStatus.forEach((item: any) => {
                if (item._id === 'active') activeUsers = item.count;
                else inactiveUsers += item.count;
            });
        }

        // Format trend data
        const trend = stats.trend || [];
        const trendData = trend.map((item: any) => ({
            date: item._id,
            count: item.count
        }));

        // Calculate total
        const totalUsers = stats.total && stats.total[0] ? stats.total[0].count : 0;

        // Calculate recent registrations
        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        let recent7 = 0;
        let recent30 = 0;
        trend.forEach((item: any) => {
            const itemDate = new Date(item._id);
            if (itemDate >= last7Days) recent7 += item.count;
            if (itemDate >= last30Days) recent30 += item.count;
        });

        // Calculate growth rate
        let growthRate = "0%";
        if (stats.previousTotal > 0) {
            const growth = ((totalUsers - stats.previousTotal) / stats.previousTotal) * 100;
            growthRate = (growth >= 0 ? "+" : "") + growth.toFixed(1) + "%";
        } else if (totalUsers > 0) {
            growthRate = "+100%";
        }

        return {
            timeRange,
            role,
            totalUsers,
            byRole,
            recentRegistrations: {
                last7Days: recent7,
                last30Days: recent30
            },
            growthRate,
            activeUsers,
            inactiveUsers,
            trend: trendData
        };
    }

}
export default new UserService();