import { Admin } from "../entities/Admin.ts";

class AdminRepo {
    async createAdmin(userId: string, authorizationLevel: 1 | 2) {
        const admin = new Admin({
            user_id: userId,
            authorization_lvl: authorizationLevel,
        });
        return await admin.save();
    }

    async deleteAdminByUserId(userId: string) {
        return await Admin.findOneAndDelete({ user_id: userId });
    }
}

export default new AdminRepo();