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

const stripMarkdownFences = (value: string) => value.replace(/```html/gi, "").replace(/```/g, "").trim();

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const buildFreeImageSvg = (title: string) => {
    const safeTitle = escapeHtml(title);
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" fill="none">
            <defs>
                <linearGradient id="g1" x1="80" y1="80" x2="1120" y2="595" gradientUnits="userSpaceOnUse">
                    <stop offset="0" stop-color="#1E3A8A"/>
                    <stop offset="0.5" stop-color="#2563EB"/>
                    <stop offset="1" stop-color="#60A5FA"/>
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.94"/>
                    <stop offset="1" stop-color="#EAF2FF" stop-opacity="0.82"/>
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#0F172A" flood-opacity="0.18"/>
                </filter>
            </defs>
            <rect width="1200" height="675" rx="48" fill="url(#g1)"/>
            <circle cx="1020" cy="118" r="156" fill="#FFFFFF" fill-opacity="0.12"/>
            <circle cx="170" cy="560" r="160" fill="#FFFFFF" fill-opacity="0.1"/>
            <path d="M120 520C240 430 346 410 470 458C590 506 706 594 840 564C946 539 1022 440 1100 350V675H120V520Z" fill="#FFFFFF" fill-opacity="0.12"/>
            <rect x="88" y="86" width="524" height="430" rx="36" fill="url(#g2)" filter="url(#shadow)"/>
            <rect x="124" y="124" width="180" height="18" rx="9" fill="#1E3A8A" fill-opacity="0.26"/>
            <rect x="124" y="160" width="280" height="24" rx="12" fill="#1E3A8A" fill-opacity="0.88"/>
            <rect x="124" y="204" width="344" height="16" rx="8" fill="#334155" fill-opacity="0.22"/>
            <rect x="124" y="234" width="300" height="16" rx="8" fill="#334155" fill-opacity="0.18"/>
            <rect x="124" y="270" width="420" height="182" rx="24" fill="#DCEAFE"/>
            <path d="M150 414L236 348L304 384L382 304L456 336L508 286" stroke="#2563EB" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="236" cy="348" r="16" fill="#1E3A8A"/>
            <circle cx="304" cy="384" r="16" fill="#1E3A8A"/>
            <circle cx="382" cy="304" r="16" fill="#1E3A8A"/>
            <circle cx="456" cy="336" r="16" fill="#1E3A8A"/>
            <circle cx="508" cy="286" r="16" fill="#1E3A8A"/>
            <rect x="676" y="136" width="392" height="72" rx="24" fill="#FFFFFF" fill-opacity="0.16"/>
            <rect x="676" y="228" width="332" height="22" rx="11" fill="#FFFFFF" fill-opacity="0.92"/>
            <rect x="676" y="264" width="272" height="18" rx="9" fill="#FFFFFF" fill-opacity="0.68"/>
            <rect x="676" y="312" width="168" height="56" rx="18" fill="#FFFFFF" fill-opacity="0.14"/>
            <rect x="864" y="312" width="204" height="56" rx="18" fill="#FFFFFF" fill-opacity="0.14"/>
            <rect x="676" y="390" width="392" height="160" rx="30" fill="#0F172A" fill-opacity="0.16"/>
            <text x="706" y="184" fill="#FFFFFF" fill-opacity="0.92" font-size="34" font-family="Segoe UI, Arial, sans-serif" font-weight="700">${safeTitle}</text>
            <text x="706" y="437" fill="#FFFFFF" fill-opacity="0.88" font-size="20" font-family="Segoe UI, Arial, sans-serif">AI-generated educational material</text>
            <text x="706" y="466" fill="#FFFFFF" fill-opacity="0.72" font-size="16" font-family="Segoe UI, Arial, sans-serif">Clean, branded, copyright-free visual asset</text>
        </svg>
    `;

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
};

const buildPolishedPdfHtml = (title: string, description: string | undefined, rawHtml: string) => {
    const cleanedHtml = stripMarkdownFences(rawHtml);
    const illustration = buildFreeImageSvg(title);
    const content = cleanedHtml.toLowerCase().includes("<html")
        ? cleanedHtml
        : `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${cleanedHtml}</body></html>`;

    const baseStyles = `
        <style>
            :root {
                color-scheme: light;
                --bg: #f5f7fb;
                --panel: rgba(255, 255, 255, 0.88);
                --panel-strong: #ffffff;
                --text: #182235;
                --muted: #5d6b82;
                --accent: #1e3a8a;
                --accent-2: #2563eb;
                --line: rgba(30, 58, 138, 0.12);
                --shadow: 0 22px 60px rgba(15, 23, 42, 0.14);
                --radius-xl: 28px;
                --radius-lg: 20px;
                --radius-md: 16px;
            }

            * {
                box-sizing: border-box;
            }

            html, body {
                margin: 0;
                padding: 0;
                background:
                    radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 36%),
                    radial-gradient(circle at top right, rgba(30, 58, 138, 0.10), transparent 28%),
                    linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
                color: var(--text);
                font-family: Inter, "Segoe UI", Arial, sans-serif;
            }

            body {
                padding: 28px;
            }

            .page-shell {
                max-width: 960px;
                margin: 0 auto;
            }

            .hero {
                background: linear-gradient(135deg, rgba(30, 58, 138, 0.98), rgba(37, 99, 235, 0.94));
                color: #ffffff;
                border-radius: var(--radius-xl);
                padding: 28px 30px;
                box-shadow: var(--shadow);
                position: relative;
                overflow: hidden;
            }

            .hero::after {
                content: "";
                position: absolute;
                inset: auto -10% -45% auto;
                width: 240px;
                height: 240px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.12);
                filter: blur(6px);
            }

            .eyebrow {
                text-transform: uppercase;
                letter-spacing: 0.18em;
                font-size: 12px;
                opacity: 0.82;
                margin: 0 0 10px;
            }

            h1, h2, h3 {
                margin: 0 0 0.6em;
                line-height: 1.15;
            }

            h1 {
                font-size: 34px;
                letter-spacing: -0.03em;
            }

            h2 {
                font-size: 24px;
                margin-top: 2.1rem;
            }

            h3 {
                font-size: 19px;
                margin-top: 1.5rem;
            }

            p, li {
                font-size: 15.5px;
                line-height: 1.75;
                color: var(--text);
            }

            .summary {
                margin-top: 18px;
                padding: 18px 20px;
                border-radius: var(--radius-lg);
                background: var(--panel);
                border: 1px solid rgba(255, 255, 255, 0.28);
                backdrop-filter: blur(16px);
                box-shadow: var(--shadow);
            }

            .content {
                margin-top: 22px;
                background: var(--panel-strong);
                border: 1px solid rgba(30, 58, 138, 0.08);
                border-radius: var(--radius-xl);
                padding: 28px 30px;
                box-shadow: 0 16px 42px rgba(15, 23, 42, 0.08);
            }

            blockquote {
                margin: 1.25rem 0;
                padding: 1rem 1.15rem;
                border-left: 5px solid var(--accent-2);
                background: #eff6ff;
                color: #1e293b;
                border-radius: 0 14px 14px 0;
            }

            code {
                background: #eaf0ff;
                color: #12306f;
                padding: 0.15rem 0.4rem;
                border-radius: 8px;
                font-size: 0.95em;
            }

            pre {
                background: #0f172a;
                color: #e2e8f0;
                padding: 1rem 1.1rem;
                border-radius: 18px;
                overflow-x: auto;
                box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06);
            }

            pre code {
                background: transparent;
                color: inherit;
                padding: 0;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin: 1.2rem 0;
                overflow: hidden;
                border-radius: 18px;
                box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
            }

            th, td {
                padding: 12px 14px;
                border-bottom: 1px solid var(--line);
                text-align: left;
                vertical-align: top;
            }

            th {
                background: #dbeafe;
                color: #12306f;
                font-weight: 700;
            }

            ul, ol {
                padding-left: 1.35rem;
            }

            img {
                max-width: 100%;
                height: auto;
                border-radius: 18px;
                box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
                margin: 1rem 0;
            }

            hr {
                border: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(30, 58, 138, 0.24), transparent);
                margin: 1.6rem 0;
            }

            .footer {
                margin-top: 18px;
                color: var(--muted);
                font-size: 12.5px;
                letter-spacing: 0.02em;
                text-align: right;
            }

            .hero-grid {
                display: grid;
                grid-template-columns: 1.2fr 0.9fr;
                gap: 20px;
                align-items: center;
                position: relative;
                z-index: 1;
            }

            .hero-art {
                width: 100%;
                max-width: 320px;
                justify-self: end;
                filter: drop-shadow(0 22px 30px rgba(15, 23, 42, 0.22));
            }

            .hero-badges {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-top: 14px;
            }

            .hero-badge {
                background: rgba(255, 255, 255, 0.16);
                border: 1px solid rgba(255, 255, 255, 0.22);
                padding: 8px 12px;
                border-radius: 999px;
                font-size: 12px;
                letter-spacing: 0.02em;
            }

            @media print {
                body {
                    padding: 0;
                    background: #ffffff;
                }

                .hero, .summary, .content {
                    box-shadow: none;
                }

                .page-shell {
                    max-width: none;
                    margin: 0;
                }
            }
        </style>
    `;

    if (content.toLowerCase().includes("</head>")) {
        return content.replace("</head>", `${baseStyles}</head>`);
    }

    if (content.toLowerCase().includes("<head>")) {
        return content.replace("<head>", `<head>${baseStyles}`);
    }

    return `<!DOCTYPE html><html><head><meta charset="utf-8">${baseStyles}<meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${content}</body></html>`;
};

const buildPdfHtmlShell = (title: string, description: string | undefined, rawHtml: string) => {
    const contentHtml = stripMarkdownFences(rawHtml);
    const illustration = buildFreeImageSvg(title);
    const renderedContent = contentHtml.toLowerCase().includes("<html")
        ? contentHtml
        : `<section class="content">${contentHtml}</section>`;

    const safeDescription = description?.trim() || "A polished AI-generated handout.";

    return buildPolishedPdfHtml(
        title,
        description,
        `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
</head>
<body>
    <div class="page-shell">
        <header class="hero">
            <p class="eyebrow">AI Generated Document</p>
            <div class="hero-grid">
                <div>
                    <h1>${escapeHtml(title)}</h1>
                    <p style="margin: 0; max-width: 760px; font-size: 16px; line-height: 1.7; opacity: 0.92;">${escapeHtml(safeDescription)}</p>
                    <div class="hero-badges">
                        <span class="hero-badge">Polished layout</span>
                        <span class="hero-badge">Free illustration</span>
                        <span class="hero-badge">Print-friendly</span>
                    </div>
                </div>
                <img class="hero-art" src="${illustration}" alt="Decorative AI illustration" />
            </div>
        </header>
        <section class="summary">
            <strong style="display:block; margin-bottom: 8px; color: var(--accent);">Overview</strong>
            <div style="color: var(--muted); line-height: 1.8;">This document was formatted for readability with improved spacing, typography, and print styling.</div>
        </section>
        ${renderedContent}
        <div class="footer">Generated by the teacher AI content tool</div>
    </div>
</body>
</html>`
    );
};

const addBeautifiedSlide = (pptx: any, slideData: any, slideNumber: number, totalSlides: number, title: string) => {
    const slide = pptx.addSlide();
    slide.background = { color: "F5F8FF" };
    const illustration = buildFreeImageSvg(`${title} - ${slideData?.title || `Slide ${slideNumber}`}`);

    slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 13.333,
        h: 0.34,
        line: { color: "1E3A8A", transparency: 100 },
        fill: { color: "1E3A8A" },
    });

    slide.addShape(pptx.ShapeType.rect, {
        x: 0.45,
        y: 0.55,
        w: 12.4,
        h: 0.22,
        line: { color: "2563EB", transparency: 100 },
        fill: { color: "2563EB" },
    });

    slide.addText(title, {
        x: 0.6,
        y: 0.82,
        w: 8.9,
        h: 0.6,
        fontFace: "Aptos Display",
        fontSize: 12,
        bold: true,
        color: "1E3A8A",
        margin: 0,
    });

    slide.addText(String(slideData?.title || `Slide ${slideNumber}`), {
        x: 0.6,
        y: 1.2,
        w: 11.5,
        h: 0.9,
        fontFace: "Aptos Display",
        fontSize: 28,
        bold: true,
        color: "111827",
        margin: 0,
        fit: "shrink",
    });

    slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: 2.15,
        w: 8.15,
        h: 4.45,
        rectRadius: 0.16,
        line: { color: "D8E2F3", pt: 1 },
        fill: { color: "FFFFFF", transparency: 0 },
        shadow: { type: "outer", color: "94A3B8", angle: 45, blur: 2, distance: 2, opacity: 0.18 },
    });

    slide.addText(String(slideData?.body || ""), {
        x: 0.95,
        y: 2.45,
        w: 7.55,
        h: 3.85,
        fontFace: "Aptos",
        fontSize: 18,
        color: "334155",
        breakLine: true,
        valign: "top",
        margin: 0,
        fit: "shrink",
        paraSpaceAfterPt: 10,
    });

    slide.addText(`${slideNumber}/${totalSlides}`, {
        x: 11.95,
        y: 6.85,
        w: 0.9,
        h: 0.22,
        fontFace: "Aptos",
        fontSize: 10,
        color: "64748B",
        align: "right",
        margin: 0,
    });

    slide.addShape(pptx.ShapeType.roundRect, {
        x: 9.05,
        y: 2.15,
        w: 3.65,
        h: 4.45,
        rectRadius: 0.14,
        line: { color: "D8E2F3", pt: 1 },
        fill: { color: "FFFFFF", transparency: 0 },
        shadow: { type: "outer", color: "94A3B8", angle: 45, blur: 2, distance: 2, opacity: 0.14 },
    });

    slide.addImage({
        data: illustration,
        x: 9.25,
        y: 2.35,
        w: 3.25,
        h: 1.82,
    });

    slide.addText("Free visual asset", {
        x: 9.25,
        y: 4.32,
        w: 3.2,
        h: 0.28,
        fontFace: "Aptos",
        fontSize: 10,
        bold: true,
        color: "1E3A8A",
        align: "center",
        margin: 0,
    });

    slide.addText("Reusable copyright-free SVG", {
        x: 9.2,
        y: 4.62,
        w: 3.3,
        h: 0.22,
        fontFace: "Aptos",
        fontSize: 9,
        color: "64748B",
        align: "center",
        margin: 0,
    });

    if (slideData?.notes) {
        slide.addNotes(String(slideData.notes));
    }

    return slide;
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

        const total = Math.max(1, Number(count) || 5);
        const multipleChoice = Math.max(0, Number(mcCount) || 0);
        const trueFalse = Math.max(0, Number(tfCount) || 0);
        const adjustedTotal = Math.max(total, multipleChoice + trueFalse);

        const buildQuizPrompt = (
            title: string,
            description: string | undefined,
            total: number,
            mc: number,
            tf: number,
        ) => {
            return `You are an assistant that generates teacher-editable quizzes. Produce ONE valid JSON object only (no commentary, no markdown) with this exact shape:\n\n{\n  "title": "<quiz title>",\n  "type": "interactive",\n  "keyword": "<optional short keyword|null>",\n  "status": true,\n  "questions": [\n    {\n      "title": "question text",\n      "type": "multiple_choice|true_false",\n      "options": ["A","B","C"],\n      "correct_index": 0\n    }\n  ]\n}\n\nConstraints:\n- Return exactly ${total} questions in the "questions" array (no more, no less).\n- Include exactly ${tf} true/false questions with type "true_false" and options exactly ["True","False"].\n- Include exactly ${mc} multiple-choice questions with type "multiple_choice" and 3–5 unique options.\n- "correct_index" must be a 0-based index into the options array.\n- Keep all values JSON-safe strings (no HTML).\n- Topic context: Title: "${title}" Description: "${description || ""}".\n- Output JSON only, no surrounding text or explanation.`;
        };

        const prompt = buildQuizPrompt(topicTitle, topicDescription, adjustedTotal, multipleChoice, trueFalse);
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
        pptx.layout = "LAYOUT_WIDE";
        pptx.author = "Teacher AI Content Tool";
        pptx.company = "swd392backEND";
        pptx.subject = `AI presentation for ${topicTitle}`;
        pptx.title = `AI Presentation - ${topicTitle}`;
        pptx.lang = "en-US";
        pptx.theme = {
            headFontFace: "Aptos Display",
            bodyFontFace: "Aptos",
            lang: "en-US",
        };

        const normalizedSlides = slides.map((slide: any, index: number) => ({
            title: String(slide?.title || `Slide ${index + 1}`),
            body: String(slide?.body || ""),
            notes: slide?.notes ? String(slide.notes) : "",
        }));

        const titleSlide = pptx.addSlide();
        titleSlide.background = { color: "F5F8FF" };
        titleSlide.addImage({
            data: buildFreeImageSvg(topicTitle),
            x: 0.55,
            y: 0.45,
            w: 12.2,
            h: 5.75,
        });
        titleSlide.addShape(pptx.ShapeType.roundRect, {
            x: 0.85,
            y: 5.52,
            w: 11.65,
            h: 0.88,
            rectRadius: 0.16,
            line: { color: "D8E2F3", pt: 1 },
            fill: { color: "FFFFFF", transparency: 6 },
        });
        titleSlide.addText(`AI Presentation`, {
            x: 1.15,
            y: 5.72,
            w: 4,
            h: 0.22,
            fontFace: "Aptos",
            fontSize: 11,
            bold: true,
            color: "2563EB",
            margin: 0,
        });
        titleSlide.addText(topicTitle, {
            x: 1.15,
            y: 5.95,
            w: 11.1,
            h: 0.28,
            fontFace: "Aptos Display",
            fontSize: 20,
            bold: true,
            color: "111827",
            margin: 0,
        });

        normalizedSlides.forEach((slideData: any, index: number) => {
            addBeautifiedSlide(pptx, slideData, index + 1, normalizedSlides.length, topicTitle);
        });

        if (normalizedSlides.length === 0) {
            const emptySlide = pptx.addSlide();
            emptySlide.background = { color: "F5F8FF" };
            emptySlide.addImage({
                data: buildFreeImageSvg(`No content - ${topicTitle}`),
                x: 0.75,
                y: 0.6,
                w: 11.8,
                h: 5,
            });
            emptySlide.addText(`No slides were generated for ${topicTitle}`, {
                x: 1,
                y: 2.2,
                w: 11,
                h: 0.8,
                fontFace: "Aptos Display",
                fontSize: 24,
                bold: true,
                color: "1E3A8A",
                align: "center",
            });
            emptySlide.addText("Try regenerating with a clearer prompt.", {
                x: 1,
                y: 3.1,
                w: 11,
                h: 0.5,
                fontFace: "Aptos",
                fontSize: 16,
                color: "475569",
                align: "center",
            });
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
        const html = buildPdfHtmlShell(topicTitle, topicDescription, aiResponse);
        if (!html.toLowerCase().includes("<html")) {
            return res.status(502).json({
                message: "AI returned invalid HTML. Please retry.",
            });
        }

        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 1920, deviceScaleFactor: 2 });
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.emulateMediaType('screen');
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
