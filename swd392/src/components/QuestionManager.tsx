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

    // Assign stable tempIds for UI tracking
    const [localQuestions, setLocalQuestions] = useState<LocalQuestion[]>(() =>
        questions.map(q => ({ ...q, tempId: q._id || generateTempId() }))
    );

    // Keep localQuestions in sync when questions prop changes externally
    useEffect(() => {
        const synced = questions.map((q, i) => ({
            ...q,
            tempId: localQuestions[i]?.tempId || q._id || generateTempId()
        }));
        setLocalQuestions(synced);
    }, [questions]);

    function generateTempId(): string {
        return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Strip tempId before passing back to parent
    const emitChange = (updated: LocalQuestion[]) => {
        setLocalQuestions(updated);
        onChange(updated.map(({ tempId, ...rest }) => rest));
    };

    const addQuestion = () => {
        const newQuestion: LocalQuestion = {
            tempId: generateTempId(),
            content: "",
            type: "multiple-choice",
            options: ["", "", "", ""],
            correctAnswer: "",
            has2DVisualization: false,
        };

        const updated = [...localQuestions, newQuestion];
        emitChange(updated);
        setExpandedQuestion(newQuestion.tempId);
    };

    const updateQuestion = (tempId: string, updates: Partial<Question>) => {
        const updated = localQuestions.map(q =>
            q.tempId === tempId ? { ...q, ...updates } : q
        );
        emitChange(updated);
    };

    const removeQuestion = (tempId: string) => {
        const updated = localQuestions.filter(q => q.tempId !== tempId);
        emitChange(updated);
        if (expandedQuestion === tempId) {
            setExpandedQuestion(false);
        }
    };

    const updateQuestionOption = (tempId: string, optionIndex: number, value: string) => {
        const question = localQuestions.find(q => q.tempId === tempId);
        if (!question || !question.options) return;

        const newOptions = [...question.options];
        newOptions[optionIndex] = value;
        updateQuestion(tempId, { options: newOptions });
    };

    const addOption = (tempId: string) => {
        const question = localQuestions.find(q => q.tempId === tempId);
        if (!question || !question.options) return;

        const newOptions = [...question.options, ""];
        updateQuestion(tempId, { options: newOptions });
    };

    const removeOption = (tempId: string, optionIndex: number) => {
        const question = localQuestions.find(q => q.tempId === tempId);
        if (!question || !question.options || question.options.length <= 2) return;

        const newOptions = question.options.filter((_, index) => index !== optionIndex);
        updateQuestion(tempId, { options: newOptions });
    };

    const handleAccordionChange = (tempId: string) => (
        _event: React.SyntheticEvent,
        isExpanded: boolean
    ) => {
        setExpandedQuestion(isExpanded ? tempId : false);
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">Câu hỏi ({questions.length})</Typography>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={addQuestion}
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
                    >
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                                <Typography variant="subtitle1">
                                    Câu {index + 1}: {question.content || "Chưa có nội dung"}
                                </Typography>
                                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                                    <Chip
                                        label={
                                            question.type === 'multiple-choice' ? 'Trắc nghiệm' :
                                                question.type === 'true-false' ? 'Đúng/Sai' : 'Tự luận'
                                        }
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                    {question.has2DVisualization && (
                                        <Chip
                                            icon={<ViewInAr />}
                                            label="2D"
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    )}
                                </Box>
                            </Stack>
                        </AccordionSummary>

                        <AccordionDetails>
                            <Stack spacing={3}>
                                {/* Question Content */}
                                <TextField
                                    label="Nội dung câu hỏi"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    value={question.content}
                                    onChange={(e) => updateQuestion(question.tempId, { content: e.target.value })}
                                    required
                                />

                                {/* Question Type */}
                                <FormControl fullWidth>
                                    <InputLabel>Loại câu hỏi</InputLabel>
                                    <Select
                                        value={question.type}
                                        label="Loại câu hỏi"
                                        onChange={(e) => updateQuestion(question.tempId, {
                                            type: e.target.value as Question['type'],
                                            options: e.target.value === 'multiple-choice' ? (question.options || ["", "", "", ""]) :
                                                e.target.value === 'true-false' ? ["Đúng", "Sai"] : undefined,
                                            correctAnswer: ""
                                        })}
                                    >
                                        <MenuItem value="multiple-choice">Trắc nghiệm</MenuItem>
                                        <MenuItem value="true-false">Đúng/Sai</MenuItem>
                                        <MenuItem value="short-answer">Tự luận ngắn</MenuItem>
                                    </Select>
                                </FormControl>

                                {/* 2D Visualization Toggle (only for interactive quizzes) */}
                                {quizType === 'interactive' && (
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={question.has2DVisualization || false}
                                                onChange={(e) => updateQuestion(question.tempId, { has2DVisualization: e.target.checked })}
                                            />
                                        }
                                        label="Có hỗ trợ trực quan hóa 2D"
                                    />
                                )}

                                {/* Options (for multiple choice and true/false) */}
                                {question.type !== 'short-answer' && question.options && (
                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2">Các lựa chọn</Typography>
                                            {question.type === 'multiple-choice' && (
                                                <Button size="small" onClick={() => addOption(question.tempId)}>
                                                    Thêm lựa chọn
                                                </Button>
                                            )}
                                        </Stack>

                                        <Stack spacing={2}>
                                            {question.options.map((option, optionIndex) => (
                                                <Stack key={optionIndex} direction="row" spacing={2} alignItems="center">
                                                    <TextField
                                                        label={`Lựa chọn ${optionIndex + 1}`}
                                                        value={option}
                                                        onChange={(e) => updateQuestionOption(question.tempId, optionIndex, e.target.value)}
                                                        fullWidth
                                                        size="small"
                                                    />
                                                    <Button
                                                        variant={question.correctAnswer === option ? "contained" : "outlined"}
                                                        size="small"
                                                        onClick={() => updateQuestion(question.tempId, { correctAnswer: option })}
                                                        color={question.correctAnswer === option ? "success" : "primary"}
                                                    >
                                                        {question.correctAnswer === option ? "Đáp án đúng" : "Chọn làm đáp án"}
                                                    </Button>
                                                    {question.type === 'multiple-choice' && question.options!.length > 2 && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => removeOption(question.tempId, optionIndex)}
                                                            color="error"
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    )}
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                                {/* Correct Answer for short answer */}
                                {question.type === 'short-answer' && (
                                    <TextField
                                        label="Đáp án mẫu"
                                        fullWidth
                                        value={question.correctAnswer}
                                        onChange={(e) => updateQuestion(question.tempId, { correctAnswer: e.target.value })}
                                        helperText="Nhập đáp án mẫu hoặc từ khóa chấm điểm"
                                    />
                                )}

                                {/* Remove Question Button */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={() => removeQuestion(question.tempId)}
                                        size="small"
                                    >
                                        Xóa câu hỏi
                                    </Button>
                                </Box>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                ))}

                {questions.length === 0 && (
                    <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <Typography variant="body2" color="text.secondary">
                            Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.
                        </Typography>
                    </Paper>
                )}
            </Stack>
        </Box>
    );
}