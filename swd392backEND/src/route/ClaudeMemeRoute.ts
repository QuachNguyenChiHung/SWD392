import { raw, Router } from "express";
import { runModel, runModelWithHistory } from "../ultis/claude.ts";
import { verify } from "crypto";
import verifyRole from "../ultis/verifyRole.ts";
import PptxGenJS from "pptxgenjs";
import puppeteer from "puppeteer";

const route = Router();

const extractJsonArray = (raw: string) => {
    const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    try {
        return JSON.parse(cleaned);
    } catch {
        const match = cleaned.match(/\[[\s\S]*\]/);
        if (!match) return null;
        try {
            return JSON.parse(match[0]);
        } catch {
            return null;
        }
    }
};

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

        const buildQuizPrompt = (
            title: string,
            description: string | undefined,
            total: number,
            mc: number,
            tf: number,
        ) => {
            return `You are an assistant that generates teacher-editable quizzes. Produce ONE valid JSON object only (no commentary, no markdown) with this exact shape:\n\n{\n  "title": "<quiz title>",\n  "type": "interactive",\n  "keyword": "<optional short keyword|null>",\n  "status": true,\n  "questions": [\n    {\n      "title": "question text",\n      "type": "multiple_choice|true_false",\n      "options": ["A","B","C"],\n      "correct_index": 0\n    }\n  ]\n}\n\nConstraints:\n- Return exactly ${total} questions in the "questions" array (no more, no less).\n- Include exactly ${tf} true/false questions with type "true_false" and options exactly ["True","False"].\n- Include exactly ${mc} multiple-choice questions with type "multiple_choice" and 3–5 unique options.\n- "correct_index" must be a 0-based index into the options array.\n- Keep all values JSON-safe strings (no HTML).\n- Topic context: Title: "${title}" Description: "${description || ""}".\n- Output JSON only, no surrounding text or explanation.`;
        };

        const prompt = buildQuizPrompt(topicTitle, topicDescription, Number(count), Number(mcCount), Number(tfCount));
        const aiResponse = await runModel(prompt);
        return res.json({ message: aiResponse });
    } catch (error) {
        next(error);
    }
});

route.post("/teacher/ai-create-slide", verifyRole.verifyTeacher, async (req, res, next) => {
    try {
        const { topicTitle, topicDescription, notes } = req.body;
        if (!topicTitle) {
            return res.status(400).json({ message: "topicTitle is required" });
        }
        const buildSlidePrompt = (title: string, description: string | undefined, notes: string | undefined) => {
            return `Create a 40-slide presentation about: "${title}".
    Description: "${description || ""}"
    Additional Notes: "${notes || ""}"
    Add the main title as the first slide, and then 20 slides with a title and body text. Include speaker notes for each slide.
      Respond ONLY with a JSON array (no markdown) in this format:
      [{ "title": "...", "body": "...", "notes": "..." }]`;
        }
        const prompt = buildSlidePrompt(topicTitle, topicDescription, notes);
        const aiResponse = await runModel(prompt);
        const slides = extractJsonArray(aiResponse);
        if (!Array.isArray(slides)) {
            return res.status(502).json({
                message: "AI returned invalid slide JSON. Please retry.",
            });
        }

        // Step 3: Build the PPTX
        // Support both ESM default export and CommonJS interop
        const PptxCtor = (PptxGenJS && (PptxGenJS.default || PptxGenJS)) as any;
        const pptx = new PptxCtor();
        for (const slide of slides) {
            const s = pptx.addSlide();
            s.addText(slide.title, {
                x: 0.5, y: 0.5, w: '90%', h: 1,
                fontSize: 28, bold: true, color: '1E2761'
            });
            s.addText(slide.body, {
                x: 0.5, y: 1.8, w: '90%', h: 4,
                fontSize: 16, color: '333333', valign: 'top'
            });
            if (slide.notes) s.addNotes(slide.notes);
        }

        // Step 4: Write to buffer and send
        const buffer = await pptx.write({ outputType: 'nodebuffer' });
        res.setHeader('Content-Type',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', 'attachment; filename="presentation.pptx"');
        res.send(buffer);
    } catch (error) {
        next(error);
    }
});

route.post("/teacher/ai-create-pdf", verifyRole.verifyTeacher, async (req, res, next) => {
    try {
        const { topicTitle, topicDescription, notes } = req.body;
        if (!topicTitle) {
            return res.status(400).json({ message: "topicTitle is required" });
        }
        const buildSlidePrompt = (title: string, description: string | undefined, notes: string | undefined) => {
            return `Write a clean HTML document about "${title}".
    Description: "${description || ""}"
    Additional Notes: "${notes || ""}"
      Include inline CSS. Output ONLY raw HTML starting with <!DOCTYPE html>.`;
        }
        const prompt = buildSlidePrompt(topicTitle, topicDescription, notes);
        const aiResponse = await runModel(prompt);
        const html = aiResponse.replace(/```html/gi, "").replace(/```/g, "").trim();
        if (!html.toLowerCase().includes("<html")) {
            return res.status(502).json({
                message: "AI returned invalid HTML. Please retry.",
            });
        }

        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({
            format: 'A4', printBackground: true,
            margin: { top: '1cm', bottom: '1cm', left: '1cm', right: '1cm' }
        });
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
        res.send(pdfBuffer);

    } catch (error) {
        next(error);
    }
});
export default route;
