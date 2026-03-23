import type { loginDTO, registerDTO } from "../dto/AuthDTO.ts";
import type { UserUpdateDTO } from "../dto/UserDTO.ts";
import UserRepo from "../repository/UserRepo.ts";
import TeacherRepo from "../repository/TeacherRepo.ts";
import AdminRepo from "../repository/AdminRepo.ts";
import jwt from "jsonwebtoken";
import type { IUser } from "../interface/IUser.ts";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

const SALT_ROUNDS = 12;

class UserService {
  async getUserById(userId: string) {
    return await UserRepo.getUserById(userId);
  }
  async createUser(
    userData: registerDTO,
    options?: {
      credentialLink?: string | undefined;
      credentialFileName?: string | undefined;
    },
  ) {
    const findEmail = await this.findByMail(userData.email);
    if (findEmail) {
      return "Email already exists";
    }

    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
    const createdUser = await UserRepo.createUser({
      ...userData,
      password: hashedPassword,
    });

    if (userData.role === "teacher") {
      if (!options?.credentialLink || !options?.credentialFileName) {
        throw new Error("Teacher credential PDF is required");
      }
      await TeacherRepo.createTeacher(
        createdUser._id.toString(),
        options.credentialLink,
        options.credentialFileName,
      );
    }

    if (userData.role === "admin" || userData.role === "moderator") {
      const authorizationLevel: 1 | 2 = userData.role === "admin" ? 2 : 1;
      await AdminRepo.createAdmin(createdUser._id.toString(), authorizationLevel);
    }

    return createdUser;
  }
  async updateUser(userId: string, updateData: UserUpdateDTO) {
    const safeUpdateData: UserUpdateDTO = { ...updateData };

    if (typeof safeUpdateData.password === "string") {
      safeUpdateData.password = await bcrypt.hash(safeUpdateData.password, SALT_ROUNDS);
    }

    return await UserRepo.updateUser(userId, safeUpdateData);
  }
  async deleteUser(userId: string) {
    const user = await UserRepo.getUserById(userId);
    if (!user) {
      return null;
    }
    if (user.role === "admin") {
      return "Cannot delete admin";
    }
    if (user.role === "teacher") {
      await TeacherRepo.deleteTeacherByUserId(userId);
    }
    if (user.role === "moderator") {
      await AdminRepo.deleteAdminByUserId(userId);
    }
    return await UserRepo.deleteUser(userId);
  }
  async loginUser(userLogin: loginDTO) {
    // normalize email to avoid case/whitespace mismatches
    const email = (userLogin.email || "").trim().toLowerCase();
    console.log("User login email:", email);
    const user = await UserRepo.findByMail(email);
    // only log whether user exists (avoid printing password)
    console.log("User found for login exists:", !!user);
    if (!user) return null;
    // Guard: if user has no password, they signed up via Google
    if (!user.password) {
      throw new Error("Tài khoản này sử dụng đăng nhập Google. Vui lòng đăng nhập bằng Google.");
    }
    if (await bcrypt.compare(userLogin.password, user.password)) {
      const { password, ...cleanedUser } = user.toObject();
      return cleanedUser;
    }
    return null;
  }

  async googleLogin(credential: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error("GOOGLE_CLIENT_ID is not configured");
    }
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new Error("Invalid Google token");
    }

    const email = payload.email!.trim().toLowerCase();
    const name = String(payload.name ?? email.split("@")[0]);

    // Try to find existing user by email
    let user = await UserRepo.findByMail(email);

    if (!user) {
      // Create new user without password
      user = await UserRepo.createGoogleUser(email, name);
    }

    // Check if user is banned/deleted
    if (user.status !== "active") {
      throw new Error("Tài khoản đã bị khóa hoặc xóa.");
    }

    const { password, ...cleanedUser } = user.toObject();
    return cleanedUser;
  }

  async toggleStatus(userId: string) {
    return await UserRepo.toggleStatus(userId);
  }
  async generateToken(user: any) {
    const token = jwt.sign(user, process.env.SECRET_KEY as string, {
      expiresIn: "1h",
    });
    return token;
  }
  async getUserByToken(token: string) {
    try {
      // Bearer 'token' or just 'token'
      const split = (
        token.startsWith("Bearer ") ? token.split(" ")[1] : token
      ) as string;
      const decoded = jwt.verify(
        split,
        process.env.SECRET_KEY as string,
      ) as any;

      let user = await this.getUserById(decoded.id_);
      const { password, status, username, email, date_create, _id, role } =
        user as IUser;
      return {
        password,
        status,
        username,
        email,
        date_create,
        id: _id.toString(),
        role,
      };
    } catch (error) {
      return null;
    }
  }

  async getAllUsers(page: number) {
    return await UserRepo.getAllUsers(page);
  }
  async getAllUsersForAdmin(page: number) {
    return await UserRepo.getAllUsersWithEntities(page);
  }
  async getUserByIdForAdmin(userId: string) {
    return await UserRepo.getUserByIdWithEntities(userId);
  }
  async getListUsersByRole(role: string, page: number) {
    return await UserRepo.getListUsersByRole(role, page);
  }
  async findByMail(email: string) {
    return await UserRepo.findByMail(email);
  }
  async findByKeyWord(keyword: string, page: number) {
    return await UserRepo.findByKeyWord(keyword, page);
  }
  async findByKeyWordForAdmin(keyword: string, page: number) {
    return await UserRepo.findByKeyWordWithEntities(keyword, page);
  }

  async getAdminUserStats(timeRange: string = "30days", role: string = "all") {
    const validTimeRanges = ["7days", "30days", "3months", "1year", "all"];
    const validRoles = ["admin", "moderator", "teacher", "student", "all"];

    if (!validTimeRanges.includes(timeRange)) {
      return {
        error:
          "Invalid timeRange parameter. Must be one of: 7days, 30days, 3months, 1year, all",
      };
    }
    if (!validRoles.includes(role)) {
      return {
        error:
          "Invalid role parameter. Must be one of: admin, moderator, teacher, student, all",
      };
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
        if (item._id === "active") activeUsers = item.count;
        else inactiveUsers += item.count;
      });
    }

    // Format trend data
    const trend = stats.trend || [];
    const trendData = trend.map((item: any) => ({
      date: item._id,
      count: item.count,
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
      const growth =
        ((totalUsers - stats.previousTotal) / stats.previousTotal) * 100;
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
        last30Days: recent30,
      },
      growthRate,
      activeUsers,
      inactiveUsers,
      trend: trendData,
    };
  }
}
export default new UserService();
