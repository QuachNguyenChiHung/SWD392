import {
    Box,
    Typography,
    Chip,
    Stack,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    Divider,
} from "@mui/material";
import {
    Quiz,
    CheckCircle,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import type { Quiz as QuizType, Question } from "../../types/teacherType";
import { quizAttemptResultApiService, type QuizAttemptWithResults } from "../../services/teacherApi/materialApi/quizAttemptResultApi";
import QuizAttemptResultsTable from "./QuizAttemptResultsTable";

interface QuizViewerProps {
    content: QuizType;
    onQuestionsChange?: (questions: Question[]) => void;
}

const TYPE_LABEL: Record<Question["type"], string> = {
    multiple_choice: "Trắc nghiệm",
    true_false: "Đúng / Sai",
};

export default function QuizViewer({ content, onQuestionsChange: _onQuestionsChange }: QuizViewerProps) {
    const [questions, setQuestions] = useState<Question[]>(content.questions ?? []);
    const [attempts, setAttempts] = useState<QuizAttemptWithResults[]>([]);
    const [attemptsLoading, setAttemptsLoading] = useState(false);

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

    const formatDate = (d: Date | null) =>
        d
            ? new Date(d).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            : "\u2014";

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
            </Stack>
            <Divider sx={{ mb: 1 }} />

            {questions.length === 0 ? (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    Chưa có câu hỏi nào.
                </Typography>
            ) : (
                <Stack
                    spacing={0}
                    sx={{
                        maxHeight: 320,
                        overflowY: "auto",
                        pr: 0.5,
                    }}
                >
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
                                        Câu {index + 1}: {q.title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {TYPE_LABEL[q.type]}
                                        {q.options ? ` · ${q.options.length} lựa chọn` : ""}
                                        {q.has2DVisualization ? " · 2D" : ""}
                                    </Typography>
                                    {Array.isArray(q.options) && q.options.length > 0 && (
                                        <Stack spacing={0.25} sx={{ mt: 0.75 }}>
                                            {q.options.map((option, optionIndex) => {
                                                const isCorrect = optionIndex === q.correct_index;
                                                return (
                                                    <Typography
                                                        key={`${q._id ?? index}-option-${optionIndex}`}
                                                        variant="caption"
                                                        color={isCorrect ? "success.main" : "text.secondary"}
                                                        sx={{ fontWeight: isCorrect ? 600 : 400 }}
                                                    >
                                                        {optionIndex + 1}. {option}
                                                        {isCorrect ? " (Đáp án đúng)" : ""}
                                                    </Typography>
                                                );
                                            })}
                                            <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                                                Đáp án đúng: {q.options[q.correct_index] ?? "Không xác định"}
                                            </Typography>
                                        </Stack>
                                    )}
                                </Box>
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            )}

            <QuizAttemptResultsTable attempts={attempts} loading={attemptsLoading} />
        </Box >
    );
}
