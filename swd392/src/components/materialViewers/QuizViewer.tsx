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
import { COLORS, RADIUS, tableContainer, tableBodyRow, flatChip } from "../../pages/teacher/teacherStyles";

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
                <Typography sx={{ color: COLORS.error, fontSize: "0.85rem" }}>Dữ liệu quiz không hợp lệ</Typography>
            </Box>
        );
    }

    if (!content.title) {
        return (
            <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography sx={{ color: COLORS.error, fontSize: "0.85rem" }}>Quiz thiếu tiêu đề</Typography>
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
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                <Quiz sx={{ color: COLORS.info }} />
                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: COLORS.textDark }}>
                    {content.title}
                </Typography>
                <Chip
                    label={content.type === "interactive" ? "Tương tác" : "Thông thường"}
                    sx={
                        content.type === "interactive"
                            ? flatChip(COLORS.infoBg, COLORS.info)
                            : flatChip(COLORS.bg, COLORS.textSecondary)
                    }
                />
                <Chip
                    label={content.status ? "Đang hoạt động" : "Không hoạt động"}
                    sx={
                        content.status
                            ? flatChip(COLORS.successBg, COLORS.success)
                            : flatChip(COLORS.bg, COLORS.textSecondary)
                    }
                />
            </Stack>

            {/* Summary table */}
            <Paper elevation={0} sx={{ ...tableContainer, mb: 4, border: `1px solid ${COLORS.info}` }}>
                <Table size="small">
                    <TableBody>
                        <TableRow sx={tableBodyRow}>
                            <TableCell sx={{ fontWeight: 600, width: "30%" }}>Ngày mở</TableCell>
                            <TableCell>{formatDate(content.available_date)}</TableCell>
                        </TableRow>
                        <TableRow sx={tableBodyRow}>
                            <TableCell sx={{ fontWeight: 600 }}>Hạn nộp</TableCell>
                            <TableCell>{formatDate(content.end_date)}</TableCell>
                        </TableRow>
                        <TableRow sx={tableBodyRow}>
                            <TableCell sx={{ fontWeight: 600 }}>Số lần thử tối đa</TableCell>
                            <TableCell>{content.max_attempt_number ?? "Không giới hạn"}</TableCell>
                        </TableRow>
                        <TableRow sx={tableBodyRow}>
                            <TableCell sx={{ fontWeight: 600, borderBottom: "none" }}>Câu hỏi</TableCell>
                            <TableCell sx={{ borderBottom: "none" }}>{questions.length}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Paper>

            {/* Questions list */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em", color: COLORS.textDark }}>
                    Danh sách Câu hỏi
                </Typography>
            </Stack>
            <Divider sx={{ mb: 2, borderColor: COLORS.borderLight }} />

            {questions.length === 0 ? (
                <Typography sx={{ fontSize: "0.85rem", color: COLORS.textSecondary, textAlign: "center", py: 4 }}>
                    Chưa có câu hỏi nào.
                </Typography>
            ) : (
                <Stack
                    spacing={0}
                    sx={{
                        maxHeight: 400,
                        overflowY: "auto",
                        pr: 1,
                        "&::-webkit-scrollbar": {
                            width: "6px",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            backgroundColor: COLORS.border,
                            borderRadius: RADIUS,
                        },
                    }}
                >
                    {questions.map((q, index) => (
                        <Box
                            key={q._id ?? index}
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 2,
                                py: 2,
                                borderBottom: `1px solid ${COLORS.borderLight}`,
                                "&:last-child": {
                                    borderBottom: "none",
                                },
                            }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
                                <CheckCircle sx={{ color: COLORS.info, fontSize: 20, mt: 0.25 }} />
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: COLORS.textDark, mb: 0.5 }}>
                                        Câu {index + 1}: {q.title}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.75rem", color: COLORS.textSecondary, mb: 1 }}>
                                        {TYPE_LABEL[q.type]}
                                        {q.options ? ` · ${q.options.length} lựa chọn` : ""}
                                        {q.has2DVisualization ? " · 2D" : ""}
                                    </Typography>

                                    {Array.isArray(q.options) && q.options.length > 0 && (
                                        <Stack spacing={0.5} sx={{ mt: 1, pl: 1, borderLeft: `2px solid ${COLORS.borderLight}` }}>
                                            {q.options.map((option, optionIndex) => {
                                                const isCorrect = optionIndex === q.correct_index;
                                                return (
                                                    <Typography
                                                        key={`${q._id ?? index}-option-${optionIndex}`}
                                                        sx={{
                                                            fontSize: "0.85rem",
                                                            color: isCorrect ? COLORS.info : COLORS.textSecondary,
                                                            fontWeight: isCorrect ? 600 : 400,
                                                            bgcolor: isCorrect ? COLORS.infoBg : "transparent",
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: RADIUS,
                                                        }}
                                                    >
                                                        {String.fromCharCode(65 + optionIndex)}. {option}
                                                        {isCorrect && " (Đáp án đúng)"}
                                                    </Typography>
                                                );
                                            })}
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
