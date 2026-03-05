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
        return response.data || response;
    }

    // Get file by ID
    async getFileById(fileId: string): Promise<FileMaterial> {
        const response = await apiService.get(`/files/${fileId}`);
        return response.data || response;
    }

    // Get file by path
    async findByPath(filePath: string): Promise<FileMaterial> {
        const response = await apiService.get(`/files/by-path?path=${encodeURIComponent(filePath)}`);
        return response.data || response;
    }

    // Create new file
    async createFile(fileData: CreateFileDTO): Promise<FileMaterial> {
        const response = await apiService.post('/files', fileData);
        return response.data || response;
    }

    // Update file
    async updateFile(fileId: string, updateData: UpdateFileDTO): Promise<FileMaterial> {
        const response = await apiService.put(`/files/${fileId}`, updateData);
        return response.data || response;
    }

    // Delete file
    async deleteFile(fileId: string): Promise<void> {
        await apiService.delete(`/files/${fileId}`);
    }

    // Upload file with FormData
    async uploadFile(formData: FormData): Promise<FileMaterial> {
        const token = localStorage.getItem('token');
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/files`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            credentials: 'include',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Upload failed');
        }

        const data = await response.json();
        return data.data || data;
    }
}

export const fileApiService = new FileApiService();