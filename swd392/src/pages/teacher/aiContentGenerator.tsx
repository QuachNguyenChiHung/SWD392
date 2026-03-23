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
    Tooltip,
    CircularProgress,
    Alert,
    Chip,
} from "@mui/material";
import {
    ArrowBack,
    SmartToy,
    Description,
    Slideshow,
    ViewInAr,
    Quiz,
    Send,
    ContentCopy,
    Refresh,
} from "@mui/icons-material";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ClassMaterial, ClassMaterialType, Quiz as QuizType, Question, CreateClassMaterialDTO } from "../../types/teacherType";
import MaterialTypeViewer from "../../components/MaterialTypeViewer";
import chadApi from "../../services/teacherApi/chadApi";
import { apiService } from "../../services/api";
import CreateClassMaterialModal from "../../components/CreateClassMaterialModal";
import { useAuth } from "../../contexts/AuthContext";
import {
    pageTitle,
    sectionLabel,
    sectionTitle,
    flatCard,
    flatButtonContained,
    flatButtonOutlined,
    flatChip,
    chatBubbleUser,
    chatBubbleAssistant,
    loadingContainer,
    COLORS,
    RADIUS,
} from "./teacherStyles";

type ChatMessage = {
    id: string;
    sender: "user" | "assistant";
    content: string;
};

const TYPE_META: Record<
    ClassMaterialType,
    {
        label: string;
        bg: string;
        text: string;
        icon: ReactElement;
        description: string;
    }
> = {
    file: {
        label: "File",
        bg: COLORS.infoBg,
        text: COLORS.info,
        icon: <Description fontSize="small" />,
        description: "Generate documents or PDFs",
    },
    slide: {
        label: "Slide",
        bg: COLORS.accentLight,
        text: COLORS.accent,
        icon: <Slideshow fontSize="small" />,
        description: "Generate presentation slides",
    },
    "2d_render": {
        label: "2D Render",
        bg: "#F5F3FF",
        text: "#7C3AED",
        icon: <ViewInAr fontSize="small" />,
        description: "Generate 2D data preview",
    },
    quiz: {
        label: "Quiz",
        bg: COLORS.warningBg,
        text: COLORS.warning,
        icon: <Quiz fontSize="small" />,
        description: "Generate editable quiz content",
    },
};

export default function AiContentGenerator() {
    const navigate = useNavigate();
    const { classId } = useParams<{ classId: string }>();
    const location = useLocation();
    const { user } = useAuth();

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
            content: `Hello, what do you want today?`,
        },
    ]);
    const [input, setInput] = useState("");
    const [isChatLoading, setIsChatLoading] = useState(false);

    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [generatedMaterials, setGeneratedMaterials] = useState<ClassMaterial[]>([]);
    const [selectedContentType, setSelectedContentType] = useState<ClassMaterialType | "">("");
    const [showGenerationForm, setShowGenerationForm] = useState(false);
    const [quizPreview, setQuizPreview] = useState<null | { title: string; questions: any[] }>(null);
    const [quizTitle, setQuizTitle] = useState<string>("");
    const [quizType, setQuizType] = useState<'interactive' | 'standard'>('interactive');
    const [isSavingQuiz, setIsSavingQuiz] = useState(false);
    const [quizMaxAttempts, setQuizMaxAttempts] = useState<number | "">(3);
    const [quizStartDate, setQuizStartDate] = useState<string>("");
    const [quizEndDate, setQuizEndDate] = useState<string>("");
    const [quizQuestionCount, setQuizQuestionCount] = useState<number | "">(5);
    const [quizTFCount, setQuizTFCount] = useState<number>(0);
    const [quizMCCount, setQuizMCCount] = useState<number>(5);

    // Restored Original Application State
    const [quizCount, setQuizCount] = useState(5);
    const [quizMcCount, setQuizMcCount] = useState(4);
    const [quizTfCount, setQuizTfCount] = useState(1);
    const [aiPreviewMaterial, setAiPreviewMaterial] = useState<ClassMaterial | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createdCount, setCreatedCount] = useState(0);
    const [requestCount, setRequestCount] = useState<number | null>(null);
    const [tokenUsage, setTokenUsage] = useState<{ input: number; output: number; total: number } | null>(null);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Helper function to refetch token usage from database
    const refetchTokenUsage = async () => {
        try {
            const res: any = await apiService.get('/ai/tokens/usage');
            console.log('Refetched token usage from DB:', res);
            setTokenUsage({
                input: res?.inputTokens ?? 0,
                output: res?.outputTokens ?? 0,
                total: res?.totalTokens ?? 0
            });
            const countRes: any = await apiService.get('/ai/requests/count');
            setRequestCount(countRes?.request ?? 0);
        } catch (err) {
            console.error('Failed to refetch token usage:', err);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isChatLoading]);

    useEffect(() => {
        const fetchRequestCount = async () => {
            try {
                const res: any = await apiService.get('/ai/requests/count');
                console.log('Fetched request count:', res?.request);
                setRequestCount(res?.request ?? 0);
            } catch (err) {
                console.error('Failed to fetch request count:', err);
            }
        };

        const fetchTokenUsage = async () => {
            try {
                const res: any = await apiService.get('/ai/tokens/usage');
                console.log('Fetched token usage:', res);
                setTokenUsage({
                    input: res?.inputTokens ?? 0,
                    output: res?.outputTokens ?? 0,
                    total: res?.totalTokens ?? 0
                });
            } catch (err) {
                console.error('Failed to fetch token usage:', err);
            }
        };

        fetchRequestCount();
        fetchTokenUsage();
    }, []);

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

    const normalizeQuizCount = (value: number, fallback: number) =>
        Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;

    const syncQuizSplitFromTotal = (nextTotal: number) => {
        const normalizedTotal = Math.max(1, Math.floor(nextTotal));
        const currentSplitTotal = quizMcCount + quizTfCount;

        if (currentSplitTotal <= 0) {
            setQuizCount(normalizedTotal);
            setQuizMcCount(normalizedTotal);
            setQuizTfCount(0);
            return;
        }

        const nextMcCount = Math.min(
            normalizedTotal,
            Math.max(0, Math.round((normalizedTotal * quizMcCount) / currentSplitTotal)),
        );
        const nextTfCount = normalizedTotal - nextMcCount;

        setQuizCount(normalizedTotal);
        setQuizMcCount(nextMcCount);
        setQuizTfCount(nextTfCount);
    };

    const syncQuizTotalFromSplit = (nextMcCount: number, nextTfCount: number) => {
        const normalizedMcCount = Math.max(0, Math.floor(nextMcCount));
        const normalizedTfCount = Math.max(0, Math.floor(nextTfCount));
        const nextTotal = normalizedMcCount + normalizedTfCount;

        if (nextTotal <= 0) {
            setQuizCount(1);
            setQuizMcCount(1);
            setQuizTfCount(0);
            return;
        }

        setQuizCount(nextTotal);
        setQuizMcCount(normalizedMcCount);
        setQuizTfCount(normalizedTfCount);
    };

    const setNewPreviewUrl = (url: string) => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(url);
    };

    const handleSend = async () => {
        if (!selectedContentType || !input.trim() || isChatLoading) return;

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            sender: "user",
            content: input.trim(),
        };

        const nextMessages = [...messages, userMsg];
        setMessages(nextMessages);
        setInput("");
        setIsChatLoading(true);

        try {
            const chatMessage = await handleGeneratePreview(userMsg.content);
            if (chatMessage) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        sender: "assistant",
                        content: chatMessage,
                    },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    sender: "assistant",
                    content: "Failed to generate content. Please try again or check the format.",
                },
            ]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleRetry = async (promptText: string) => {
        if (!selectedContentType || isChatLoading || isPreviewLoading) return;

        const retryMsg: ChatMessage = {
            id: crypto.randomUUID(),
            sender: "user",
            content: promptText,
        };

        setMessages((prev) => [...prev, retryMsg]);
        setIsChatLoading(true);

        try {
            const chatMessage = await handleGeneratePreview(promptText);
            if (chatMessage) {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: crypto.randomUUID(),
                        sender: "assistant",
                        content: chatMessage,
                    },
                ]);
            }
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    sender: "assistant",
                    content: "Failed to generate content upon retry.",
                },
            ]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleGeneratePreview = async (overridePrompt?: string): Promise<string | void> => {
        if (!selectedContentType || isPreviewLoading) return;

        const promptForPreview = overridePrompt ?? latestUserPrompt;

        // Fisher-Yates shuffle helper
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

        setPreviewError("");
        setIsPreviewLoading(true);

        try {
            switch (selectedContentType) {
                case "slide": {
                    const { blob, message, tokens } = await chadApi.createSlide(topicTitle, topicDescription, promptForPreview);
                    console.log('Slide generation response tokens:', tokens);
                    const fileUrl = URL.createObjectURL(blob);
                    setNewPreviewUrl(fileUrl);
                    setAiPreviewMaterial({
                        _id: `preview-slide-${Date.now()}`,
                        status: "draft",
                        type: "slide",
                        order_num: 0,
                        class_assign_id: classId || "",
                        title: `AI Slide Preview - ${topicTitle}`,
                        dateUpdate: new Date(),
                        dateCreate: new Date(),
                        content: {
                            slide_name: `AI ${topicTitle}.pptx`,
                            file_path: fileUrl,
                        },
                        is_ai_material: true,
                        ai_content_id: null,
                    });
                    
                    // Update token usage
                    if (tokens) {
                        console.log('Updating token usage with:', tokens);
                        setTokenUsage(prev => {
                            const newUsage = {
                                input: (prev?.input ?? 0) + (tokens.input ?? 0),
                                output: (prev?.output ?? 0) + (tokens.output ?? 0),
                                total: (prev?.total ?? 0) + (tokens.total ?? 0)
                            };
                            console.log('New token usage:', newUsage);
                            return newUsage;
                        });
                        setRequestCount(prev => (prev !== null ? prev + 1 : 1));
                    } else {
                        console.warn('No tokens received from API');
                    }
                    
                    return message;
                }
                case "file": {
                    const { blob, message, tokens } = await chadApi.createPdf(topicTitle, topicDescription, promptForPreview);
                    console.log('PDF generation response tokens:', tokens);
                    const fileUrl = URL.createObjectURL(blob);
                    setNewPreviewUrl(fileUrl);
                    setAiPreviewMaterial({
                        _id: `preview-file-${Date.now()}`,
                        status: "draft",
                        type: "file",
                        order_num: 0,
                        class_assign_id: classId || "",
                        title: `AI File Preview - ${topicTitle}`,
                        dateUpdate: new Date(),
                        dateCreate: new Date(),
                        content: {
                            file_name: `AI ${topicTitle}.pdf`,
                            file_path: fileUrl,
                        },
                        is_ai_material: true,
                        ai_content_id: null,
                    });
                    
                    // Update token usage
                    if (tokens) {
                        console.log('Updating token usage with:', tokens);
                        setTokenUsage(prev => {
                            const newUsage = {
                                input: (prev?.input ?? 0) + (tokens.input ?? 0),
                                output: (prev?.output ?? 0) + (tokens.output ?? 0),
                                total: (prev?.total ?? 0) + (tokens.total ?? 0)
                            };
                            console.log('New token usage:', newUsage);
                            return newUsage;
                        });
                        setRequestCount(prev => (prev !== null ? prev + 1 : 1));
                    } else {
                        console.warn('No tokens received from API');
                    }
                    
                    // Refetch from database as fallback
                    setTimeout(() => refetchTokenUsage(), 1000);
                    
                    return message;
                }
                case "quiz": {
                    const totalQuestions = normalizeQuizCount(quizCount, 5);
                    const multipleChoiceQuestions = normalizeQuizCount(quizMcCount, 4);
                    const trueFalseQuestions = normalizeQuizCount(quizTfCount, 1);
                    const result = await chadApi.createQuiz(
                        topicTitle,
                        topicDescription,
                        totalQuestions,
                        multipleChoiceQuestions,
                        trueFalseQuestions,
                    );
                    console.log('Quiz generation result:', result);
                    console.log('Quiz tokens:', result?.tokens);
                    const parsed = result?.rawContent ? JSON.parse(result.rawContent) : {};
                    const questionsRaw = Array.isArray(parsed?.questions) ? parsed.questions : [];
                    const mappedQuestions = questionsRaw.slice(0, totalQuestions).map((q: any, idx: number) => {
                        const rawOptions = Array.isArray(q.options) ? q.options.map((o: any) => String(o)) : [];
                        const normalizedOptions: string[] = Array.from(new Set(rawOptions));
                        const normalizedType =
                            q.type === "true_false" || q.type === "multiple_choice"
                                ? q.type
                                : normalizedOptions.length === 2 &&
                                    normalizedOptions.includes("True") &&
                                    normalizedOptions.includes("False")
                                    ? "true_false"
                                    : "multiple_choice";
                        const explicitIndex = Number.isInteger(q.correct_index) ? Number(q.correct_index) : -1;
                        const answer = String(q.correctAnswer ?? "");
                        const fallbackIndex = normalizedOptions.findIndex(
                            (o) => o.toLowerCase() === answer.toLowerCase(),
                        );
                        const answerIndex = Math.max(0, explicitIndex >= 0 ? explicitIndex : fallbackIndex);

                        return {
                            _id: `preview-q-${idx}`,
                            title: String(q.title || q.content || `Question ${idx + 1}`),
                            type: normalizedType,
                            options: normalizedOptions,
                            correct_index: answerIndex,
                        };
                    });

                    setAiPreviewMaterial({
                        _id: `preview-quiz-${Date.now()}`,
                        status: "draft",
                        type: "quiz",
                        order_num: 0,
                        class_assign_id: classId || "",
                        title: String(parsed?.title || `Quiz on ${topicTitle}`),
                        dateUpdate: new Date(),
                        dateCreate: new Date(),
                        content: {
                            _id: `preview-quiz-content-${Date.now()}`,
                            material_id: "preview",
                            title: String(parsed?.title || `Quiz on ${topicTitle}`),
                            keyword: parsed?.keyword ?? null,
                            type: parsed?.type === "standard" ? "standard" : "interactive",
                            available_date: null,
                            max_attempt_number: null,
                            end_date: null,
                            status: parsed?.status ?? true,
                            questions: mappedQuestions,
                        },
                        is_ai_material: true,
                        ai_content_id: null,
                    });
                    
                    // Update token usage
                    if (result?.tokens) {
                        console.log('Updating token usage with:', result.tokens);
                        setTokenUsage(prev => {
                            const newUsage = {
                                input: (prev?.input ?? 0) + (result.tokens.input ?? 0),
                                output: (prev?.output ?? 0) + (result.tokens.output ?? 0),
                                total: (prev?.total ?? 0) + (result.tokens.total ?? 0)
                            };
                            console.log('New token usage:', newUsage);
                            return newUsage;
                        });
                        setRequestCount(prev => (prev !== null ? prev + 1 : 1));
                    } else {
                        console.warn('No tokens received from quiz API');
                    }
                    
                    // Refetch from database as fallback
                    setTimeout(() => refetchTokenUsage(), 1000);
                    
                    return result?.message || "Quiz generated successfully.";
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
                    return "2D render preview generated.";
                }
                default:
                    break;
            }
        } catch (error) {
            setPreviewError(error instanceof Error ? error.message : "Failed to generate preview.");
        } finally {
            setIsPreviewLoading(false);
        }
    }

    const handleMaterialCreated = (_topicId: string, _material: CreateClassMaterialDTO) => {
        setCreatedCount((prev) => prev + 1);
        setCreateModalOpen(false);
    };

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
            handleSend();
        }
    };

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: RADIUS,
        },
    };

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

            {/* ── Header ── */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate(`/teacher/class/${classId}`)}
                        sx={{
                            ...flatButtonOutlined,
                            borderColor: "transparent",
                            "&:hover": {
                                borderColor: COLORS.border,
                                bgcolor: COLORS.accentLight,
                                boxShadow: "none",
                            },
                        }}
                    >
                        Quay lại lớp học
                    </Button>
                    <Divider orientation="vertical" flexItem sx={{ borderColor: COLORS.borderLight }} />
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <SmartToy sx={{ color: COLORS.accent }} />
                        <Box>
                            <Typography sx={sectionLabel}>AI Workspace</Typography>
                            <Typography sx={{ ...pageTitle, fontSize: "1.25rem" }}>
                                AI Content Generator
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>
            </Stack>

            <Grid container spacing={2} sx={{ height: "calc(100vh - 230px)" }}>
                {/* ── Preview Panel ── */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            ...flatCard,
                            height: "78vh",
                            display: "flex",
                            flexDirection: "column",
                            borderTop: `3px solid ${COLORS.accent}`,
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <SmartToy sx={{ color: COLORS.accent, fontSize: 20 }} />
                                <Typography sx={sectionTitle}>AI Preview</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    disabled={!selectedContentType || isPreviewLoading}
                                    onClick={async () => {
                                        const msg = await handleGeneratePreview();
                                        if (msg) {
                                            setMessages((prev) => [
                                                ...prev,
                                                { id: crypto.randomUUID(), sender: "assistant", content: msg },
                                            ]);
                                        }
                                    }}
                                    sx={flatButtonOutlined}
                                >
                                    {isPreviewLoading ? "Generating..." : "Generate Preview"}
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => setCreateModalOpen(true)}
                                    disabled={!topicId || !classId || !aiPreviewMaterial}
                                    sx={flatButtonContained}
                                >
                                    Create Class Material
                                </Button>
                            </Stack>
                        </Stack>

                        <Divider sx={{ mb: 2, borderColor: COLORS.borderLight }} />

                        <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: COLORS.textDark, mb: 1 }}>
                            {topicTitle}
                        </Typography>

                        {previewError && (
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 2,
                                    borderRadius: RADIUS,
                                    border: `1px solid ${COLORS.error}`,
                                    boxShadow: "none",
                                }}
                            >
                                {previewError}
                            </Alert>
                        )}

                        <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
                            {isPreviewLoading ? (
                                <Box sx={loadingContainer}>
                                    <CircularProgress sx={{ color: COLORS.accent }} />
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
                                    textAlign="center"
                                >
                                    <Typography sx={{ color: COLORS.textSecondary, fontSize: "0.9rem" }}>
                                        Pick a content type, chat with AI, then click Generate Preview.
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* ── Chat Panel ── */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            ...flatCard,
                            height: "78vh",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                            <Avatar sx={{ bgcolor: COLORS.accent, width: 36, height: 36 }}>
                                <SmartToy fontSize="small" />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={sectionTitle}>AI Assistant</Typography>
                                <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.textSecondary }}>
                                    <strong>{requestCount ?? 0}</strong> requests • <strong>{(tokenUsage?.total ?? 0).toLocaleString()}</strong> tokens ({(tokenUsage?.input ?? 0).toLocaleString()} in / {(tokenUsage?.output ?? 0).toLocaleString()} out)
                                </Typography>
                            </Box>
                        </Stack>
                        <Divider sx={{ mb: 2, borderColor: COLORS.borderLight }} />

                        {/* Content type chips */}
                        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
                            {(Object.keys(TYPE_META) as ClassMaterialType[]).map((type) => {
                                const meta = TYPE_META[type];
                                const isSelected = selectedContentType === type;
                                return (
                                    <Chip
                                        key={type}
                                        label={meta.label}
                                        icon={meta.icon}
                                        onClick={() => setSelectedContentType(type)}
                                        clickable
                                        sx={isSelected
                                            ? flatChip(COLORS.accent, "#fff")
                                            : flatChip(COLORS.bg, COLORS.textSecondary)
                                        }
                                    />
                                );
                            })}
                        </Stack>

                        {/* Quiz config */}
                        {selectedContentType === "quiz" && (
                            <Stack direction="row" gap={2} sx={{ mb: 2, flexWrap: "wrap" }}>
                                <TextField
                                    label="Total questions"
                                    type="number"
                                    size="small"
                                    value={quizCount}
                                    onChange={(e) => syncQuizSplitFromTotal(Number(e.target.value))}
                                    inputProps={{ min: 1 }}
                                    sx={{ width: 150, ...inputSx }}
                                />
                                <TextField
                                    label="Multiple choice"
                                    type="number"
                                    size="small"
                                    value={quizMcCount}
                                    onChange={(e) => syncQuizTotalFromSplit(Number(e.target.value), quizTfCount)}
                                    inputProps={{ min: 0 }}
                                    sx={{ width: 150, ...inputSx }}
                                />
                                <TextField
                                    label="True / false"
                                    type="number"
                                    size="small"
                                    value={quizTfCount}
                                    onChange={(e) => syncQuizTotalFromSplit(quizMcCount, Number(e.target.value))}
                                    inputProps={{ min: 0 }}
                                    sx={{ width: 150, ...inputSx }}
                                />
                            </Stack>
                        )}

                        {/* Chat messages */}
                        <Box
                            sx={{
                                flex: 1,
                                overflow: "auto",
                                pr: 1,
                                bgcolor: COLORS.bg,
                                borderRadius: RADIUS,
                                border: `1px solid ${COLORS.border}`,
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
                                                <Avatar sx={{ bgcolor: COLORS.accent, width: 28, height: 28 }}>
                                                    <SmartToy sx={{ fontSize: 16 }} />
                                                </Avatar>
                                            )}
                                            <Box sx={m.sender === "user" ? chatBubbleUser : chatBubbleAssistant}>
                                                <Typography
                                                    sx={{
                                                        fontSize: "0.65rem",
                                                        fontWeight: 700,
                                                        textTransform: "uppercase",
                                                        letterSpacing: "0.08em",
                                                        color: m.sender === "user" ? "rgba(255,255,255,0.7)" : COLORS.textSecondary,
                                                        mb: 0.25,
                                                    }}
                                                >
                                                    {m.sender === "user" ? "You" : "AI Assistant"}
                                                </Typography>
                                                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>
                                                    {m.content}
                                                </Typography>
                                                
                                                {/* Action Buttons */}
                                                {m.sender === "user" && (
                                                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                                                        <Tooltip title="Copy prompt">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => navigator.clipboard.writeText(m.content)}
                                                                sx={{ color: "rgba(255,255,255,0.7)", p: 0.5, "&:hover": { color: "#fff" } }}
                                                            >
                                                                <ContentCopy fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Retry this prompt">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleRetry(m.content)}
                                                                disabled={isChatLoading || isPreviewLoading}
                                                                sx={{ color: "rgba(255,255,255,0.7)", p: 0.5, "&:hover": { color: "#fff" } }}
                                                            >
                                                                <Refresh fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                )}
                                            </Box>
                                            {m.sender === "user" && (
                                                <Avatar 
                                                    alt={user?.name || "You"} 
                                                    src={user?.avatar} 
                                                    sx={{ bgcolor: COLORS.textDark, width: 28, height: 28 }}
                                                >
                                                    <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: "#fff" }}>
                                                        {user?.name?.charAt(0).toUpperCase() || "Y"}
                                                    </Typography>
                                                </Avatar>
                                            )}
                                        </Stack>
                                    ))}

                                    {isChatLoading && (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <CircularProgress size={16} sx={{ color: COLORS.accent }} />
                                            <Typography sx={{ fontSize: "0.75rem", color: COLORS.textSecondary }}>
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
                                    textAlign="center"
                                >
                                    <Typography sx={{ fontSize: "0.85rem", color: COLORS.textSecondary }}>
                                        Choose a material type to start chatting.
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        {/* Input */}
                        <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: "center" }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Ask AI..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                disabled={isChatLoading || !selectedContentType}
                                sx={{ flex: 1, minWidth: 0, ...inputSx }}
                            />
                            <IconButton
                                onClick={handleSend}
                                disabled={!selectedContentType || !input.trim() || isChatLoading}
                                sx={{
                                    bgcolor: COLORS.accent,
                                    color: "#fff",
                                    borderRadius: RADIUS,
                                    "&:hover": {
                                        bgcolor: "#5a6fd6",
                                    },
                                    "&.Mui-disabled": {
                                        bgcolor: COLORS.borderLight,
                                        color: COLORS.textSecondary,
                                    },
                                }}
                            >
                                <Send />
                            </IconButton>
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
