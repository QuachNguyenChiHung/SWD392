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
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Divider,
    List,
    ListItem,
    IconButton,
    Tooltip,
} from "@mui/material";
import {
    Download,
    OpenInNew,
    ViewInAr,
    Quiz,
    ExpandMore,
    CheckCircle,
    AddCircleOutline,
    EditOutlined,
    DeleteOutline,
} from "@mui/icons-material";
import { useState } from "react";
import type { ClassMaterial, FileMaterial, SlideMaterial, Render2DMaterial, Quiz as QuizType, Question } from "../types/teacherType";
import QuestionFormModal from "./QuestionFormModal";

interface MaterialTypeViewerProps {
    material: ClassMaterial;
    onQuestionsChange?: (questions: Question[]) => void;
}

const isImageExtension = (path: string) =>
    /\.(gif|png|jpg|jpeg|webp|svg)$/i.test(path);

// ─── QuizViewer sub-component (owns modal state, needs useState) ──────────────

interface QuizViewerProps {
    content: QuizType;
    onQuestionsChange?: (questions: Question[]) => void;
}

function QuizViewer({ content, onQuestionsChange }: QuizViewerProps) {
    const [modalState, setModalState] = useState<{
        open: boolean;
        question: Question | null;
    }>({ open: false, question: null });

    const canEdit = !!onQuestionsChange;
    const questions = content.questions ?? [];

    const formatDate = (d: Date | null) =>
        d
            ? new Date(d).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })
            : "\u2014";

    const TYPE_LABEL: Record<Question["type"], string> = {
        "multiple-choice": "Trắc nghiệm",
        "true-false": "Đúng / Sai",
        "short-answer": "Tự luận",
    };
    const TYPE_COLOR: Record<Question["type"], "primary" | "secondary" | "default"> = {
        "multiple-choice": "primary",
        "true-false": "secondary",
        "short-answer": "default",
    };

    const handleSaveQuestion = (saved: Question) => {
        const updated =
            questions.some((q) => q.id === saved.id)
                ? questions.map((q) => (q.id === saved.id ? saved : q))
                : [...questions, saved];
        onQuestionsChange?.(updated);
    };

    const handleDeleteQuestion = (id: string) =>
        onQuestionsChange?.(questions.filter((q) => q.id !== id));

    return (
        <Box>
            {/* \u2500\u2500 Header chips \u2500\u2500 */}
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

            {/* \u2500\u2500 Summary table \u2500\u2500 */}
            <Paper variant="outlined">
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, width: 180 }}>Từ khoá</TableCell>
                            <TableCell>{content.keyword || "\u2014"}</TableCell>
                        </TableRow>
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

            {/* \u2500\u2500 Questions section \u2500\u2500 */}
            <Box mt={3}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                >
                    <Typography variant="subtitle1" fontWeight={600}>
                        Câu hỏi
                    </Typography>
                    {canEdit && (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<AddCircleOutline />}
                            onClick={() =>
                                setModalState({ open: true, question: null })
                            }
                        >
                            Thêm câu hỏi
                        </Button>
                    )}
                </Stack>
                <Divider sx={{ mb: 1 }} />

                {questions.length === 0 && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                        py={3}
                    >
                        Chưa có câu hỏi nào.
                        {canEdit ? ' Nhấn "Thêm câu hỏi" để bắt đầu.' : ""}
                    </Typography>
                )}

                {questions.map((q, index) => (
                    <Accordion
                        key={q.id}
                        disableGutters
                        variant="outlined"
                        sx={{ mb: 1 }}
                    >
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                width="100%"
                                pr={1}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        minWidth: 24,
                                        height: 24,
                                        borderRadius: "50%",
                                        bgcolor: "primary.main",
                                        color: "primary.contrastText",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 12,
                                        fontWeight: 700,
                                        flexShrink: 0,
                                    }}
                                >
                                    {index + 1}
                                </Typography>
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                    {q.content}
                                </Typography>
                                <Stack
                                    direction="row"
                                    spacing={0.5}
                                    flexShrink={0}
                                    alignItems="center"
                                >
                                    <Chip
                                        label={TYPE_LABEL[q.type]}
                                        color={TYPE_COLOR[q.type]}
                                        size="small"
                                    />
                                    {q.has2DVisualization && (
                                        <Chip
                                            icon={<ViewInAr sx={{ fontSize: 14 }} />}
                                            label="2D"
                                            color="info"
                                            size="small"
                                        />
                                    )}
                                    {canEdit && (
                                        <>
                                            <Tooltip title="Chỉnh sửa câu hỏi">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setModalState({
                                                            open: true,
                                                            question: q,
                                                        });
                                                    }}
                                                >
                                                    <EditOutlined fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Xoá câu hỏi">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteQuestion(q.id);
                                                    }}
                                                >
                                                    <DeleteOutline fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                </Stack>
                            </Stack>
                        </AccordionSummary>

                        <AccordionDetails>
                            <Stack spacing={1.5}>
                                {q.type === "multiple-choice" && q.options && (
                                    <List dense disablePadding>
                                        {q.options.map((opt) => {
                                            const isCorrect = opt === q.correctAnswer;
                                            return (
                                                <ListItem
                                                    key={opt}
                                                    disableGutters
                                                    sx={{
                                                        px: 1.5,
                                                        py: 0.5,
                                                        borderRadius: 1,
                                                        bgcolor: isCorrect
                                                            ? "success.50"
                                                            : "transparent",
                                                        border: isCorrect
                                                            ? "1px solid"
                                                            : "1px solid transparent",
                                                        borderColor: isCorrect
                                                            ? "success.light"
                                                            : "transparent",
                                                    }}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        alignItems="center"
                                                    >
                                                        {isCorrect && (
                                                            <CheckCircle
                                                                sx={{
                                                                    fontSize: 16,
                                                                    color: "success.main",
                                                                }}
                                                            />
                                                        )}
                                                        <Typography variant="body2">
                                                            {opt}
                                                        </Typography>
                                                    </Stack>
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                )}

                                {q.type === "true-false" && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Đáp án đúng:
                                        </Typography>
                                        <Chip
                                            label={
                                                String(q.correctAnswer)
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                String(q.correctAnswer).slice(1)
                                            }
                                            color={
                                                q.correctAnswer === "true"
                                                    ? "success"
                                                    : "error"
                                            }
                                            size="small"
                                        />
                                    </Stack>
                                )}

                                {q.type === "short-answer" && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Câu trả lời mong đợi:
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {String(q.correctAnswer)}
                                        </Typography>
                                    </Stack>
                                )}

                                {q.explanation && (
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            bgcolor: "info.50",
                                            border: "1px solid",
                                            borderColor: "info.light",
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            \ud83d\udca1 {q.explanation}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>

            <QuestionFormModal
                open={modalState.open}
                question={modalState.question}
                onClose={() => setModalState({ open: false, question: null })}
                onSave={handleSaveQuestion}
            />
        </Box>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MaterialTypeViewer({ material, onQuestionsChange }: MaterialTypeViewerProps) {
    // ── FILE ──────────────────────────────────────────────────────────────────
    if (material.type === "file") {
        const content = material.content as FileMaterial;
        return (
            <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Tên tệp: <strong>{content.file_name}</strong>
                </Typography>

                {isImageExtension(content.file_path) ? (
                    <Box
                        component="img"
                        src={content.file_path}
                        alt={content.file_name}
                        sx={{
                            maxWidth: "100%",
                            maxHeight: 420,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            objectFit: "contain",
                            display: "block",
                            mt: 1,
                        }}
                    />
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Không thể xem trước loại tệp này.
                    </Typography>
                )}

                <Button
                    variant="outlined"
                    startIcon={<Download />}
                    href={content.file_path}
                    download={content.file_name}
                    sx={{ mt: 2 }}
                >
                    Tải tệp về
                </Button>
            </Box>
        );
    }

    // ── SLIDE ─────────────────────────────────────────────────────────────────
    if (material.type === "slide") {
        const content = material.content as SlideMaterial;
        return (
            <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Bộ slide: <strong>{content.slide_name}</strong>
                </Typography>

                {/* Embed via Google Docs viewer for .pptx; falls back gracefully */}
                <Box
                    component="iframe"
                    src={`https://docs.google.com/gview?url=${window.location.origin}${content.file_path}&embedded=true`}
                    title={content.slide_name}
                    sx={{
                        width: "100%",
                        height: 420,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        mt: 1,
                    }}
                />

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Download />}
                        href={content.file_path}
                        download={`${content.slide_name}.pptx`}
                    >
                        Tải slide về
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<OpenInNew />}
                        href={content.file_path}
                        target="_blank"
                    >
                        Mở tab mới
                    </Button>
                </Stack>
            </Box>
        );
    }

    // ── 2D RENDER ─────────────────────────────────────────────────────────────
    if (material.type === "2d_render") {
        const content = material.content as Render2DMaterial;
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 4,
                    border: "2px dashed",
                    borderColor: "primary.light",
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    minHeight: 200,
                    gap: 2,
                }}
            >
                <ViewInAr sx={{ fontSize: 56, color: "primary.light" }} />
                <Typography variant="h6" color="text.secondary">
                    Trình xem 2D Render
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    Tính năng 2D tương tác sắp ra mắt.
                </Typography>
                {content.render_data && content.render_data !== "{}" && (
                    <Box
                        component="pre"
                        sx={{
                            mt: 1,
                            p: 2,
                            bgcolor: "background.default",
                            borderRadius: 1,
                            fontSize: 12,
                            maxWidth: "100%",
                            overflow: "auto",
                        }}
                    >
                        {content.render_data}
                    </Box>
                )}
            </Box>
        );
    }

    // ── QUIZ ──────────────────────────────────────────────────────────────────
    if (material.type === "quiz") {
        return (
            <QuizViewer
                content={material.content as QuizType}
                onQuestionsChange={onQuestionsChange}
            />
        );
    }


    return (
        <Typography variant="body2" color="text.secondary">
            Loại tài liệu không xác định.
        </Typography>
    );
}
