import type { NextFunction, Request, Response } from "express";
import { runModel, runModelWithHistory } from "../ultis/claude.ts";
import PptxGenJS from "pptxgenjs";
import puppeteer from "puppeteer";
import AiRepo from "../repository/AiRepo.ts";

// ─── Helpers ────────────────────────────────────────────────────────────────

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

const extractJsonWrapper = (raw: string) => {
    let cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

    // Attempt to recover if the JSON was truncated mid-string
    if (!cleaned.endsWith("}") && !cleaned.endsWith("]")) {
        cleaned += '"}';
    }

    try {
        return JSON.parse(cleaned);
    } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (!match) return null;
        try {
            return JSON.parse(match[0]);
        } catch {
            return null;
        }
    }
};

const stripMarkdownFences = (value: string) =>
    value.replace(/```html/gi, "").replace(/```/g, "").trim();

// ─── PPTX slide templates ─────────────────────────────────────────────────

type SlideData = {
    title: string;
    body: string;
    notes?: string;
    templateType?: "title" | "bullets" | "two_column" | "image_focus" | "minimal" | "table";
    secondaryBody?: string;
    imageUrl?: string;
    tableData?: string[][];
};

const renderTitleSlide = (pptx: any, data: SlideData, slideNum: number, total: number) => {
    const slide = pptx.addSlide();
    slide.background = { color: "1E3A8A" };
    slide.addShape(pptx.ShapeType.ellipse, {
        x: 9.5, y: -0.8, w: 5.5, h: 5.5,
        fill: { color: "2563EB", transparency: 75 },
        line: { color: "2563EB", transparency: 100 },
    });
    slide.addText(data.title, {
        x: 1, y: 1.6, w: 11.3, h: 2.2,
        fontFace: "Aptos Display", fontSize: 44, bold: true,
        color: "FFFFFF", align: "center", valign: "middle", fit: "shrink",
    });
    if (data.body) {
        slide.addText(data.body, {
            x: 2, y: 4.0, w: 9.3, h: 1.0,
            fontFace: "Aptos", fontSize: 20, color: "BFDBFE",
            align: "center", valign: "middle", fit: "shrink",
        });
    }
    slide.addText(`${slideNum}/${total}`, {
        x: 11.95, y: 6.85, w: 0.9, h: 0.22,
        fontFace: "Aptos", fontSize: 10, color: "93C5FD", align: "right", margin: 0,
    });
    if (data.notes) slide.addNotes(data.notes);
    return slide;
};

const renderBulletsSlide = (pptx: any, data: SlideData, slideNum: number, total: number) => {
    const slide = pptx.addSlide();
    slide.background = { color: "F5F8FF" };
    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 13.333, h: 0.3,
        fill: { color: "1E3A8A" }, line: { color: "1E3A8A", transparency: 100 },
    });
    slide.addText(data.title, {
        x: 0.6, y: 0.5, w: 12.1, h: 0.9,
        fontFace: "Aptos Display", fontSize: 28, bold: true, color: "111827", fit: "shrink",
    });
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6, y: 1.6, w: 12.1, h: 5.0, rectRadius: 0.14,
        line: { color: "DBEAFE", pt: 1 }, fill: { color: "FFFFFF" },
        shadow: { type: "outer", color: "CBD5E1", angle: 45, blur: 3, distance: 2, opacity: 0.2 },
    });
    slide.addText(data.body, {
        x: 0.95, y: 1.9, w: 11.5, h: 4.4,
        fontFace: "Aptos", fontSize: 18, color: "1E293B",
        bullet: { type: "bullet", code: "25A0", color: "2563EB", size: 60 },
        breakLine: true, valign: "top", margin: 0, paraSpaceAfterPt: 12, fit: "shrink",
    });
    slide.addText(`${slideNum}/${total}`, {
        x: 11.95, y: 6.85, w: 0.9, h: 0.22,
        fontFace: "Aptos", fontSize: 10, color: "94A3B8", align: "right", margin: 0,
    });
    if (data.notes) slide.addNotes(data.notes);
    return slide;
};

const renderTwoColumnSlide = (pptx: any, data: SlideData, slideNum: number, total: number) => {
    const slide = pptx.addSlide();
    slide.background = { color: "F5F8FF" };
    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 13.333, h: 0.3,
        fill: { color: "2563EB" }, line: { color: "2563EB", transparency: 100 },
    });
    slide.addText(data.title, {
        x: 0.6, y: 0.45, w: 12.1, h: 0.9,
        fontFace: "Aptos Display", fontSize: 26, bold: true, color: "111827", fit: "shrink",
    });
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.5, y: 1.55, w: 6.0, h: 5.1, rectRadius: 0.14,
        fill: { color: "EFF6FF" }, line: { color: "BFDBFE", pt: 1 },
    });
    slide.addText(data.body, {
        x: 0.8, y: 1.8, w: 5.5, h: 4.6,
        fontFace: "Aptos", fontSize: 17, color: "1E293B",
        breakLine: true, valign: "top", margin: 0, paraSpaceAfterPt: 10, fit: "shrink",
    });
    const rightBody = data.secondaryBody || "";
    slide.addShape(pptx.ShapeType.roundRect, {
        x: 6.85, y: 1.55, w: 6.0, h: 5.1, rectRadius: 0.14,
        fill: { color: "F0FDF4" }, line: { color: "BBF7D0", pt: 1 },
    });
    slide.addText(rightBody, {
        x: 7.15, y: 1.8, w: 5.5, h: 4.6,
        fontFace: "Aptos", fontSize: 17, color: "14532D",
        breakLine: true, valign: "top", margin: 0, paraSpaceAfterPt: 10, fit: "shrink",
    });
    slide.addText(`${slideNum}/${total}`, {
        x: 11.95, y: 6.85, w: 0.9, h: 0.22,
        fontFace: "Aptos", fontSize: 10, color: "94A3B8", align: "right", margin: 0,
    });
    if (data.notes) slide.addNotes(data.notes);
    return slide;
};

const renderImageFocusSlide = (pptx: any, data: SlideData, slideNum: number, total: number) => {
    const slide = pptx.addSlide();
    slide.background = { color: "0F172A" };
    if (data.imageUrl) {
        slide.addImage({
            x: 0.4, y: 0.4, w: 7.5, h: 6.3,
            data: data.imageUrl, sizing: { type: "crop", w: 7.5, h: 6.3 }, rounding: true
        });
    } else {
        slide.addShape(pptx.ShapeType.roundRect, {
            x: 0.4, y: 0.4, w: 7.5, h: 6.3, rectRadius: 0.2,
            fill: { type: "gradient", stops: [{ color: "1D4ED8", position: 0 }, { color: "7C3AED", position: 100 }] },
            line: { color: "6D28D9", pt: 1.5 },
            shadow: { type: "outer", color: "000000", angle: 45, blur: 8, distance: 4, opacity: 0.4 },
        });
        slide.addText("[ Image / Diagram Area ]", {
            x: 0.6, y: 3.1, w: 7.1, h: 0.5,
            fontFace: "Aptos", fontSize: 13, color: "C4B5FD", align: "center", italic: true,
        });
    }
    slide.addText(data.title, {
        x: 8.3, y: 0.5, w: 4.7, h: 1.4,
        fontFace: "Aptos Display", fontSize: 26, bold: true, color: "FFFFFF", valign: "top", fit: "shrink",
    });
    slide.addShape(pptx.ShapeType.rect, {
        x: 8.3, y: 2.0, w: 0.5, h: 0.06,
        fill: { color: "7C3AED" }, line: { color: "7C3AED", transparency: 100 },
    });
    slide.addText(data.body, {
        x: 8.3, y: 2.2, w: 4.65, h: 4.4,
        fontFace: "Aptos", fontSize: 17, color: "E2E8F0",
        breakLine: true, valign: "top", margin: 0, paraSpaceAfterPt: 10, fit: "shrink",
    });
    slide.addText(`${slideNum}/${total}`, {
        x: 11.95, y: 6.85, w: 0.9, h: 0.22,
        fontFace: "Aptos", fontSize: 10, color: "475569", align: "right", margin: 0,
    });
    if (data.notes) slide.addNotes(data.notes);
    return slide;
};

const renderTableSlide = (pptx: any, data: SlideData, slideNum: number, total: number) => {
    const slide = pptx.addSlide();
    slide.background = { color: "F8FAFC" };
    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 13.333, h: 0.3,
        fill: { color: "0F766E" }, line: { color: "0F766E", transparency: 100 },
    });
    slide.addText(data.title, {
        x: 0.6, y: 0.5, w: 12.1, h: 0.9,
        fontFace: "Aptos Display", fontSize: 28, bold: true, color: "0F172A", fit: "shrink",
    });
    if (data.tableData && data.tableData.length > 0) {
        const firstRow = data.tableData[0];
        if (firstRow) {
            const headerRow = firstRow.map((cell: string) => ({
                text: cell,
                options: { fill: "D4D4D8", color: "18181B", bold: true, align: "center", valign: "middle", fontFace: "Aptos", fontSize: 16 }
            }));
            const bodyRows = data.tableData.slice(1).map(row =>
                row.map((cell: string) => ({
                    text: cell,
                    options: { color: "27272A", valign: "middle", fontFace: "Aptos", fontSize: 14 }
                }))
            );
            slide.addTable([headerRow, ...bodyRows], {
                x: 0.6, y: 1.6, w: 12.1, h: 4.8,
                border: { pt: 1, color: "E4E4E7" }, fill: "FFFFFF", rowH: 0.5, valign: "middle"
            });
        }
    }
    slide.addText(`${slideNum}/${total}`, {
        x: 11.95, y: 6.85, w: 0.9, h: 0.22,
        fontFace: "Aptos", fontSize: 10, color: "94A3B8", align: "right", margin: 0,
    });
    if (data.notes) slide.addNotes(data.notes);
    return slide;
};

const renderMinimalSlide = (pptx: any, data: SlideData, slideNum: number, total: number) => {
    const slide = pptx.addSlide();
    slide.background = { color: "FFFFFF" };
    slide.addShape(pptx.ShapeType.rect, {
        x: 0, y: 0, w: 13.333, h: 0.12,
        fill: { color: "DBEAFE" }, line: { color: "DBEAFE", transparency: 100 },
    });
    slide.addText(data.title, {
        x: 0.8, y: 0.3, w: 11.7, h: 0.5,
        fontFace: "Aptos", fontSize: 13, bold: true, color: "2563EB", align: "center",
    });
    slide.addText(data.body, {
        x: 1, y: 1.2, w: 11.3, h: 5.0,
        fontFace: "Aptos Display", fontSize: 36, color: "111827",
        align: "center", valign: "middle", breakLine: true, fit: "shrink",
    });
    slide.addText(`${slideNum}/${total}`, {
        x: 11.95, y: 6.85, w: 0.9, h: 0.22,
        fontFace: "Aptos", fontSize: 10, color: "CBD5E1", align: "right", margin: 0,
    });
    if (data.notes) slide.addNotes(data.notes);
    return slide;
};

const renderSlide = (pptx: any, data: SlideData, slideNum: number, total: number) => {
    switch (data.templateType) {
        case "title": return renderTitleSlide(pptx, data, slideNum, total);
        case "two_column": return renderTwoColumnSlide(pptx, data, slideNum, total);
        case "image_focus": return renderImageFocusSlide(pptx, data, slideNum, total);
        case "table": return renderTableSlide(pptx, data, slideNum, total);
        case "minimal": return renderMinimalSlide(pptx, data, slideNum, total);
        case "bullets":
        default: return renderBulletsSlide(pptx, data, slideNum, total);
    }
};

// ─── Helper: build conversation history for AI ──────────────────────────────

const buildConversationHistory = (messages: { responder: string; content: string; at: Date }[]) => {
    return messages.map(m => ({
        content: m.content,
        sender: m.responder as 'user' | 'ai',
    }));
};

// ─── Controller ──────────────────────────────────────────────────────────────

class ClaudeMemeController {
    /**
     * Student chat — uses session + request (messages), NO AiContent
     * Accepts optional courseContext to give AI knowledge of what the student is studying
     */
    async studentChat(req: Request, res: Response, next: NextFunction) {
        try {
            const { prompt, courseContext } = req.body;
            const userId = (req as any).user?.id ?? null;
            if (!prompt) return res.status(400).json({ message: "Prompt is required" });
            if (!userId) return res.status(401).json({ message: "User not authenticated" });

            // 1. Get or create session (12h lifecycle)
            const session = await AiRepo.getOrCreateSession(userId);

            // 2. Get or create request for this session
            const request = await AiRepo.getOrCreateRequest(session._id, userId, "chat");

            // 3. Push user message
            await AiRepo.pushMessage(request._id, 'user', prompt);

            // 4. Reload messages to include the new one
            const updatedRequest = await AiRepo.getOrCreateRequest(session._id, userId, "chat");
            const history = buildConversationHistory(updatedRequest.messages);

            // 5. Build system prompt with course context if available
            const systemPrompt = courseContext
                ? `You are a helpful AI tutor for a student. The student is currently studying the following course:\n\n${courseContext}\n\nUse this context to give relevant, accurate answers about the course topics. Answer in the same language the student uses.`
                : `You are a helpful AI tutor. Answer the student's question clearly and helpfully. Answer in the same language the student uses.`;

            // 6. Build full history with system prompt prepended
            const fullHistory = [
                { content: systemPrompt, sender: 'user' as const },
                ...history
            ];

            // 7. Call AI with full conversation history
            const result = await runModelWithHistory(fullHistory);

            // 8. Push AI response (just the text)
            await AiRepo.pushMessage(request._id, 'ai', result.text);

            // 9. Accumulate token usage on session
            await AiRepo.addTokenUsage(session._id, result.inputTokens, result.outputTokens);

            res.json({ message: result.text });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Teacher quiz generation — session + request + AiContent
     * Flow: getSession → getRequest → getContent → push user msg → call AI with history → update request + content
     */
    async createQuiz(req: Request, res: Response, next: NextFunction) {
        try {
            const { topicTitle, topicDescription, count = 5, mcCount = 5, tfCount = 0, notes } = req.body;
            if (!topicTitle) return res.status(400).json({ message: "topicTitle is required" });
            const userId = (req as any).user?.id ?? null;
            if (!userId) return res.status(401).json({ message: "User not authenticated" });

            // 1. Get or create session
            const session = await AiRepo.getOrCreateSession(userId);

            // 2. Get or create request for this type within session
            const request = await AiRepo.getOrCreateRequest(session._id, userId, "quiz");

            // 3. Get or create AiContent (before AI call)
            const content = await AiRepo.getOrCreateContent(request._id, "quiz");

            // 4. Push user message
            await AiRepo.pushMessage(request._id, 'user', notes || topicTitle);

            // 5. Reload request to get full messages array
            const updatedRequest = await AiRepo.getOrCreateRequest(session._id, userId, "quiz");

            const total = Math.max(1, Number(count) || 5);
            const multipleChoice = Math.max(0, Number(mcCount) || 0);
            const trueFalse = Math.max(0, Number(tfCount) || 0);
            const adjustedTotal = Math.max(total, multipleChoice + trueFalse);

            const systemPrompt = `You are an assistant that generates teacher-editable quizzes. Produce ONE valid JSON object only (no commentary, no markdown) with this exact shape:

{
  "chat_message": "A short, friendly conversational message saying here is the quiz.",
  "content": {
    "title": "<quiz title>",
    "type": "interactive",
    "keyword": "<optional short keyword|null>",
    "status": true,
    "questions": [
      {
        "title": "question text",
        "type": "multiple_choice|true_false",
        "options": ["A","B","C"],
        "correct_index": 0
      }
    ]
  }
}

Constraints:
- Return exactly ${adjustedTotal} questions in the "questions" array (no more, no less).
- Include exactly ${trueFalse} true/false questions with type "true_false" and options exactly ["True","False"].
- Include exactly ${multipleChoice} multiple-choice questions with type "multiple_choice" and 3–5 unique options.
- "correct_index" must be a 0-based index into the options array.
- Keep all values JSON-safe strings (no HTML).
- Topic context: Title: "${topicTitle}" Description: "${topicDescription || ""}".
- Content value: User request (IMPORTANT): generated content must fit user request:"${notes}".
- Output JSON only, no surrounding text or explanation.`;

            // 6. Build conversation history and prepend system prompt
            const history = buildConversationHistory(updatedRequest.messages);
            const fullHistory = [{ content: systemPrompt, sender: 'user' as const }, ...history];

            // 7. Call AI with full conversation history
            const result = await runModelWithHistory(fullHistory);
            console.log("----- AI QUIZ RAW RESPONSE -----");
            console.log(result.text);
            console.log("--------------------------------");

            const parsed = extractJsonWrapper(result.text);
            if (!parsed || !parsed.content) {
                return res.status(502).json({ message: "Failed to generate usable quiz format." });
            }

            // 8. Push only chat_message to request (not the full content)
            const chatMsg = parsed.chat_message || "Here is the quiz you requested.";
            await AiRepo.pushMessage(request._id, 'ai', chatMsg);

            // 9. Accumulate token usage on session
            await AiRepo.addTokenUsage(session._id, result.inputTokens, result.outputTokens);

            // 10. Update AiContent with latest
            await AiRepo.updateContent(content._id, {
                title: parsed.content.title || topicTitle,
                questionCount: parsed.content.questions?.length || 0,
                content: parsed.content,
                prompt: notes,
                full_response: result.text,
            });

            return res.json({
                message: chatMsg,
                rawContent: JSON.stringify(parsed.content)
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Teacher slide generation — session + request + AiContent
     * Flow: getSession → getRequest → getContent → push user msg → call AI with history → update request + content
     */
    async createSlide(req: Request, res: Response, next: NextFunction) {
        try {
            const { topicTitle, topicDescription, notes } = req.body;
            if (!topicTitle) return res.status(400).json({ message: "topicTitle is required" });
            const userId = (req as any).user?.id ?? null;
            if (!userId) return res.status(401).json({ message: "User not authenticated" });

            // 1. Get or create session
            const session = await AiRepo.getOrCreateSession(userId);

            // 2. Get or create request for this type within session
            const request = await AiRepo.getOrCreateRequest(session._id, userId, "slide");

            // 3. Get or create AiContent (before AI call)
            const content = await AiRepo.getOrCreateContent(request._id, "slide");

            // 4. Push user message
            await AiRepo.pushMessage(request._id, 'user', notes || topicTitle);

            // 5. Reload request to get full messages array
            const updatedRequest = await AiRepo.getOrCreateRequest(session._id, userId, "slide");

            const systemPrompt = `You are a professional presentation designer. Create a 10-slide deck about: "${topicTitle}".
Description: "${topicDescription || ""}"
User style request: "${notes || "standard educational layout"}"

CRITICAL: You must honour the user's style request above when choosing templates — e.g. if they say "more visual", prefer image_focus; if "minimal", prefer minimal; if "to the point", prefer minimal or bullets.

Available templateType values (pick the BEST fit per slide):
- "title"       : Large centred title + one-line subtitle. Use for chapter headings.
- "bullets"     : Header + bulleted list. Best for lists of facts or steps.
- "two_column"  : Header + two side-by-side panels. Use for comparisons or pros/cons.
- "image_focus" : Large image/diagram on the left, short text on the right. Use when visuals matter most.
- "table"       : Data table. Use for structured, tabular data, comparisons, or schedules.
- "minimal"     : One big statement/quote centred on a white slide. Use for key insights.

Rules:
- First slide MUST use templateType "title".
- Vary templates throughout the deck — do NOT use the same template more than 3 times in a row.
- For "two_column" slides, populate both "body" (left panel) and "secondaryBody" (right panel).
- For "image_focus" slides, you MUST provide a real, copyright-free image URL from Flickr using "https://loremflickr.com/800/600/{keyword}" where {keyword} is a single english word (e.g., https://loremflickr.com/800/600/chemistry) in the "imageUrl" field.
- For "table" slides, you MUST provide a "tableData" field which is an array of arrays of strings. The first inner array is the header row.
- Keep "body" concise — bullet points separated by newlines work best.
- Include "notes" for the speaker on every slide.
- Respond ONLY with a valid JSON object in this EXACT format (no markdown):

{
  "chat_message": "A short, friendly conversational message saying here are the slides.",
  "content": [
    {
      "templateType": "title|bullets|two_column|image_focus|table|minimal",
      "title": "...",
      "body": "...",
      "secondaryBody": "...",
      "imageUrl": "https://loremflickr.com/800/600/keyword",
      "tableData": [ ["Header1", "Header2"], ["Row1Col1", "Row1Col2"] ],
      "notes": "..."
    }
  ]
}`;

            // 6. Build conversation history and prepend system prompt
            const history = buildConversationHistory(updatedRequest.messages);
            const fullHistory = [{ content: systemPrompt, sender: 'user' as const }, ...history];

            // 7. Call AI with full conversation history
            const result = await runModelWithHistory(fullHistory);

            const parsed = extractJsonWrapper(result.text);
            if (!parsed || !Array.isArray(parsed.content)) {
                return res.status(502).json({ message: "AI returned invalid JSON structure. Please retry." });
            }

            const slides = parsed.content;
            const chatMessage = parsed.chat_message || "Here is your slide deck!";

            // 8. Push only chat_message to request (not the full content)
            await AiRepo.pushMessage(request._id, 'ai', chatMessage);

            // 9. Accumulate token usage on session
            await AiRepo.addTokenUsage(session._id, result.inputTokens, result.outputTokens);

            // Build PPTX
            const PptxCtor = (PptxGenJS && ((PptxGenJS as any).default || PptxGenJS)) as any;
            const pptx = new PptxCtor();
            pptx.layout = "LAYOUT_WIDE";
            pptx.author = "Teacher AI Content Tool";
            pptx.company = "swd392backEND";
            pptx.subject = `AI presentation for ${topicTitle}`;
            pptx.title = `AI Presentation - ${topicTitle}`;
            pptx.theme = { headFontFace: "Aptos Display", bodyFontFace: "Aptos", lang: "en-US" };

            const normalizedSlides: SlideData[] = slides.map((slide: any, index: number) => {
                const res: SlideData = {
                    templateType: slide?.templateType || (index === 0 ? "title" : "bullets"),
                    title: String(slide?.title || `Slide ${index + 1}`),
                    body: String(slide?.body || ""),
                };
                if (slide?.secondaryBody) res.secondaryBody = String(slide.secondaryBody);
                if (slide?.imageUrl) res.imageUrl = String(slide.imageUrl);
                if (Array.isArray(slide?.tableData)) res.tableData = slide.tableData;
                if (slide?.notes) res.notes = String(slide.notes);
                return res;
            });

            for (const slideData of normalizedSlides) {
                if (slideData.imageUrl && slideData.imageUrl.startsWith("http")) {
                    try {
                        const imgRes = await fetch(slideData.imageUrl);
                        if (imgRes.ok) {
                            const arrayBuffer = await imgRes.arrayBuffer();
                            const base64 = Buffer.from(arrayBuffer).toString('base64');
                            slideData.imageUrl = `data:image/jpeg;base64,${base64}`;
                        } else {
                            delete slideData.imageUrl;
                        }
                    } catch {
                        delete slideData.imageUrl;
                    }
                }
            }

            normalizedSlides.forEach((slideData, index) => {
                renderSlide(pptx, slideData, index + 1, normalizedSlides.length);
            });

            if (normalizedSlides.length === 0) {
                const emptySlide = pptx.addSlide();
                emptySlide.background = { color: "F5F8FF" };
                emptySlide.addText(`No slides were generated for "${topicTitle}"`, {
                    x: 1, y: 2.5, w: 11, h: 1,
                    fontFace: "Aptos Display", fontSize: 24, bold: true,
                    color: "1E3A8A", align: "center",
                });
            }

            const buffer = await pptx.write({ outputType: "nodebuffer" });
            const fileBase64 = buffer.toString('base64');

            // Update AiContent with the generated file
            await AiRepo.updateContent(content._id, {
                title: topicTitle,
                slideCount: slides.length,
                templates: slides.map((s: any) => s.templateType),
                content: slides,
                fileBase64,
                full_response: result.text,
            });

            return res.json({
                message: chatMessage,
                fileBase64,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Teacher PDF generation — session + request + AiContent
     * Flow: getSession → getRequest → getContent → push user msg → call AI with history → update request + content
     */
    async createPdf(req: Request, res: Response, next: NextFunction) {
        try {
            const { topicTitle, topicDescription, notes } = req.body;
            if (!topicTitle) return res.status(400).json({ message: "topicTitle is required" });
            const userId = (req as any).user?.id ?? null;
            if (!userId) return res.status(401).json({ message: "User not authenticated" });

            // 1. Get or create session
            const session = await AiRepo.getOrCreateSession(userId);

            // 2. Get or create request for this type within session
            const request = await AiRepo.getOrCreateRequest(session._id, userId, "pdf");

            // 3. Get or create AiContent (before AI call)
            const content = await AiRepo.getOrCreateContent(request._id, "pdf");

            // 4. Push user message
            await AiRepo.pushMessage(request._id, 'user', notes || topicTitle);

            // 5. Reload request to get full messages array
            const updatedRequest = await AiRepo.getOrCreateRequest(session._id, userId, "pdf");

            const systemPrompt = `You are a professional document designer. Create a complete, self-contained HTML document about "${topicTitle}".
Topic description: "${topicDescription || ""}"
User style request: "${notes || "standard educational document"}"

Design rules you MUST follow:
1. The user's style request above overrides everything — if they say "dark background", use dark colours; if "minimalist", strip all decorations. However, default to a PLAIN WHITE background for the body. ABSOLUTELY NO PURPLE BORDERS, no colorful sidebars, and no "AI purple" colors unless EXPLICITLY requested. Keep it strictly professional, black/dark-gray text on white backgrounds.
2. Embed ALL CSS inside a <style> tag in <head>. No external libraries.
3. Include real educational content — headings, paragraphs, lists, tables, and inline SVG diagrams/charts wherever they add value.
4. To include REAL copyright-free images from the open internet, use '<img src="https://loremflickr.com/800/600/{keyword}" alt="..." />' where {keyword} is a single English word describing the photo (e.g. "chemistry"). Do this generously where it adds value.
5. Layout must be print-friendly (professional A4 proportions, max-width ~900px, readability is priority).
6. CSS PRINT RULES: You MUST include CSS rules to prevent awkward page breaks. Use \`page-break-inside: avoid;\` and \`break-inside: avoid;\` on ALL containers, boxes, tables, and list items. Keep padding reasonable (e.g. 15-20px max for boxes, small margins) so it doesn't waste space.
7. Start the document with <!DOCTYPE html> and end with </html>.
8. CRITICAL: Keep the document concise. Do NOT exceed 2000 words total. If you write too much, the output will truncate and fail.
9. ALWAYS include a section at the very end titled "Sources & References" (or similar in the relevant language) citing a few realistic or actual sources (URLs, books) for the generated content.
10. Respond ONLY with a valid JSON object in this EXACT format (no markdown):

{
  "chat_message": "A short, friendly conversational message saying here is the PDF.",
  "content": "<!DOCTYPE html><html>...</html>"
}`;

            // 6. Build conversation history and prepend system prompt
            const history = buildConversationHistory(updatedRequest.messages);
            const fullHistory = [{ content: systemPrompt, sender: 'user' as const }, ...history];

            // 7. Call AI with full conversation history
            const result = await runModelWithHistory(fullHistory);
            console.log("----- AI PDF RAW RESPONSE -----");
            console.log(result.text);
            console.log("-------------------------------");

            const parsed = extractJsonWrapper(result.text);
            if (!parsed || typeof parsed.content !== "string") {
                return res.status(502).json({ message: "AI returned invalid JSON structure. Please retry." });
            }

            const chatMessage = parsed.chat_message || "Here is your PDF document!";
            let html = stripMarkdownFences(parsed.content);

            // 8. Push only chat_message to request (not the full content)
            await AiRepo.pushMessage(request._id, 'ai', chatMessage);

            // 9. Accumulate token usage on session
            await AiRepo.addTokenUsage(session._id, result.inputTokens, result.outputTokens);

            if (!html.toLowerCase().includes("<html")) {
                html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${topicTitle}</title></head><body>${html}</body></html>`;
            }

            if (!html.toLowerCase().includes("<html")) {
                return res.status(502).json({ message: "AI returned invalid HTML. Please retry." });
            }

            const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
            const page = await browser.newPage();
            await page.setViewport({ width: 1440, height: 1920, deviceScaleFactor: 2 });
            await page.setContent(html, { waitUntil: "networkidle0" });
            await page.emulateMediaType("screen");
            const pdfBuffer = await page.pdf({
                format: "A4",
                printBackground: true,
                margin: { top: "1.5cm", bottom: "1.5cm", left: "1.5cm", right: "1.5cm" },
            });
            await browser.close();

            const fileBase64 = Buffer.from(pdfBuffer).toString('base64');

            // 9. Update AiContent with latest
            await AiRepo.updateContent(content._id, {
                title: topicTitle,
                htmlLength: html.length,
                content: html,
                fileBase64,
                full_response: result.text,
            });

            return res.json({
                message: chatMessage,
                fileBase64,
            });
        } catch (error) {
            next(error);
        }
    }

    // ─── History endpoints (unchanged) ───────────────────────────────────────

    async getTeacherHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(400).json({ message: "User ID not found in token" });
            const requests = await AiRepo.getRequestsByUser(userId);
            return res.json({ data: requests });
        } catch (error) {
            next(error);
        }
    }

    async getStudentHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(400).json({ message: "User ID not found in token" });
            const requests = await AiRepo.getRequestsByUser(userId);
            return res.json({ data: requests });
        } catch (error) {
            next(error);
        }
    }

    async getAdminHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const page = Math.max(1, Number(req.query.page as string) || 1);
            const result = await AiRepo.getAllRequests(page, userId as string);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getAdminHistoryContent(req: Request, res: Response, next: NextFunction) {
        try {
            const { requestId } = req.params;
            const content = await AiRepo.getContentByRequest(String(requestId));
            return res.json({ data: content });
        } catch (error) {
            next(error);
        }
    }
    async getLatestAiSession(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(400).json({ message: "User ID not found in token" });
            const session = await AiRepo.getLatestSession(userId);
            return res.json({ data: session });
        } catch (error) {
            next(error);
        }
    }
}

export default new ClaudeMemeController();
