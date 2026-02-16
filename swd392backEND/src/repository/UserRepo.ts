import { Schema } from "mongoose";
import { User } from "../entities/User.ts";
import type { IUser } from "../interface/IUser.ts";
import type { registerDTO } from "../dto/AuthDTO.ts";
import type { UserUpdateDTO} from "../dto/UserDTO.ts";

class UserRepo {
    async getAllUsers(page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await User.find().skip(skip).limit(limit);
    }
    async getUserById(id: string) {
        return await User.findById(id);
    }
    async createUser(userData: registerDTO) {

        const user = new User(userData);
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
        return await User.findOne({ email: email });
    }
    async findByKeyWord(keyword: string, page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await User.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } }
            ]
        }).skip(skip).limit(limit);
    }
}
export default new UserRepo();