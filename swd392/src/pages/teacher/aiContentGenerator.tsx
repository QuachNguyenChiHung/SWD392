import {
    Box,
    Typography,
    Paper,
    Stack,
    Button,
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
import {
    ArrowBack,
    SmartToy,
    Description,
    Slideshow,
    ViewInAr,
    Quiz,
    AutoAwesome,
    Add,
} from "@mui/icons-material";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ClassMaterial, ClassMaterialType, Quiz as QuizType, Question } from "../../types/teacherType";
import MaterialTypeViewer from "../../components/MaterialTypeViewer";
import chadApi from "../../services/teacherApi/chadApi";
import CreateClassMaterialModal from "../../components/CreateClassMaterialModal";

type ChatMessage = {
    id: string;
    sender: "user" | "assistant";
    content: string;
};

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
        description: "Generate documents or PDFs",
    },
    slide: {
        label: "Slide",
        color: "primary",
        icon: <Slideshow fontSize="small" />,
        description: "Generate presentation slides",
    },
    "2d_render": {
        label: "2D Render",
        color: "secondary",
        icon: <ViewInAr fontSize="small" />,
        description: "Generate 2D data preview",
    },

    quiz: {
        label: "Quiz",
        color: "warning",
        icon: <Quiz fontSize="small" />,
        description: "Generate editable quiz content",
    },
};

export default function AiContentGenerator() {
    const navigate = useNavigate();
    const { classId } = useParams<{ classId: string }>();
    const location = useLocation();

    const state = location.state as {
        topic?: {
            _id?: string;
            topic_id?: string;
            title?: string;
            description?: string;
            classMaterials?: ClassMaterial[];
        };
    } | null;

    const topicTitle = state?.topic?.title || "Untitled topic";
    const topicDescription = state?.topic?.description || "No description available.";
    const topicId = state?.topic?._id || state?.topic?.topic_id || "";
    const topicMaterials = state?.topic?.classMaterials || [];

    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: crypto.randomUUID(),
            sender: "assistant",
            content: `Hello, what do you want today bro?`,
        },
    ]);
    const [input, setInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);

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

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isChatLoading]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const latestUserPrompt = useMemo(() => {
        const lastUser = [...messages].reverse().find((m) => m.sender === "user");
        return lastUser?.content || "";
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
            console.log("API response", JSON.parse(p.message));
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

    // buildQuizPrompt removed — quiz prompt construction now happens server-side

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

            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                content: `Generate quiz: ${remaining} questions (${needMC} MC, ${needTF} TF)`,
                sender: "user",
                timestamp: new Date(),
            };

            // Call backend route to generate quiz JSON
            const p = await chadApi.createQuiz(state.topic.title, state.topic.description, remaining, needMC, needTF);
            let raw = p?.message ?? "";
            raw = raw.replace('```json', '');
            console.log("Raw AI response for quiz generation:", raw);

            let parsed: any = null;
            let isParsed = false;
            try { parsed = JSON.parse(raw); isParsed = true; } catch (e) {
                const m = raw.match(/```(?:json)?([\s\S]*?)```/i) || raw.match(/\{[\s\S]*\}/);
                if (m) {
                    const jsonText = m[1] ? m[1].trim() : m[0];
                    try { parsed = JSON.parse(jsonText); isParsed = true; } catch (er) { parsed = null; }
                }
            }
            if (parsed) {
                alert('AI response parsed successfully. Preview will be generated based on the content. Please review the questions and edit as needed before saving.');
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
                            _id: `preview-q-${idx}`,
                            title: String(q.title || q.content || `Question ${idx + 1}`),
                            type: normalizedType,
                            options: normalizedOptions,
                            correct_index: answerIndex,
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
                case "2d_render": {
                    setAiPreviewMaterial({
                        _id: `preview-2d-${Date.now()}`,
                        status: "draft",
                        type: "2d_render",
                        order_num: 0,
                        class_assign_id: classId || "",
                        title: `2D Preview - ${topicTitle}`,
                        dateUpdate: new Date(),
                        dateCreate: new Date(),
                        content: {
                            render_data: JSON.stringify(
                                {
                                    topic: topicTitle,
                                    notes: promptForPreview || "No additional prompt",
                                },
                                null,
                                2,
                            ),
                        },
                        is_ai_material: true,
                        ai_content_id: null,
                    });
                    return;
                }
                default:
                    break;
            }

            // if (selectedContentType === "2d_render") {
            //     setAiPreviewMaterial({
            //         _id: `preview-2d-${Date.now()}`,
            //         status: "draft",
            //         type: "2d_render",
            //         order_num: 0,
            //         class_assign_id: classId || "",
            //         title: `2D Preview - ${topicTitle}`,
            //         dateUpdate: new Date(),
            //         dateCreate: new Date(),
            //         content: {
            //             render_data: JSON.stringify(
            //                 {
            //                     topic: topicTitle,
            //                     notes: latestUserPrompt || "No additional prompt",
            //                 },
            //                 null,
            //                 2,
            //             ),
            //         },
            //         is_ai_material: true,
            //         ai_content_id: null,
            //     });
            // }
        } catch (error) {
            setPreviewError(error instanceof Error ? error.message : "Failed to generate preview.");
        } finally {
            setIsPreviewLoading(false);
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
            <CreateClassMaterialModal
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onMaterialCreated={handleMaterialCreated}
                topicId={topicId}
                classId={classId || ""}
                currentMaterialCount={topicMaterials.length + createdCount}
                topicTitle={topicTitle}
                aiPreviewMaterial={aiPreviewMaterial}
            />

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
                            AI Content Workspace
                        </Typography>
                    </Stack>
                </Stack>
            </Stack>

            <Grid container spacing={2} sx={{ height: "calc(100vh - 230px)" }}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper sx={{ p: 3, height: "78vh", display: "flex", flexDirection: "column" }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <SmartToy color="primary" />
                                <Typography variant="h6">AI Preview</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    disabled={!selectedContentType || isPreviewLoading}
                                    onClick={() => handleGeneratePreview()}
                                >
                                    {isPreviewLoading ? "Generating..." : "Generate Preview"}
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => setCreateModalOpen(true)}
                                    disabled={!topicId || !classId || !aiPreviewMaterial}
                                >
                                    Create Class Material
                                </Button>
                            </Stack>
                        </Stack>

                        <Divider sx={{ mb: 2 }} />

                        <Typography variant="h6" sx={{ mb: 1 }}>
                            {topicTitle}
                        </Typography>


                        {previewError && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {previewError}
                            </Alert>
                        )}

                        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                            {isPreviewLoading ? (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                                    <CircularProgress />
                                </Box>
                            ) : aiPreviewMaterial ? (
                                <MaterialTypeViewer material={aiPreviewMaterial} />
                            ) : (
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    height="100%"
                                    flexDirection="column"
                                    color="text.secondary"
                                    textAlign="center"
                                >
                                    <Typography variant="body1">
                                        Pick a content type, chat with AI, then click Generate Preview.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper sx={{ p: 3, height: "78vh", display: "flex", flexDirection: "column" }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                            <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
                                <SmartToy fontSize="small" />
                            </Avatar>
                            <Box>
                                <Typography variant="h6">AI Assistant</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Ready to help you generate content
                                </Typography>
                            </Box>
                        </Stack>
                        <Divider sx={{ mb: 2 }} />

                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
                            {(Object.keys(TYPE_META) as ClassMaterialType[]).map((type) => (
                                <Chip
                                    key={type}
                                    label={TYPE_META[type].label}
                                    icon={TYPE_META[type].icon}
                                    color={selectedContentType === type ? "primary" : "default"}
                                    onClick={() => setSelectedContentType(type)}
                                    clickable
                                />
                            ))}
                        </Stack>

                        {selectedContentType === "quiz" && (
                            <Stack direction="row" gap={2} sx={{ mb: 2, flexWrap: "wrap" }}>
                                <TextField
                                    label="Total questions"
                                    type="number"
                                    size="small"
                                    value={quizCount}
                                    onChange={(e) => syncQuizSplitFromTotal(Number(e.target.value))}
                                    inputProps={{ min: 1 }}
                                    sx={{ width: 150 }}
                                />
                                <TextField
                                    label="Multiple choice"
                                    type="number"
                                    size="small"
                                    value={quizMcCount}
                                    onChange={(e) => syncQuizTotalFromSplit(Number(e.target.value), quizTfCount)}
                                    inputProps={{ min: 0 }}
                                    sx={{ width: 150 }}
                                />
                                <TextField
                                    label="True / false"
                                    type="number"
                                    size="small"
                                    value={quizTfCount}
                                    onChange={(e) => syncQuizTotalFromSplit(quizMcCount, Number(e.target.value))}
                                    inputProps={{ min: 0 }}
                                    sx={{ width: 150 }}
                                />
                            </Stack>
                        )}

                        <Box
                            sx={{
                                flex: 1,
                                overflow: "auto",
                                pr: 1,
                                bgcolor: "grey.50",
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "grey.200",
                                p: 2,
                            }}
                        >
                            {selectedContentType ? (
                                <Stack spacing={1.5}>
                                    {messages.map((m) => (
                                        <Stack
                                            key={m.id}
                                            direction="row"
                                            spacing={1}
                                            alignSelf={m.sender === "user" ? "flex-end" : "flex-start"}
                                            sx={{ maxWidth: "92%" }}
                                        >
                                            {m.sender === "assistant" && (
                                                <Avatar sx={{ bgcolor: "primary.main", width: 28, height: 28 }}>
                                                    <SmartToy fontSize="small" />
                                                </Avatar>
                                            )}
                                            <Box
                                                sx={{
                                                    px: 1.5,
                                                    py: 1,
                                                    borderRadius: 2,
                                                    bgcolor: m.sender === "user" ? "primary.main" : "common.white",
                                                    color: m.sender === "user" ? "primary.contrastText" : "text.primary",
                                                    border: m.sender === "user" ? "none" : "1px solid",
                                                    borderColor: m.sender === "user" ? "transparent" : "grey.200",
                                                    boxShadow: m.sender === "user" ? 0 : "0 1px 2px rgba(0,0,0,0.06)",
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    color={m.sender === "user" ? "primary.contrastText" : "text.secondary"}
                                                >
                                                    {m.sender === "user" ? "You" : "AI Assistant"}
                                                </Typography>
                                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                                                    {m.content}
                                                </Typography>
                                            </Box>
                                            {m.sender === "user" && (
                                                <Avatar sx={{ bgcolor: "grey.700", width: 28, height: 28 }}>
                                                    <Typography variant="caption" sx={{ color: "common.white" }}>
                                                        You
                                                    </Typography>
                                                </Avatar>
                                            )}
                                        </Stack>
                                    ))}

                                    {isChatLoading && (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <CircularProgress size={16} />
                                            <Typography variant="caption" color="text.secondary">
                                                AI is typing...
                                            </Typography>
                                        </Box>
                                    )}

                                    <div ref={messagesEndRef} />
                                </Stack>
                            ) : (
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    height="100%"
                                    color="text.secondary"
                                    textAlign="center"
                                >
                                    <Typography variant="body2">
                                        Choose a material type to start chatting.
                                    </Typography>
                                </Box>
                            )}
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
