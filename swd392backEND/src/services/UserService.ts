import type { loginDTO, registerDTO } from "../dto/AuthDTO.ts";
import UserRepo from "../repository/UserRepo.ts";
import jwt from "jsonwebtoken";
class UserService {
    async getUserById(userId: string) {
        return await UserRepo.getUserById(userId);
    }
    async createUser(userData: registerDTO) {
        const findEmail = await this.findByMail(userData.email);
        if (findEmail) {
            return "Email already exists";
        }
        return await UserRepo.createUser(userData);
    }
    async updateUser(userId: string, updateData: any) {
        return await UserRepo.updateUser(userId, updateData);
    }
    async loginUser(userLogin: loginDTO) {
        const user = await UserRepo.findByMail(userLogin.email);
        if (user && user.password === userLogin.password && user.role === userLogin.role) {
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
    async verifyToken(token: string) {
        try {
            // Bearer 'token' or just 'token'
            const split = (token.startsWith('Bearer ') ? token.split(' ')[1] : token) as string;
            const decoded = jwt.verify(split, process.env.SECRET_KEY as string);
            return decoded;
        } catch (error) {
            return null;
        }
    }
    async deleteUser(userId: string) {
        return await UserRepo.deleteUser(userId);
    }
    async getAllUsers(page: number) {
        return await UserRepo.getAllUsers(page);
    }
    async findByMail(email: string) {
        return await UserRepo.findByMail(email);
    }
    async findByKeyWord(keyword: string) {
        return await UserRepo.findByKeyWord(keyword);
    }

}
export default new UserService();