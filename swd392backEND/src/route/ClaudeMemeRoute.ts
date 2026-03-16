import { Router } from "express";
import {runModel,runModelWithHistory} from "../ultis/claude.ts";
import { verify } from "crypto";
import verifyRole from "../ultis/verifyRole.ts";

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
route.post("/teacher/ai-chad", verifyRole.verifyTeacher, async (req, res, next) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ message: "Prompt is required" });
        }
        const msg = await runModelWithHistory(prompt);
        res.json({ message: msg });
    } catch (error) {
        next(error);
    }
});
export default route;