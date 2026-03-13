import { apiService } from '../../api';
import type { SlideMaterial } from '../../../types/teacherType';

export interface CreateSlideDTO {
    slide_name: string;
    file_path: string;
}

export interface UpdateSlideDTO {
    slide_name?: string;
    file_path?: string;
}

class SlideApiService {
    // Get all slides
    async getAllSlides(): Promise<SlideMaterial[]> {
        const response = await apiService.get('/slides');
        return response;
    }

    // Get slide by ID
    async getSlideById(slideId: string): Promise<SlideMaterial> {
        const response = await apiService.get(`/slides/${slideId}`);
        return response;
    }

    // Get slide by path
    async findByPath(slidePath: string): Promise<SlideMaterial> {
        const response = await apiService.get(`/slides/by-path?path=${encodeURIComponent(slidePath)}`);
        return response;
    }

    // Create new slide
    async createSlide(slideData: CreateSlideDTO): Promise<SlideMaterial> {
        const response = await apiService.post('/slides', slideData);
        return response;
    }

    // Update slide
    async updateSlide(slideId: string, updateData: UpdateSlideDTO): Promise<SlideMaterial> {
        const response = await apiService.put(`/slides/${slideId}`, updateData);
        return response;
    }

    // Delete slide
    async deleteSlide(slideId: string): Promise<void> {
        await apiService.delete(`/slides/${slideId}`);
    }

    // Upload slide file with FormData
    async uploadSlide(formData: FormData): Promise<SlideMaterial> {
        const response = await apiService.uploadFile('/slides', formData);
        return response;
    }

    // Update slide with upload (for editing existing slides)
    async updateSlideWithUpload(slideId: string, formData: FormData): Promise<SlideMaterial> {
        const response = await apiService.updateFileUpload(`/slides/${slideId}`, formData);
        return response;
    }
}

export const slideApiService = new SlideApiService();