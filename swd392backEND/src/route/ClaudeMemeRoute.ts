import { Router } from "express";
import runModel from "../ultis/claude.ts";

const route = Router();

route.post("/claude", async (req, res, next) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: "Prompt is required" });
        }
        const msg = await runModel(prompt);
        res.json({ message: msg });
    } catch (error) {
        next(error);
    }
});

export default route;