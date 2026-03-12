import type { CreateFileDTO } from "../dto/FileDTO.ts";
import { File } from "../entities/File.ts";

class FileRepo {
    async getFileById(id: string) {
        return await File.findById(id);
    }
    async getAllFiles(page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await File.find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);
    }
    async createFile(fileData: CreateFileDTO) {
        const newFile = new File(fileData);
        return await newFile.save();
    }
    async updateFile(id: string, updateData: any) {
        return await File.findByIdAndUpdate(id, updateData, { new: true });
    }
    async deleteFile(id: string) {
        return await File.findByIdAndDelete(id);
    }
    async findByPath(filePath: string) {
        return await File.findOne({ file_path: filePath });
    }
}
export default new FileRepo;