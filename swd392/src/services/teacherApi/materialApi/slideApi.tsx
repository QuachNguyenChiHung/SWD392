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
        return response.data || response;
    }

    // Get slide by ID
    async getSlideById(slideId: string): Promise<SlideMaterial> {
        const response = await apiService.get(`/slides/${slideId}`);
        return response.data || response;
    }

    // Get slide by path
    async findByPath(slidePath: string): Promise<SlideMaterial> {
        const response = await apiService.get(`/slides/by-path?path=${encodeURIComponent(slidePath)}`);
        return response.data || response;
    }

    // Create new slide
    async createSlide(slideData: CreateSlideDTO): Promise<SlideMaterial> {
        const response = await apiService.post('/slides', slideData);
        return response.data || response;
    }

    // Update slide
    async updateSlide(slideId: string, updateData: UpdateSlideDTO): Promise<SlideMaterial> {
        const response = await apiService.put(`/slides/${slideId}`, updateData);
        return response.data || response;
    }

    // Delete slide
    async deleteSlide(slideId: string): Promise<void> {
        await apiService.delete(`/slides/${slideId}`);
    }

    // Upload slide file with FormData
    async uploadSlide(formData: FormData): Promise<SlideMaterial> {
        const token = localStorage.getItem('token');
        const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/slides`;

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

export const slideApiService = new SlideApiService();