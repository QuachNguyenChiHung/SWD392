import FileRepo from "../repository/FileRepo.ts";
import type { CreateFileDTO, UpdateFileDTO } from "../dto/FileDTO.ts";

class FileService {
    async getFileById(id: string) {
        return await FileRepo.getFileById(id);
    }

    async getAllFiles(page: number = 1) {
        return await FileRepo.getAllFiles(page);
    }

    async createFile(fileData: CreateFileDTO) {
        return await FileRepo.createFile(fileData);
    }

    async updateFile(id: string, updateData: UpdateFileDTO) {
        return await FileRepo.updateFile(id, updateData);
    }

    async deleteFile(id: string) {
        return await FileRepo.deleteFile(id);
    }

    async findByPath(filePath: string) {
        return await FileRepo.findByPath(filePath);
    }
}

export default new FileService();