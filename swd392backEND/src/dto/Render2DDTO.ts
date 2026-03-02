import z from "zod";

// Render2D Schema Reference:
// {
//     render_data: { type: Schema.Types.Mixed, required: true },
// }

const createRender2DSchema = z.object({
    render_data: z.any(),
});

const updateRender2DSchema = z.object({
    render_data: z.any().optional(),
});

export type CreateRender2DDTO = z.infer<typeof createRender2DSchema>;
export type UpdateRender2DDTO = z.infer<typeof updateRender2DSchema>;

export { createRender2DSchema, updateRender2DSchema };