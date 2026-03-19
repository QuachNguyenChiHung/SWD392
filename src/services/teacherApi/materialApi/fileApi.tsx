import { apiService } from '../../api';
import type { FileMaterial } from '../../../types/teacherType';

export interface CreateFileDTO {
    file_name: string;
    file_path: string;
}

export interface UpdateFileDTO {
    file_name?: string;
    file_path?: string;
}

class FileApiService {
    // Get all files
    async getAllFiles(): Promise<FileMaterial[]> {
        const response = await apiService.get('/files');
        return response;
    }

    // Get file by ID
    async getFileById(fileId: string): Promise<FileMaterial> {
        const response = await apiService.get(`/files/${fileId}`);
        return response;
    }

    // Get file by path
    async findByPath(filePath: string): Promise<FileMaterial> {
        const response = await apiService.get(`/files/by-path?path=${encodeURIComponent(filePath)}`);
        return response;
    }

    // Create new file
    async createFile(fileData: CreateFileDTO): Promise<FileMaterial> {
        const response = await apiService.post('/files', fileData);
        return response;
    }

    // Update file
    async updateFile(fileId: string, updateData: UpdateFileDTO): Promise<FileMaterial> {
        const response = await apiService.put(`/files/${fileId}`, updateData);
        return response;
    }

    // Delete file
    async deleteFile(fileId: string): Promise<void> {
        await apiService.delete(`/files/${fileId}`);
    }

    // Upload file with FormData
    async uploadFile(formData: FormData): Promise<FileMaterial> {
        const response = await apiService.uploadFile('/files', formData);
        return response;
    }

    // Update file with upload (for editing existing files)
    async updateFileWithUpload(fileId: string, formData: FormData): Promise<FileMaterial> {
        const response = await apiService.updateFileUpload(`/files/${fileId}`, formData);
        return response;
    }
}

export const fileApiService = new FileApiService();