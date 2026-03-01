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
    async findByMail(email: string) {
        return await UserRepo.findByMail(email);
    }
    async findByKeyWord(keyword: string, page: number) {
        return await UserRepo.findByKeyWord(keyword, page);
    }

}
export default new UserService();