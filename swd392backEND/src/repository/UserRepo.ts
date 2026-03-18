import { Schema } from "mongoose";
import { User } from "../entities/User.ts";
import { Teacher } from "../entities/Teacher.ts";
import { Admin } from "../entities/Admin.ts";
import type { IUser } from "../interface/IUser.ts";
import type { registerDTO } from "../dto/AuthDTO.ts";
import type { UserUpdateDTO } from "../dto/UserDTO.ts";

class UserRepo {
  private async attachRoleEntities(user: any) {
    if (!user) return null;
    const userId = user._id?.toString();
    const [teacher, admin] = await Promise.all([
      Teacher.findOne({ user_id: userId }).lean(),
      Admin.findOne({ user_id: userId }).lean(),
    ]);
    return {
      ...user,
      teacher: teacher || null,
      admin: admin || null,
    };
  }

  async getAllUsersWithEntities(page: number) {
    const limit = 12;
    const skip = (page - 1) * limit;
    const users = await User.find().skip(skip).limit(limit).lean();
    return await Promise.all(users.map((user) => this.attachRoleEntities(user)));
  }

  async getUserByIdWithEntities(id: string) {
    const user = await User.findById(id).lean();
    return await this.attachRoleEntities(user);
  }

  async findByKeyWordWithEntities(keyword: string, page: number) {
    const limit = 12;
    const skip = (page - 1) * limit;
    const k = (keyword || "") as string;
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safe = escapeRegex(k);
    const regex =
      safe === "" ? { $exists: true } : { $regex: safe, $options: "i" };

    const users = await User.find({
      $or: [{ username: regex as any }, { email: regex as any }],
    })
      .skip(skip)
      .limit(limit)
      .lean();

    return await Promise.all(users.map((user) => this.attachRoleEntities(user)));
  }

  async getAllUsers(page: number) {
    const limit = 12;
    const skip = (page - 1) * limit;
    return await User.find().skip(skip).limit(limit);
  }
  async getUserById(id: string) {
    return await User.findById(id);
  }
  async createUser(userData: registerDTO) {
    // normalize email before saving
    const normalized = {
      ...userData,
      email: (userData.email || "").trim().toLowerCase(),
    } as any;
    const user = new User(normalized);
    return await user.save();
  }
  async updateUser(id: string, updateData: UserUpdateDTO) {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }
  async deleteUser(id: string) {
    return await User.findByIdAndDelete(id);
  }
  async toggleStatus(id: string) {
    const user = await User.findById(id);
    if (user) {
      user.status = user.status === "active" ? "banned" : "active";
      return await user.save();
    }
    return null;
  }
  async findByMail(email: string) {
    // perform case-insensitive exact match; escape any regex meta-characters
    const e = (email || "").trim();
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safe = escapeRegex(e);
    return await User.findOne({
      email: { $regex: `^${safe}$`, $options: "i" },
    });
  }
  async getListUsersByRole(role: string, page: number) {
    const limit = 12;
    const skip = (page - 1) * limit;
    return await User.find({ role: role }).skip(skip).limit(limit);
  }
  async findByKeyWord(keyword: string, page: number) {
    const limit = 12;
    const skip = (page - 1) * limit;
    // Defensive: ensure keyword is a string and escape regex meta-characters
    const k = (keyword || "") as string;
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const safe = escapeRegex(k);

    // If keyword is empty, match all users (avoid passing undefined to $regex)
    const regex =
      safe === "" ? { $exists: true } : { $regex: safe, $options: "i" };

    return await User.find({
      $or: [{ username: regex as any }, { email: regex as any }],
    })
      .skip(skip)
      .limit(limit);
  }

  async getAdminUserStats(timeRange: string, role: string) {
    const getDateFilter = (range: string) => {
      const now = new Date();
      switch (range) {
        case "7days":
          return new Date(now.setDate(now.getDate() - 7));
        case "30days":
          return new Date(now.setDate(now.getDate() - 30));
        case "3months":
          return new Date(now.setMonth(now.getMonth() - 3));
        case "1year":
          return new Date(now.setFullYear(now.getFullYear() - 1));
        default:
          return null;
      }
    };

    const dateFilter = getDateFilter(timeRange);
    const matchStage: any = {};

    if (dateFilter) matchStage.date_create = { $gte: dateFilter };
    if (role !== "all") matchStage.role = role;

    const [stats] = await User.aggregate([
      { $match: matchStage },
      {
        $facet: {
          byRole: [{ $group: { _id: "$role", count: { $sum: 1 } } }],
          byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          trend: [
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$date_create" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          total: [{ $count: "count" }],
        },
      },
    ]);

    // Get stats for previous period for growth calculation
    let previousTotal = 0;
    if (dateFilter) {
      const previousPeriodStart = new Date(dateFilter);
      const duration = Date.now() - dateFilter.getTime();
      previousPeriodStart.setTime(previousPeriodStart.getTime() - duration);

      const previousMatch: any = {
        date_create: {
          $gte: previousPeriodStart,
          $lt: dateFilter,
        },
      };
      if (role !== "all") previousMatch.role = role;

      previousTotal = await User.countDocuments(previousMatch);
    }

    return { ...stats, previousTotal };
  }
}
export default new UserRepo();
