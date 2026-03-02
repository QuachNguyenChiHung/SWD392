import Render2DRepo from "../repository/Render2DRepo.ts";
import type { CreateRender2DDTO, UpdateRender2DDTO } from "../dto/Render2DDTO.ts";

class Render2DService {
    async getRender2DById(id: string) {
        return await Render2DRepo.getRender2DById(id);
    }

    async getAllRender2Ds(page: number = 1) {
        return await Render2DRepo.getAllRender2Ds(page);
    }

    async createRender2D(renderData: CreateRender2DDTO) {
        return await Render2DRepo.createRender2D(renderData);
    }

    async updateRender2D(id: string, updateData: UpdateRender2DDTO) {
        return await Render2DRepo.updateRender2D(id, updateData);
    }

    async deleteRender2D(id: string) {
        return await Render2DRepo.deleteRender2D(id);
    }
}

export default new Render2DService();