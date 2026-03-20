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
    CircularProgress,
    Alert,
    Chip,
    Avatar,
} from "@mui/material";
import {
    ArrowBack,
    SmartToy,
    Description,
    Slideshow,
    ViewInAr,
    Quiz,
    Send,
} from "@mui/icons-material";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { ClassMaterial, ClassMaterialType, CreateClassMaterialDTO } from "../../types/teacherType";
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

    const [selectedContentType, setSelectedContentType] = useState<ClassMaterialType | "">("");
    const [quizCount, setQuizCount] = useState(5);
    const [quizMcCount, setQuizMcCount] = useState(4);
    const [quizTfCount, setQuizTfCount] = useState(1);
    const [aiPreviewMaterial, setAiPreviewMaterial] = useState<ClassMaterial | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState("");
    const [previewUrl, setPreviewUrl] = useState("");

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createdCount, setCreatedCount] = useState(0);

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

    const extractJsonObject = (raw: string) => {
        const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
        try {
            return JSON.parse(cleaned);
        } catch {
            const m = cleaned.match(/\{[\s\S]*\}/);
            if (!m) return null;
            try {
                return JSON.parse(m[0]);
            } catch {
                return null;
            }
        }
    };

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
            const response = await chadApi.getChadResponse(
                nextMessages.map((m) => ({ sender: m.sender, content: m.content })),
            );
            await handleGeneratePreview(userMsg.content);
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    sender: "assistant",
                    content: response?.message || "I could not generate a response.",
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    sender: "assistant",
                    content: "Failed to contact AI service. Please try again.",
                },
            ]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleGeneratePreview = async (overridePrompt?: string) => {
        if (!selectedContentType || isPreviewLoading) return;

        setPreviewError("");
        setIsPreviewLoading(true);

        const promptForPreview = overridePrompt ?? latestUserPrompt;

        try {
            switch (selectedContentType) {
                case "slide": {
                    const blob = await chadApi.createSlide(topicTitle, topicDescription, promptForPreview);
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
                    return;
                }
                case "file": {
                    const blob = await chadApi.createPdf(topicTitle, topicDescription, promptForPreview);
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
                    return;
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
                    const parsed = extractJsonObject(result?.message || "");
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
    };

    const handleMaterialCreated = (_topicId: string, _material: CreateClassMaterialDTO) => {
        setCreatedCount((prev) => prev + 1);
        setCreateModalOpen(false);
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

                        <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: "center" }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder={"Ask AI..."}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                disabled={isChatLoading || !selectedContentType}
                                sx={{ flex: 1, minWidth: 0 }}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSend}
                                disabled={!selectedContentType || !input.trim() || isChatLoading}
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
