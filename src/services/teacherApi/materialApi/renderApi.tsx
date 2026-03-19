import { apiService } from '../../api';
import type { Render2DMaterial } from '../../../types/teacherType';

export interface CreateRender2DDTO {
    render_data: any;
}

export interface UpdateRender2DDTO {
    render_data?: any;
}

class RenderApiService {
    // Since there's no dedicated Render2DRoute, we'll use class material endpoints
    // or create a dedicated service if needed

    // Get all 2D renders
    async getAllRenders(): Promise<Render2DMaterial[]> {
        const response = await apiService.get('/renders');
        return response.data || response;
    }

    // Get render by ID
    async getRenderById(renderId: string): Promise<Render2DMaterial> {
        const response = await apiService.get(`/renders/${renderId}`);
        return response.data || response;
    }

    // Create new 2D render
    async createRender(renderData: CreateRender2DDTO): Promise<Render2DMaterial> {
        const response = await apiService.post('/renders', renderData);
        return response.data || response;
    }

    // Update render
    async updateRender(renderId: string, updateData: UpdateRender2DDTO): Promise<Render2DMaterial> {
        const response = await apiService.put(`/renders/${renderId}`, updateData);
        return response.data || response;
    }

    // Delete render
    async deleteRender(renderId: string): Promise<void> {
        await apiService.delete(`/renders/${renderId}`);
    }

    // Save 2D render data (JSON)
    async saveRenderData(renderData: any): Promise<Render2DMaterial> {
        const response = await apiService.post('/renders', {
            render_data: renderData
        });
        return response.data || response;
    }

    // Load 2D render data
    async loadRenderData(renderId: string): Promise<any> {
        const render = await this.getRenderById(renderId);
        return render.render_data;
    }

    // Update render data
    async updateRenderData(renderId: string, renderData: any): Promise<Render2DMaterial> {
        const response = await apiService.put(`/renders/${renderId}`, {
            render_data: renderData
        });
        return response.data || response;
    }
}

export const renderApiService = new RenderApiService();