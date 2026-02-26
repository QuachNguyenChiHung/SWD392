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
import { useState } from "react";
import type { Question } from "../types/teacherType";

interface QuestionManagerProps {
    questions: Question[];
    onChange: (questions: Question[]) => void;
    quizType: 'interactive' | 'standard';
}

export default function QuestionManager({ questions, onChange, quizType }: QuestionManagerProps) {
    const [expandedQuestion, setExpandedQuestion] = useState<string | false>(false);

    const generateQuestionId = () => {
        return `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    };

    const addQuestion = () => {
        const newQuestion: Question = {
            id: generateQuestionId(),
            content: "",
            type: "multiple-choice",
            options: ["", "", "", ""],
            correctAnswer: "",
            explanation: "",
            has2DVisualization: false,
        };

        onChange([...questions, newQuestion]);
        setExpandedQuestion(newQuestion.id);
    };

    const updateQuestion = (questionId: string, updates: Partial<Question>) => {
        const updatedQuestions = questions.map(q =>
            q.id === questionId ? { ...q, ...updates } : q
        );
        onChange(updatedQuestions);
    };

    const removeQuestion = (questionId: string) => {
        const updatedQuestions = questions.filter(q => q.id !== questionId);
        onChange(updatedQuestions);
        if (expandedQuestion === questionId) {
            setExpandedQuestion(false);
        }
    };

    const updateQuestionOption = (questionId: string, optionIndex: number, value: string) => {
        const question = questions.find(q => q.id === questionId);
        if (!question || !question.options) return;

        const newOptions = [...question.options];
        newOptions[optionIndex] = value;
        updateQuestion(questionId, { options: newOptions });
    };

    const addOption = (questionId: string) => {
        const question = questions.find(q => q.id === questionId);
        if (!question || !question.options) return;

        const newOptions = [...question.options, ""];
        updateQuestion(questionId, { options: newOptions });
    };

    const removeOption = (questionId: string, optionIndex: number) => {
        const question = questions.find(q => q.id === questionId);
        if (!question || !question.options || question.options.length <= 2) return;

        const newOptions = question.options.filter((_, index) => index !== optionIndex);
        updateQuestion(questionId, { options: newOptions });
    };

    const handleAccordionChange = (questionId: string) => (
        event: React.SyntheticEvent,
        isExpanded: boolean
    ) => {
        setExpandedQuestion(isExpanded ? questionId : false);
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
                {questions.map((question, index) => (
                    <Accordion
                        key={question.id}
                        expanded={expandedQuestion === question.id}
                        onChange={handleAccordionChange(question.id)}
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
                                    onChange={(e) => updateQuestion(question.id, { content: e.target.value })}
                                    required
                                />

                                {/* Question Type */}
                                <FormControl fullWidth>
                                    <InputLabel>Loại câu hỏi</InputLabel>
                                    <Select
                                        value={question.type}
                                        label="Loại câu hỏi"
                                        onChange={(e) => updateQuestion(question.id, {
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
                                                onChange={(e) => updateQuestion(question.id, { has2DVisualization: e.target.checked })}
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
                                                <Button size="small" onClick={() => addOption(question.id)}>
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
                                                        onChange={(e) => updateQuestionOption(question.id, optionIndex, e.target.value)}
                                                        fullWidth
                                                        size="small"
                                                    />
                                                    <Button
                                                        variant={question.correctAnswer === option ? "contained" : "outlined"}
                                                        size="small"
                                                        onClick={() => updateQuestion(question.id, { correctAnswer: option })}
                                                        color={question.correctAnswer === option ? "success" : "primary"}
                                                    >
                                                        {question.correctAnswer === option ? "Đáp án đúng" : "Chọn làm đáp án"}
                                                    </Button>
                                                    {question.type === 'multiple-choice' && question.options!.length > 2 && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => removeOption(question.id, optionIndex)}
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
                                        onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                                        helperText="Nhập đáp án mẫu hoặc từ khóa chấm điểm"
                                    />
                                )}

                                {/* Explanation */}
                                <TextField
                                    label="Giải thích (tùy chọn)"
                                    multiline
                                    rows={2}
                                    fullWidth
                                    value={question.explanation || ""}
                                    onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                                    helperText="Giải thích sẽ hiển thị sau khi học sinh làm bài"
                                />

                                {/* Remove Question Button */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Delete />}
                                        onClick={() => removeQuestion(question.id)}
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