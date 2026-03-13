import {
    Box,
    Typography,
    Paper,
    Stack,
    Button,
    Chip,
    Divider,
    Grid,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Avatar,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Card,
    CardContent,
} from "@mui/material";
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
    ArrowBack,
    Send,
    SmartToy,
    Person,
    Description,
    Slideshow,
    ViewInAr,
    Quiz,
    AutoAwesome,
    Add,
} from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";
import type { ReactElement } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ClassMaterial, ClassMaterialType, Quiz as QuizType, Question } from "../../types/teacherType";
import MaterialTypeViewer from "../../components/MaterialTypeViewer";
import QuizForm from "../../components/createMaterial/QuizForm";
import chadApi from "../../services/teacherApi/chadApi";
import { quizApiService, questionApiService } from "../../services/teacherApi/materialApi";
import classMaterialApi from "../../services/teacherApi/classMaterialApi";
import type { FrontendQuestionData } from "../../services/teacherApi/materialApi/questionApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
    id: string;
    content: string;
    sender: "user" | "assistant";
    timestamp?: Date;
}


// ─── Constants ─────────────────────────────────────────────────────────────────

const TYPE_META: Record<
    ClassMaterialType,
    {
        label: string;
        color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
        icon: ReactElement;
        description: string;
    }
> = {
    file: {
        label: "File",
        color: "info",
        icon: <Description fontSize="small" />,
        description: "Generate documents, PDFs, or text-based materials",
    },
    slide: {
        label: "Slide",
        color: "primary",
        icon: <Slideshow fontSize="small" />,
        description: "Create presentation slides with content and visuals",
    },
    "2d_render": {
        label: "2D Render",
        color: "secondary",
        icon: <ViewInAr fontSize="small" />,
        description: "Generate 2D visualizations and diagrams",
    },
    quiz: {
        label: "Quiz",
        color: "warning",
        icon: <Quiz fontSize="small" />,
        description: "Create interactive quizzes with questions and answers",
    },
};

const formatDate = (d: Date | null | undefined) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AiContentGenerator() {
    const navigate = useNavigate();
    const { classId } = useParams<{ classId: string }>();
    const location = useLocation();
    // ─── State ──────────────────────────────────────────────────────────────────
    const state = location.state;
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: new Date().getTime().toString(),
            content: `
Hello! I'm your AI assistant for content generation.

I can help you create files, slides, 2D renders, and quizzes. What would you like to create today?

Topic: ${state.topic.title}
Description: ${state.topic.description}
`.trim(),
            sender: "assistant",
            timestamp: new Date(),
        },
    ]);

    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedMaterials, setGeneratedMaterials] = useState<ClassMaterial[]>([]);
    const [selectedContentType, setSelectedContentType] = useState<ClassMaterialType | "">("");
    const [showGenerationForm, setShowGenerationForm] = useState(false);
    const [quizPreview, setQuizPreview] = useState<null | { title: string; questions: FrontendQuestionData[] }>(null);
    const [quizTitle, setQuizTitle] = useState<string>("");
    const [quizType, setQuizType] = useState<'interactive' | 'standard'>('interactive');
    const [isSavingQuiz, setIsSavingQuiz] = useState(false);
    const [quizMaxAttempts, setQuizMaxAttempts] = useState<number | "">(3);
    const [quizStartDate, setQuizStartDate] = useState<string>("");
    const [quizEndDate, setQuizEndDate] = useState<string>("");
    const [quizQuestionCount, setQuizQuestionCount] = useState<number | "">(5);
    const [quizTFCount, setQuizTFCount] = useState<number>(0);
    const [quizMCCount, setQuizMCCount] = useState<number>(5);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // ─── Effects ────────────────────────────────────────────────────────────────

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        console.log(state);
    }, [messages]);

    // ─── Handlers ───────────────────────────────────────────────────────────────

    const handleSendMessage = async () => {


        // Simulate AI response delay

        try {
            if (!inputValue.trim() || isLoading) return;

            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                content: inputValue,
                sender: "user",
                timestamp: new Date(),
            };

            // include the new user message when sending to the API
            const payload = [...messages, userMessage];
            setMessages(payload);
            setInputValue("");
            setIsLoading(true);

            const p = await chadApi.getChadResponse(payload);

            // apiService returns response.data, so p is the data object
            const s = p?.message;
            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: s ?? "",
                sender: "assistant",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsLoading(false);

        } catch (error) {
            console.error("Error getting AI response:", error);
            setIsLoading(false);
        }

    };

    const generateAIResponse = (userInput: string): string => {
        const responses = [
            "I understand you'd like to create content. Could you provide more details about what specific material you need?",
            "That's a great idea! Let me help you create that content. What subject area should we focus on?",
            "I can help you with that. Would you prefer to create a quiz, slide presentation, document, or 2D visualization?",
            "Excellent! I'll help you generate that content. Please provide more context about your requirements.",
            "That sounds interesting! Let me know the target audience and learning objectives for better customization.",
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };

    const handleGenerateContent = async () => {
        if (!selectedContentType) return;

        setIsLoading(true);

        // Simulate content generation delay
        setTimeout(() => {
            // TODO: Replace with actual AI content generation
            // const newMaterial = generateMockMaterial(generationRequest);
            // setGeneratedMaterials(prev => [...prev, newMaterial]);

            const aiMessage: ChatMessage = {
                id: Date.now().toString(),
                content: `I've successfully generated a ${TYPE_META[selectedContentType].label.toLowerCase()} based on our conversation. You can see it in the content display panel on the left. Would you like me to create anything else?`,
                sender: "assistant",
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, aiMessage]);
            setIsLoading(false);
        }, 2000);
    };

    const buildQuizPrompt = (topicTitle: string, topicDescription: string | undefined, count: number, mcCount: number, tfCount: number) => {
        return `You are an assistant that generates teacher-editable quizzes. Produce a single valid JSON object only (no commentary) with this exact shape:

{
    "title": "<quiz title>",            // editable by the teacher
    "type": "interactive|standard",
    "keyword": "<optional short keyword|null>",
    "questions": [
        {
            "id": "q1",                     // stable short id to support editing in the UI
            "content": "question text",     // editable by the teacher
            "type": "multiple-choice",      // MUST be multiple-choice
            "options": ["A","B","C"],    // 3–5 unique options (for true/false use exactly ["True","False"])
            "correctAnswer": "A",           // must match exactly one option
            "editable": true,                 // indicates this question is safe to edit in UI
            "explanation": "optional short explanation for teachers" // optional, human-readable
        }
    ]
}

Constraints:
- Return exactly ${count} questions in the "questions" array (no more, no less).
- Include exactly ${tfCount} true/false style questions (represent them as multiple-choice with options exactly ["True","False"]).
- Include exactly ${mcCount} non-true/false multiple-choice questions (each with 3–5 unique options).
- EVERY question must use "type": "multiple-choice".
- For true/false style items, represent as multiple-choice with options exactly ["True","False"] and correctAnswer either "True" or "False".
- Options must be plain text (no HTML/markdown), trimmed, de-duplicated, and 3–5 items except TF.
- correctAnswer must match one of the options exactly (case-sensitive).
- Keep all text concise and focused on the topic.
- Topic context: Title/description to use — Topic title: "${topicTitle}" Topic description: "${topicDescription || ''}".
- Output JSON only, no surrounding text or explanation.`;
    }

    // Fisher-Yates shuffle
    const shuffleArray = <T,>(arr: T[]) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tmp = a[i];
            a[i] = a[j];
            a[j] = tmp;
        }
        return a;
    }

    const generateQuizPreview = async () => {
        if (!state?.topic) return;
        setIsLoading(true);
        try {
            const totalDesired = typeof quizQuestionCount === 'number' && quizQuestionCount > 0 ? quizQuestionCount : 5;

            // If there's an existing preview, only request the remaining questions to reach the desired total
            const existingQuestions = quizPreview?.questions?.length || 0;
            const remaining = Math.max(0, totalDesired - existingQuestions);
            if (remaining === 0) {
                alert('You already have the requested number of questions in the preview. Edit or clear before generating more.');
                setIsLoading(false);
                return;
            }

            // Determine how many MC/TF to request for the remaining slots based on desired distribution minus existing
            const existingTF = (quizPreview?.questions || []).filter(q => Array.isArray(q.options) && q.options.length === 2 && q.options.includes('True') && q.options.includes('False')).length;
            const existingMC = (quizPreview?.questions || []).length - existingTF;
            const desiredTF = Math.max(0, Math.min(totalDesired, quizTFCount || 0));
            const desiredMC = Math.max(0, Math.min(totalDesired, quizMCCount || 0));
            let needTF = Math.max(0, desiredTF - existingTF);
            let needMC = Math.max(0, desiredMC - existingMC);

            // Adjust to ensure needTF + needMC == remaining
            if (needTF + needMC < remaining) {
                needMC += remaining - (needTF + needMC);
            } else if (needTF + needMC > remaining) {
                // trim MC first
                const excess = (needTF + needMC) - remaining;
                needMC = Math.max(0, needMC - excess);
            }

            const prompt = buildQuizPrompt(state.topic.title, state.topic.description, remaining, needMC, needTF);
            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                content: prompt,
                sender: "user",
                timestamp: new Date(),
            };

            const p = await chadApi.getChadResponse([...messages, userMessage]);
            const raw = p?.message ?? "";

            let parsed: any = null;
            try { parsed = JSON.parse(raw); } catch (e) {
                const m = raw.match(/```(?:json)?([\s\S]*?)```/i) || raw.match(/\{[\s\S]*\}/);
                if (m) {
                    const jsonText = m[1] ? m[1].trim() : m[0];
                    try { parsed = JSON.parse(jsonText); } catch (er) { parsed = null; }
                }
            }

            if (parsed && Array.isArray(parsed.questions)) {
                const questionsRaw = parsed.questions.slice(0, remaining);
                const newQuestions: FrontendQuestionData[] = questionsRaw.map((q: any) => {
                    const content = q.content || q.title || '';
                    let options: string[] = Array.isArray(q.options) ? q.options.map(String) : [];
                    let correctAnswer = q.correctAnswer ?? q.correct_answer ?? '';

                    const caLower = String(correctAnswer).toLowerCase();

                    // If the model returned a true/false type or a boolean-like correct answer,
                    // represent it as multiple-choice with exact options ["True","False"].
                    if (q.type === 'true-false' || /^(true|false)$/i.test(String(correctAnswer))) {
                        options = ['True', 'False'];
                        if (caLower === 'true') correctAnswer = 'True';
                        else if (caLower === 'false') correctAnswer = 'False';
                        else correctAnswer = '';
                    }

                    // Normalize options: trim and dedupe while preserving order
                    options = options.map((o: any) => String(o).trim()).filter((o: string) => o !== '');
                    options = Array.from(new Set(options));

                    // Ensure at least the True/False options if options are empty but correctAnswer looks boolean
                    if (options.length === 0 && /^(true|false)$/i.test(String(correctAnswer))) {
                        options = ['True', 'False'];
                        correctAnswer = correctAnswer.toLowerCase() === 'true' ? 'True' : 'False';
                    }

                    // As a final guarantee, ensure the question type is multiple-choice
                    const finalType: FrontendQuestionData['type'] = 'multiple-choice';

                    // Make sure correctAnswer matches an option (case-sensitive exact match).
                    if (correctAnswer && !options.includes(correctAnswer)) {
                        // Try case-insensitive match
                        const found = options.find((o) => o.toLowerCase() === String(correctAnswer).toLowerCase());
                        if (found) correctAnswer = found;
                        else if (options.length > 0) correctAnswer = options[0];
                        else correctAnswer = '';
                    }

                    return {
                        content,
                        type: finalType,
                        options,
                        correctAnswer,
                    };
                });

                // Append to existing preview questions (if any) and shuffle
                const combined = [...(quizPreview?.questions || []), ...newQuestions];
                const shuffled = shuffleArray<FrontendQuestionData>(combined);
                const derivedTitle = parsed.title || quizPreview?.title || `Quiz on ${state.topic.title}`;
                setQuizPreview({ title: derivedTitle, questions: shuffled });
                setQuizTitle(derivedTitle);
                // Validate distribution and warn if AI did not obey counts
                const actualTF = (quizPreview?.questions || []).filter(q => Array.isArray(q.options) && q.options.length === 2 && q.options.includes('True') && q.options.includes('False')).length;
                const actualMC = (quizPreview?.questions || []).length - actualTF;
                if (typeof quizQuestionCount === 'number') {
                    const desiredTF = quizTFCount;
                    const desiredMC = quizMCCount;
                    if (actualTF !== desiredTF || actualMC !== desiredMC) {
                        alert(`AI returned ${actualMC} multiple-choice and ${actualTF} true/false questions (combined), but you requested ${desiredMC} MC and ${desiredTF} TF. You can edit the preview or regenerate.`);
                    }
                }
            } else {
                const derivedTitle = `Quiz on ${state.topic.title}`;
                setQuizPreview(prev => ({ title: derivedTitle, questions: prev?.questions || [] }));
                setQuizTitle(derivedTitle);
            }

            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: raw,
                sender: "assistant",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, userMessage, aiMessage]);
        } catch (error) {
            console.error('generateQuizPreview error', error);
        } finally {
            setIsLoading(false);
        }
    }

    const saveQuizAndCreateMaterial = async () => {
        if (!quizPreview || !classId) return;
        setIsSavingQuiz(true);
        let content_id: string | undefined = undefined;
        try {
            // Validate preview matches requested distribution before saving
            if (typeof quizQuestionCount === 'number') {
                const total = quizQuestionCount;
                const actualTotal = quizPreview.questions.length;
                const actualTF = quizPreview.questions.filter(q => Array.isArray(q.options) && q.options.length === 2 && q.options.includes('True') && q.options.includes('False')).length;
                const actualMC = actualTotal - actualTF;
                if (actualTotal !== total || actualTF !== quizTFCount || actualMC !== quizMCCount) {
                    alert('Quiz questions do not match the requested distribution. Please edit the preview so counts match before saving.');
                    setIsSavingQuiz(false);
                    return;
                }
            }
            // Step 1: Create Quiz record
            const quizData = {
                title: (quizTitle && quizTitle.trim()) ? quizTitle.trim() : quizPreview.title,
                type: 'interactive',
                status: true,
                ...(quizMaxAttempts !== '' && { max_attempt_number: quizMaxAttempts }),
                ...(quizStartDate && { available_date: new Date(quizStartDate) }),
                ...(quizEndDate && { end_date: new Date(quizEndDate) }),
            } as any;
            const createdQuiz = await quizApiService.createQuiz(quizData);
            content_id = (createdQuiz as any)?._id;

            // Step 2: Create questions sequentially
            for (const q of quizPreview.questions) {
                await questionApiService.createQuestion(
                    {
                        content: q.content,
                        type: q.type,
                        options: q.options || [],
                        correctAnswer: q.correctAnswer,
                        has2DVisualization: false,
                    },
                    content_id as string,
                );
            }

            // Step 3: Create ClassMaterial linking to the quiz
            const newMaterial = {
                type: 'quiz',
                order_num: (generatedMaterials.length || 0) + 1,
                class_assign_id: classId,
                title: quizPreview.title,
                topic_id: state?.topic?._id,
                content_id: content_id,
                is_ai_material: true,
                description: quizPreview.title,
            } as any;

            const createdMaterial = await classMaterialApi.createMaterial(newMaterial, content_id);
            if (!createdMaterial) {
                // cleanup
                if (content_id) {
                    try { await quizApiService.deleteQuiz(content_id); } catch (e) { console.error('cleanup failed', e); }
                }
                alert('Error creating class material. Operation rolled back.');
                return;
            }

            // If the created material references a quiz content_id, fetch the quiz and its questions
            let materialWithContent: any = createdMaterial;
            try {
                const cid = (createdMaterial as any)?.content_id ?? content_id;
                if (cid && newMaterial.type === 'quiz') {
                    const quizData = await quizApiService.getQuizById(cid);
                    const questionData = await questionApiService.getQuestionsByQuizId(cid);
                    materialWithContent = { ...(createdMaterial ?? {}), content: { ...quizData, questions: questionData } };
                }
            } catch (err) {
                console.warn('Failed to fetch material content after creation', err);
            }

            setGeneratedMaterials(prev => [{ ...(materialWithContent ?? {}), type: 'quiz' } as ClassMaterial, ...prev]);
            setQuizPreview(null);
            setQuizTitle("");
            setQuizMaxAttempts(3);
            setQuizStartDate("");
            setQuizEndDate("");
            setSelectedContentType("");
            setMessages(prev => [...prev, { id: Date.now().toString(), content: `Saved quiz "${(quizTitle && quizTitle.trim()) ? quizTitle : quizPreview.title}" and created class material.`, sender: 'assistant', timestamp: new Date() }]);
        } catch (error) {
            console.error('saveQuizAndCreateMaterial error', error);
            // try cleanup
            if (content_id) {
                try { await quizApiService.deleteQuiz(content_id); } catch (e) { console.error('cleanup failed', e); }
            }
            alert('An error occurred while saving the quiz. Changes were rolled back if possible.');
        } finally {
            setIsSavingQuiz(false);
        }
    }

    const resetQuizPreview = () => {
        setQuizPreview(null);
        setQuizTitle("");
        setQuizMaxAttempts(3);
        setQuizStartDate("");
        setQuizEndDate("");
    }

    const handleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    // ─── Render ─────────────────────────────────────────────────────────────────

    return (
        <Box>
            {/* ── Header ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(`/teacher/class/${classId}`)}
                        variant="text"
                    >
                        Quay lại lớp học
                    </Button>
                    <Divider orientation="vertical" flexItem />
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <SmartToy color="primary" />
                        <Typography variant="h5" fontWeight={700}>
                            AI Content Generator
                        </Typography>
                    </Stack>
                </Stack>
            </Stack>

            {/* ── Main Layout ── */}
            <Grid container spacing={3} sx={{ height: "calc(100vh - 200px)" }}>
                {/* ── Content Display Panel ── */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, height: "90vh", display: "flex", flexDirection: "column" }}>
                        {/* Selected Content Type Header (moved to AI generator tab) */}
                        {selectedContentType && (
                            <Card variant="outlined" sx={{ mb: 2, bgcolor: "primary.50" }}>
                                <CardContent sx={{ py: 2, height: '300px' }}>
                                    <Stack direction="column" alignItems="center" justifyContent="space-between" spacing={2}>
                                        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 200 }}>
                                            {TYPE_META[selectedContentType].icon}
                                            <Typography variant="subtitle2">
                                                Creating: {TYPE_META[selectedContentType].label}
                                            </Typography>
                                        </Stack>

                                        {/* Center controls: total / MC / TF - kept on one line */}
                                        {selectedContentType === 'quiz' && (
                                            <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1, justifyContent: 'center' }}>
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    label="# Questions"
                                                    value={quizQuestionCount}
                                                    onChange={(e) => {
                                                        const raw = e.target.value;
                                                        const total = raw === '' ? '' : Math.max(1, Number(raw));
                                                        setQuizQuestionCount(total as any);
                                                        if (typeof total === 'number') {
                                                            const mc = Math.min(quizMCCount, total);
                                                            setQuizMCCount(mc);
                                                            setQuizTFCount(total - mc);
                                                        }
                                                    }}
                                                    sx={{ width: 110 }}
                                                />
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    label="Multiple Choice"
                                                    value={quizMCCount}
                                                    onChange={(e) => {
                                                        const total = typeof quizQuestionCount === 'number' ? quizQuestionCount : 0;
                                                        let mc = Math.max(0, Number(e.target.value) || 0);
                                                        mc = Math.min(mc, total);
                                                        setQuizMCCount(mc);
                                                        setQuizTFCount(total - mc);
                                                    }}
                                                    sx={{ width: 100 }}
                                                />
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    label="True/False"
                                                    value={quizTFCount}
                                                    onChange={(e) => {
                                                        const total = typeof quizQuestionCount === 'number' ? quizQuestionCount : 0;
                                                        let tf = Math.max(0, Number(e.target.value) || 0);
                                                        tf = Math.min(tf, total);
                                                        setQuizTFCount(tf);
                                                        setQuizMCCount(total - tf);
                                                    }}
                                                    sx={{ width: 100 }}
                                                />
                                            </Stack>
                                        )}

                                        {/* Right actions: generate + change in one line */}
                                        <Stack direction="row" spacing={1} sx={{ minWidth: 160, justifyContent: 'flex-end' }}>
                                            {selectedContentType === 'quiz' && (
                                                <Button size="small" variant="outlined" onClick={generateQuizPreview} disabled={isLoading}>
                                                    {isLoading ? 'Generating...' : 'Generate Preview'}
                                                </Button>
                                            )}
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => {
                                                    setSelectedContentType("");
                                                    setMessages([]);
                                                }}
                                            >
                                                Change
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        )}
                        {quizPreview ? (
                            <Box sx={{ maxHeight: '90vh', overflow: 'auto' }}>
                                <Stack direction="column" spacing={3} alignItems="stretch" justifyContent="flex-start" mb={2}>
                                    <Stack style={{ padding: '1rem 0px' }} spacing={1}>
                                        <Typography variant="h6">Quiz Preview (editable)</Typography>
                                        <Typography variant="caption" color="text.secondary">Preview generated by AI — edit title and questions before saving.</Typography>
                                    </Stack>

                                    <QuizForm
                                        quizType={quizType}
                                        onQuizTypeChange={(v) => setQuizType(v as 'interactive' | 'standard')}
                                        quizTitle={quizTitle}
                                        onQuizTitleChange={(v) => { setQuizTitle(v); setQuizPreview(prev => prev ? { ...prev, title: v } : prev); }}
                                        quizStartDate={quizStartDate}
                                        onQuizStartDateChange={setQuizStartDate}
                                        quizEndDate={quizEndDate}
                                        onQuizEndDateChange={setQuizEndDate}
                                        maxAttempts={quizMaxAttempts}
                                        onMaxAttemptsChange={setQuizMaxAttempts}
                                        questions={quizPreview.questions as any}
                                        onQuestionsChange={(qs) => setQuizPreview(prev => prev ? { ...prev, questions: qs as FrontendQuestionData[] } : prev)}
                                    />

                                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                                        <Button size="small" variant="outlined" onClick={resetQuizPreview}>Clear</Button>
                                        <Button size="small" variant="contained" onClick={saveQuizAndCreateMaterial} disabled={isSavingQuiz || !quizPreview?.questions || quizPreview.questions.length === 0}>
                                            {isSavingQuiz ? 'Saving...' : 'Save Quiz'}
                                        </Button>
                                    </Stack>

                                </Stack>
                            </Box>
                        ) : generatedMaterials.length === 0 ? (
                            <>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                    <AutoAwesome color="primary" />
                                    <Typography variant="h6">
                                        Generated Content
                                    </Typography>
                                </Stack>
                                <Divider sx={{ mb: 2 }} />
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    height="100%"
                                    flexDirection="column"
                                    color="text.secondary"
                                >
                                    <SmartToy sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
                                    <Typography variant="body1" textAlign="center">
                                        No content generated yet.<br />
                                        Start a conversation with AI to create materials.
                                    </Typography>
                                </Box>
                            </>
                        ) : (
                            <Box sx={{ height: "100%", overflow: "auto" }}>
                                {generatedMaterials.map((material, index) => {
                                    const meta = TYPE_META[material.type];
                                    return (
                                        <Box key={material._id ?? index} sx={{ mb: index < generatedMaterials.length - 1 ? 4 : 0 }}>
                                            {/* Back to generator button */}
                                            {index === 0 && (
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                                                    <Button
                                                        startIcon={<AutoAwesome />}
                                                        onClick={() => setGeneratedMaterials([])}
                                                        variant="text"
                                                        size="small"
                                                    >
                                                        Generate More Content
                                                    </Button>
                                                </Stack>
                                            )}

                                            {/* Material header similar to MaterialDetailPage */}
                                            <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                                                {meta.icon}
                                                <Typography variant="h5" fontWeight={700}>
                                                    {material.title}
                                                </Typography>
                                                <Chip
                                                    label={meta.label}
                                                    color={meta.color}
                                                    size="small"
                                                    icon={meta.icon}
                                                />
                                                <Chip
                                                    label="AI generated"
                                                    color="success"
                                                    size="small"
                                                    icon={<SmartToy fontSize="small" />}
                                                />
                                            </Stack>

                                            {/* Meta row similar to MaterialDetailPage */}
                                            <Stack direction="row" spacing={3} mb={3}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Generated: {formatDate(material.dateCreate)}
                                                </Typography>
                                                {material.dateUpdate && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Last update: {formatDate(material.dateUpdate)}
                                                    </Typography>
                                                )}
                                                <Typography variant="caption" color="text.secondary">
                                                    Order #{material.order_num}
                                                </Typography>
                                            </Stack>

                                            <Divider sx={{ mb: 3 }} />

                                            {/* Content viewer - reusing MaterialTypeViewer */}
                                            <MaterialTypeViewer material={material} />

                                            {index < generatedMaterials.length - 1 && <Divider sx={{ mt: 4 }} />}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* ── Chat Panel ── */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, height: "90vh", display: "flex", flexDirection: "column" }}>
                        <Typography variant="h6" gutterBottom>
                            AI Assistant
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {/* Content Type Selection */}
                        {!selectedContentType ? (
                            <Box sx={{ textAlign: "center", py: 4 }}>
                                <SmartToy sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
                                <Typography variant="h6" gutterBottom>
                                    What would you like to create today?
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Choose a content type to get started with AI assistance
                                </Typography>
                                <Stack spacing={2} maxWidth={400} mx="auto">
                                    {Object.entries(TYPE_META).map(([type, meta]) => (
                                        <Button
                                            key={type}
                                            variant="outlined"
                                            startIcon={meta.icon}
                                            onClick={() => {
                                                setSelectedContentType(type as ClassMaterialType);

                                            }}
                                            sx={{
                                                justifyContent: "flex-start",
                                                py: 2,
                                                textTransform: "none"
                                            }}
                                        >
                                            <Box sx={{ textAlign: "left", ml: 1 }}>
                                                <Typography variant="subtitle2">
                                                    {meta.label}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {meta.description}
                                                </Typography>
                                            </Box>
                                        </Button>
                                    ))}
                                </Stack>
                            </Box>
                        ) : (
                            <>


                                {/* Messages */}
                                <Box sx={{ flexGrow: 1, overflow: "auto", mb: 2 }}>
                                    <List dense>
                                        {messages.map((message) => (
                                            <ListItem key={message.id} alignItems="flex-start">
                                                <Stack direction="row" spacing={1} width="100%">
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: message.sender === "assistant" ? "primary.main" : "grey.500" }}>
                                                        {message.sender === "assistant" ? <SmartToy fontSize="small" /> : <Person fontSize="small" />}
                                                    </Avatar>
                                                    <Box flexGrow={1}>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {message.sender === "assistant" ? "AI Assistant" : "You"}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                                                            {formatDate(message.timestamp)}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {message.content}
                                                            </ReactMarkdown>
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </ListItem>
                                        ))}
                                        {isLoading && (
                                            <ListItem alignItems="flex-start">
                                                <Stack direction="row" spacing={1} width="100%">
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                                                        <SmartToy fontSize="small" />
                                                    </Avatar>
                                                    <Box display="flex" alignItems="center">
                                                        <CircularProgress size={16} sx={{ mr: 1 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            AI is thinking...
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </ListItem>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </List>
                                </Box>

                                {/* Input
                                <Stack direction="row" spacing={1}>
                                    <TextField
                                        size="small"
                                        placeholder={`Describe the ${selectedContentType ? TYPE_META[selectedContentType].label.toLowerCase() : 'content'} you want to create...`}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        disabled={isLoading}
                                        multiline
                                        maxRows={3}
                                        sx={{ flex: 1 }}
                                    />
                                    <IconButton
                                        color="primary"
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || isLoading}
                                    >
                                        <Send />
                                    </IconButton>
                                </Stack> */}
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
