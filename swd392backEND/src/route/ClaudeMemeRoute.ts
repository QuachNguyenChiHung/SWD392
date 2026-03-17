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

// Generate a teacher-editable quiz using AI. Expects JSON body:
// { topicTitle, topicDescription, count, mcCount, tfCount }
route.post("/teacher/ai-create-quiz", verifyRole.verifyTeacher, async (req, res, next) => {
    try {
        const { topicTitle, topicDescription, count = 5, mcCount = 5, tfCount = 0 } = req.body;
        if (!topicTitle) {
            return res.status(400).json({ message: "topicTitle is required" });
        }

        const buildQuizPrompt = (title: string, description: string | undefined, total: number, mc: number, tf: number) => {
            return `You are an assistant that generates teacher-editable quizzes. Produce a single valid JSON object only (no commentary) with this exact shape:\n\n{\n  "title": "<quiz title>",\n  "type": "interactive|standard",\n  "keyword": "<optional short keyword|null>",\n  "questions": [ { "id": "q1", "content": "question text", "type": "multiple-choice", "options": ["A","B","C"], "correctAnswer": "A", "editable": true } ]\n}\n\nConstraints:\n- Return exactly ${total} questions in the \"questions\" array (no more, no less).\n- Include exactly ${tf} true/false style questions (represent them as multiple-choice with options exactly [\"True\",\"False\"]).\n- Include exactly ${mc} non-true/false multiple-choice questions (each with 3–5 unique options).\n- EVERY question must use \"type\": \"multiple-choice\".\n- Topic context: Title: \"${title}\" Description: \"${description || ''}\".\n- Output JSON only, no surrounding text or explanation.`;
        };

        const prompt = buildQuizPrompt(topicTitle, topicDescription, Number(count), Number(mcCount), Number(tfCount));
        const aiResponse = await runModel(prompt);
        return res.json({ message: aiResponse });
    } catch (error) {
        next(error);
    }
});
export default route;