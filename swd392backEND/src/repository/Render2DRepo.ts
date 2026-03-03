import type { CreateRender2DDTO } from "../dto/Render2DDTO";
import { Render2D } from "../entities/Render2D.ts";

class Render2DRepo {
    async getRender2DById(id: string) {
        return await Render2D.findById(id);
    }
    async getAllRender2Ds(page: number) {
        const limit = 12;
        const skip = (page - 1) * limit;
        return await Render2D.find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit);
    }
    async createRender2D(renderData: CreateRender2DDTO) {
        const newRender = new Render2D(renderData);
        return await newRender.save();
    }
    async updateRender2D(id: string, updateData: any) {
        return await Render2D.findByIdAndUpdate(id, updateData, { new: true });
    }
    async deleteRender2D(id: string) {
        return await Render2D.findByIdAndDelete(id);
    }
}
export default new Render2DRepo;