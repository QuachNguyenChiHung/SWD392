import {
    Box,
    Typography,
    Button,
    Chip,
    Stack,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    Divider,
    IconButton,
    Tooltip,
    CircularProgress,
} from "@mui/material";
import {
    Quiz,
    CheckCircle,
    AddCircleOutline,
    EditOutlined,
    DeleteOutline,
} from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import type { Quiz as QuizType, Question } from "../../types/teacherType";
import QuestionFormModal from "../QuestionFormModal";
import { questionApiService } from "../../services/teacherApi/materialApi/questionApi";
import { quizAttemptResultApiService, type QuizAttemptWithResults } from "../../services/teacherApi/materialApi/quizAttemptResultApi";
import QuizAttemptResultsTable from "./QuizAttemptResultsTable";

interface QuizViewerProps {
    content: QuizType;
    onQuestionsChange?: (questions: Question[]) => void;
}

const TYPE_LABEL: Record<Question["type"], string> = {
    "multiple-choice": "Trắc nghiệm",
    "true-false": "Đúng / Sai",
};

export default function QuizViewer({ content, onQuestionsChange }: QuizViewerProps) {
    const [modalState, setModalState] = useState<{
        open: boolean;
        question: Question | null;
    }>({ open: false, question: null });
    const [questions, setQuestions] = useState<Question[]>(content.questions ?? []);
    const [saving, setSaving] = useState(false);
    const [attempts, setAttempts] = useState<QuizAttemptWithResults[]>([]);
    const [attemptsLoading, setAttemptsLoading] = useState(false);

    // Refresh questions from API
    const refreshQuestions = useCallback(async () => {
        if (!content?._id) return;
        try {
            const fetched = await questionApiService.getQuestionsByQuizId(content._id);
            setQuestions(fetched);
            onQuestionsChange?.(fetched);
        } catch (err) {
            console.error('Failed to refresh questions:', err);
        }
    }, [content?._id, onQuestionsChange]);

    // Sync questions when content changes
    useEffect(() => {
        setQuestions(content.questions ?? []);
    }, [content.questions]);

    useEffect(() => {
        if (!content?._id) return;
        setAttemptsLoading(true);
        quizAttemptResultApiService
            .getQuizAttemptsWithResultsByQuizId(content._id)
            .then(setAttempts)
            .catch(() => setAttempts([]))
            .finally(() => setAttemptsLoading(false));
    }, [content?._id]);

    if (!content) {
        return (
            <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography color="error">Dữ liệu quiz không hợp lệ</Typography>
            </Box>
        );
    }

    if (!content.title) {
        return (
            <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography color="error">Quiz thiếu tiêu đề</Typography>
            </Box>
        );
    }

    const canEdit = !!onQuestionsChange;

    const formatDate = (d: Date | null) =>
        d
            ? new Date(d).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            : "\u2014";

    const handleSaveQuestion = async (saved: Question) => {
        if (!content._id) return;
        setSaving(true);
        try {
            const frontendData = {
                content: saved.content,
                type: saved.type,
                options: saved.options,
                correctAnswer: saved.correctAnswer,
            };

            if (saved._id && questions.some((q) => q._id === saved._id)) {
                // Update existing question
                await questionApiService.updateQuestionFromFrontend(saved._id, frontendData);
            } else {
                // Create new question
                await questionApiService.createQuestion(frontendData, content._id);
            }
            await refreshQuestions();
        } catch (err) {
            console.error('Failed to save question:', err);
            alert('Có lỗi xảy ra khi lưu câu hỏi');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!window.confirm('Bạn có chắc muốn xoá câu hỏi này?')) return;
        setSaving(true);
        try {
            await questionApiService.deleteQuestion(id);
            await refreshQuestions();
        } catch (err) {
            console.error('Failed to delete question:', err);
            alert('Có lỗi xảy ra khi xoá câu hỏi');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            {/* Header */}
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <Quiz color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                    {content.title}
                </Typography>
                <Chip
                    label={content.type === "interactive" ? "Tương tác" : "Thông thường"}
                    color={content.type === "interactive" ? "secondary" : "default"}
                    size="small"
                />
                <Chip
                    label={content.status ? "Đang hoạt động" : "Không hoạt động"}
                    color={content.status ? "success" : "default"}
                    size="small"
                />
            </Stack>

            {/* Summary table */}
            <Paper variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Ngày mở</TableCell>
                            <TableCell>{formatDate(content.available_date)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Hạn nộp</TableCell>
                            <TableCell>{formatDate(content.end_date)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Số lần thử tối đa</TableCell>
                            <TableCell>{content.max_attempt_number ?? "Không giới hạn"}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Câu hỏi</TableCell>
                            <TableCell>{questions.length}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Paper>

            {/* Questions list */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle1" fontWeight={600}>Câu hỏi</Typography>
                {canEdit && (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddCircleOutline />}
                        onClick={() => setModalState({ open: true, question: null })}
                    >
                        Thêm câu hỏi
                    </Button>
                )}
            </Stack>
            <Divider sx={{ mb: 1 }} />

            {questions.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    Chưa có câu hỏi nào.{canEdit ? ' Nhấn "Thêm câu hỏi" để bắt đầu.' : ""}
                </Typography>
            ) : (
                <Stack spacing={0}>
                    {questions.map((q, index) => (
                        <Box
                            key={q._id ?? index}
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 2,
                                py: 1.5,
                                borderBottom: "1px solid",
                                borderColor: "divider",
                            }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                                <CheckCircle fontSize="small" color="primary" />
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography variant="subtitle2" noWrap>
                                        Câu {index + 1}: {q.content}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {TYPE_LABEL[q.type]}
                                        {q.options ? ` · ${q.options.length} lựa chọn` : ""}
                                        {q.has2DVisualization ? " · 2D" : ""}
                                    </Typography>
                                </Box>
                            </Stack>
                            {canEdit && (
                                <Stack direction="row" spacing={0.5} flexShrink={0}>
                                    <Tooltip title="Chỉnh sửa">
                                        <IconButton
                                            size="small"
                                            onClick={() => setModalState({ open: true, question: q })}
                                        >
                                            <EditOutlined fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Xoá">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteQuestion(q._id as string)}
                                        >
                                            <DeleteOutline fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            )}
                        </Box>
                    ))}
                </Stack>
            )}

            {saving && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            )}

            <QuizAttemptResultsTable attempts={attempts} loading={attemptsLoading} />

            <QuestionFormModal
                open={modalState.open}
                question={modalState.question}
                onClose={() => setModalState({ open: false, question: null })}
                onSave={handleSaveQuestion}
            />
        </Box>
    );
}
