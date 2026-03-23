import {
    Box,
    Typography,
    Stack,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    IconButton,
    Paper,
    Switch,
    FormControlLabel,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import {
    Add,
    Delete,
    ExpandMore,
    ViewInAr,
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import type { Question } from "../types/teacherType";
import { COLORS, RADIUS } from "../pages/teacher/teacherStyles";

// Local wrapper to track questions in the UI without assigning _id
interface LocalQuestion extends Question {
    tempId: string;
}

interface QuestionManagerProps {
    questions: Question[];
    onChange: (questions: Question[]) => void;
    quizType: 'interactive' | 'standard';
}

export default function QuestionManager({ questions, onChange, quizType }: QuestionManagerProps) {
    const [expandedQuestion, setExpandedQuestion] = useState<string | false>(false);

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: RADIUS,
            bgcolor: "#FBFDFF",
            "& fieldset": {
                borderColor: COLORS.border,
            },
            "&:hover fieldset": {
                borderColor: COLORS.accent,
            },
            "&.Mui-focused fieldset": {
                borderColor: COLORS.accent,
            },
        },
    };

    const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    // Local editable state with stable tempId per row
    const [localQuestions, setLocalQuestions] = useState<LocalQuestion[]>([]);

    useEffect(() => {
        setLocalQuestions((prev) => {
            const prevById = new Map(
                prev
                    .filter((p) => !!p._id)
                    .map((p) => [p._id as string, p.tempId])
            );

            return questions.map((q, i) => ({
                ...q,
                tempId:
                    (q._id ? prevById.get(q._id) : undefined) ||
                    prev[i]?.tempId ||
                    generateTempId(),
            }));
        });
    }, [questions]);

    // Strip tempId before passing back to parent
    const emitChange = (updated: LocalQuestion[]) => {
        setLocalQuestions(updated);
        onChange(updated.map(({ tempId, ...rest }) => rest));
    };

    const patchQuestion = (tempId: string, updates: Partial<Question>) => {
        emitChange(
            localQuestions.map((q) => (q.tempId === tempId ? { ...q, ...updates } : q))
        );
    };

    const addQuestion = () => {
        const newQuestion: LocalQuestion = {
            tempId: generateTempId(),
            title: "",
            type: "multiple_choice",
            options: ["", "", "", ""],
            correct_index: 0,
            has2DVisualization: false,
        };

        const updated = [...localQuestions, newQuestion];
        emitChange(updated);
        setExpandedQuestion(newQuestion.tempId);
    };

    const removeQuestion = (tempId: string) => {
        const updated = localQuestions.filter((q) => q.tempId !== tempId);
        emitChange(updated);
        if (expandedQuestion === tempId) {
            setExpandedQuestion(false);
        }
    };

    const updateQuestionOption = (tempId: string, optionIndex: number, value: string) => {
        const question = localQuestions.find((q) => q.tempId === tempId);
        if (!question) return;

        const newOptions = [...question.options];
        newOptions[optionIndex] = value;
        patchQuestion(tempId, { options: newOptions });
    };

    const addOption = (tempId: string) => {
        const question = localQuestions.find((q) => q.tempId === tempId);
        if (!question) return;

        const newOptions = [...question.options, ""];
        patchQuestion(tempId, { options: newOptions });
    };

    const removeOption = (tempId: string, optionIndex: number) => {
        const question = localQuestions.find((q) => q.tempId === tempId);
        if (!question || question.options.length <= 2) return;

        const newOptions = question.options.filter((_, index) => index !== optionIndex);
        patchQuestion(tempId, { options: newOptions });
    };

    const handleAccordionChange = (tempId: string) => (
        _event: React.SyntheticEvent,
        isExpanded: boolean
    ) => {
        setExpandedQuestion(isExpanded ? tempId : false);
    };

    return (
        <Box
            sx={{
                p: 2,
                border: `1px solid ${COLORS.border}`,
                borderRadius: RADIUS,
                bgcolor: "#fff",
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                    <Typography
                        sx={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: COLORS.textSecondary,
                        }}
                    >
                        Question bank
                    </Typography>
                    <Typography variant="h6" sx={{ color: COLORS.textDark, fontWeight: 700 }}>
                        Câu hỏi ({questions.length})
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={addQuestion}
                    sx={{
                        borderRadius: RADIUS,
                        textTransform: "none",
                        fontWeight: 700,
                        bgcolor: COLORS.accent,
                        boxShadow: "none",
                        "&:hover": {
                            bgcolor: "#165a99",
                            boxShadow: "none",
                        },
                    }}
                >
                    Thêm câu hỏi
                </Button>
            </Stack>

            <Stack spacing={2}>
                {localQuestions.map((question, index) => (
                    <Accordion
                        key={question.tempId}
                        expanded={expandedQuestion === question.tempId}
                        onChange={handleAccordionChange(question.tempId)}
                        disableGutters
                        elevation={0}
                        sx={{
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: `${RADIUS} !important`,
                            overflow: "hidden",
                            "&:before": { display: "none" },
                            bgcolor: "#fff",
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMore sx={{ color: COLORS.textSecondary }} />}
                            sx={{
                                px: 2,
                                py: 0.5,
                                bgcolor: expandedQuestion === question.tempId ? COLORS.bg : "#fff",
                                borderBottom:
                                    expandedQuestion === question.tempId
                                        ? `1px solid ${COLORS.border}`
                                        : "none",
                                "& .MuiAccordionSummary-content": {
                                    my: 1,
                                },
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                                <Typography variant="subtitle1" sx={{ color: COLORS.textDark, fontWeight: 600, flex: 1 }}>
                                    Câu {index + 1}: {question.title || "Chưa có nội dung"}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip
                                        label={
                                            question.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Đúng/Sai'
                                        }
                                        size="small"
                                        sx={{
                                            borderRadius: RADIUS,
                                            bgcolor: COLORS.accentLight,
                                            color: COLORS.accent,
                                            border: `1px solid ${COLORS.border}`,
                                            fontWeight: 700,
                                        }}
                                    />
                                    {question.has2DVisualization && (
                                        <Chip
                                            icon={<ViewInAr />}
                                            label="2D"
                                            size="small"
                                            sx={{
                                                borderRadius: RADIUS,
                                                bgcolor: "#F5F3FF",
                                                color: "#7C3AED",
                                                border: `1px solid ${COLORS.border}`,
                                                fontWeight: 700,
                                            }}
                                        />
                                    )}
                                </Box>
                            </Stack>
                        </AccordionSummary>

                        <AccordionDetails sx={{ p: 2.5 }}>
                            <Stack spacing={3}>
                                {/* Question Content */}
                                <TextField
                                    label="Nội dung câu hỏi"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    value={question.title}
                                    onChange={(e) => patchQuestion(question.tempId, { title: e.target.value })}
                                    required
                                    sx={inputSx}
                                />

                                {/* Question Type */}
                                <FormControl fullWidth>
                                    <InputLabel>Loại câu hỏi</InputLabel>
                                    <Select
                                        value={question.type}
                                        label="Loại câu hỏi"
                                        onChange={(e) => patchQuestion(question.tempId, {
                                            type: e.target.value as Question['type'],
                                            options: e.target.value === 'multiple_choice' ? (question.options || ["", "", "", ""]) :
                                                ["Đúng", "Sai"],
                                            correct_index: 0,
                                        })}
                                        sx={inputSx}
                                    >
                                        <MenuItem value="multiple_choice">Trắc nghiệm</MenuItem>
                                        <MenuItem value="true_false">Đúng/Sai</MenuItem>
                                    </Select>
                                </FormControl>

                                {/* 2D Visualization Toggle (only for interactive quizzes) */}
                                {quizType === 'interactive' && (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={question.has2DVisualization || false}
                                                onChange={(e) => patchQuestion(question.tempId, { has2DVisualization: e.target.checked })}
                                            />
                                        }
                                        label="Có hỗ trợ trực quan hóa 2D"
                                    />
                                )}

                                {/* Options (for multiple choice and true/false) */}
                                {question.options && (
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2">Các lựa chọn</Typography>
                                            {question.type === 'multiple_choice' && (
                                                <Button
                                                    size="small"
                                                    onClick={() => addOption(question.tempId)}
                                                    sx={{
                                                        borderRadius: RADIUS,
                                                        textTransform: "none",
                                                        fontWeight: 700,
                                                        color: COLORS.accent,
                                                    }}
                                                >
                                                    Thêm lựa chọn
                                                </Button>
                                            )}
                                        </Stack>

                                        <Stack spacing={2}>
                                            {question.options.map((option, optionIndex) => (
                                                <Paper
                                                    key={optionIndex}
                                                    variant="outlined"
                                                    sx={{
                                                        p: 1.2,
                                                        borderRadius: RADIUS,
                                                        borderColor: COLORS.border,
                                                        bgcolor: "#fff",
                                                    }}
                                                >
                                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%" }}>
                                                    <TextField
                                                        label={`Lựa chọn ${optionIndex + 1}`}
                                                        value={option}
                                                        onChange={(e) => updateQuestionOption(question.tempId, optionIndex, e.target.value)}
                                                        size="small"
                                                        sx={{ flex: 1, ...inputSx }}
                                                    />
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Button
                                                            variant={question.correct_index === optionIndex ? "contained" : "outlined"}
                                                            size="small"
                                                            onClick={() => patchQuestion(question.tempId, { correct_index: optionIndex })}
                                                            sx={
                                                                question.correct_index === optionIndex
                                                                    ? {
                                                                          borderRadius: RADIUS,
                                                                          textTransform: "none",
                                                                          fontWeight: 700,
                                                                          bgcolor: COLORS.success,
                                                                          "&:hover": { bgcolor: "#16A34A" },
                                                                      }
                                                                    : {
                                                                          borderRadius: RADIUS,
                                                                          textTransform: "none",
                                                                          fontWeight: 700,
                                                                          borderColor: COLORS.border,
                                                                          color: COLORS.textDark,
                                                                          "&:hover": {
                                                                              borderColor: COLORS.accent,
                                                                              bgcolor: COLORS.accentLight,
                                                                          },
                                                                      }
                                                            }
                                                        >
                                                            {question.correct_index === optionIndex ? "Đáp án đúng" : "Chọn làm đáp án"}
                                                        </Button>
                                                        {question.type === 'multiple_choice' && question.options!.length > 2 && (
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => removeOption(question.tempId, optionIndex)}
                                                                color="error"
                                                            >
                                                                <Delete />
                                                            </IconButton>
                                                        )}
                                                    </Stack>
                                                    </Stack>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                {/* Remove Question Button */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={() => removeQuestion(question.tempId)}
                                        size="small"
                                        sx={{ borderRadius: RADIUS, textTransform: "none", fontWeight: 700 }}
                                    >
                                        Xóa câu hỏi
                                    </Button>
                                </Box>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                ))}

                {questions.length === 0 && (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            bgcolor: COLORS.bg,
                            borderColor: COLORS.border,
                            borderRadius: RADIUS,
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.
                        </Typography>
                    </Paper>
                )}
            </Stack>
        </Box>
    );
}