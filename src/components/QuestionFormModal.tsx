import {
    Modal,
    Box,
    Typography,
    Stack,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Radio,
    RadioGroup,
    FormLabel,
    IconButton,
    Divider,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useState, useEffect } from "react";
import type { Question } from "../types/teacherType";

interface QuestionFormModalProps {
    open: boolean;
    /** null = adding a new question */
    question: Question | null;
    onClose: () => void;
    onSave: (q: Question) => void;
}

const EMPTY_QUESTION: Omit<Question, "_id"> = {
    content: "",
    type: "multiple-choice",
    options: ["", ""],
    correctAnswer: "",
};

const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "92%", sm: 580 },
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    maxHeight: "88vh",
    overflowY: "auto",
};

export default function QuestionFormModal({
    open,
    question,
    onClose,
    onSave,
}: QuestionFormModalProps) {
    const isEdit = question !== null;

    const [form, setForm] = useState<Question>({
        ...EMPTY_QUESTION,
    });
    /** separate state for MC options so we can add/remove rows */
    const [mcOptions, setMcOptions] = useState<string[]>(["", ""]);
    const [mcCorrect, setMcCorrect] = useState("");

    // Sync whenever the modal opens or the question changes
    useEffect(() => {
        if (!open) return;
        if (question) {
            setForm(question);
            setMcOptions(question.options ?? ["", ""]);
            setMcCorrect(
                question.type === "multiple-choice" ? String(question.correctAnswer) : ""
            );
        } else {
            setForm({ ...EMPTY_QUESTION });
            setMcOptions(["", ""]);
            setMcCorrect("");
        }
    }, [open, question]);

    // Switching type resets type-specific fields
    const handleTypeChange = (t: Question["type"]) => {
        setForm((prev) => ({
            ...prev,
            type: t,
            options: t === "multiple-choice" ? ["", ""] : undefined,
            correctAnswer: t === "true-false" ? "true" : "",
        }));
        setMcOptions(["", ""]);
        setMcCorrect("");
    };

    const handleOptionChange = (index: number, value: string) => {
        const updated = [...mcOptions];
        const old = updated[index];
        updated[index] = value;
        setMcOptions(updated);
        // keep the correct-answer pointer in sync
        if (mcCorrect === old) setMcCorrect(value);
    };

    const handleRemoveOption = (index: number) => {
        const removed = mcOptions[index];
        const updated = mcOptions.filter((_, i) => i !== index);
        setMcOptions(updated);
        if (mcCorrect === removed) setMcCorrect("");
    };

    const handleSave = () => {
        const saved: Question = {
            ...form,
            options:
                form.type === "multiple-choice"
                    ? mcOptions.filter((o) => o.trim() !== "")
                    : undefined,
            correctAnswer:
                form.type === "multiple-choice" ? mcCorrect : form.correctAnswer,
        };
        onSave(saved);
        onClose();
    };

    // Basic validation
    const isValid =
        form.content.trim() !== "" &&
        (form.type !== "multiple-choice" ||
            (mcOptions.filter((o) => o.trim() !== "").length >= 2 &&
                mcCorrect.trim() !== "")) &&
        (form.type === "multiple-choice" ||
            String(form.correctAnswer).trim() !== "");

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                    {isEdit ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi"}
                </Typography>

                <Stack spacing={2.5}>
                    {/* ── Question content ── */}
                    <TextField
                        label="Nội dung câu hỏi"
                        value={form.content}
                        onChange={(e) =>
                            setForm((p) => ({ ...p, content: e.target.value }))
                        }
                        multiline
                        minRows={2}
                        fullWidth
                        required
                    />

                    {/* ── Question type ── */}
                    <FormControl fullWidth>
                        <InputLabel>Loại câu hỏi</InputLabel>
                        <Select
                            value={form.type}
                            label="Loại câu hỏi"
                            onChange={(e) =>
                                handleTypeChange(e.target.value as Question["type"])
                            }
                        >
                            <MenuItem value="multiple-choice">Trắc nghiệm</MenuItem>
                            <MenuItem value="true-false">Đúng / Sai</MenuItem>
                        </Select>
                    </FormControl>

                    {/* ── Multiple-choice options ── */}
                    {form.type === "multiple-choice" && (
                        <Box>
                            <FormLabel sx={{ display: "block", mb: 1, fontSize: 14 }}>
                                Các lựa chọn — chọn đáp án đúng bằng ●
                            </FormLabel>
                            <RadioGroup
                                value={mcCorrect}
                                onChange={(e) => setMcCorrect(e.target.value)}
                            >
                                <Stack spacing={1}>
                                    {mcOptions.map((opt, i) => (
                                        <Stack
                                            key={i}
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                        >
                                            <Radio
                                                value={opt}
                                                disabled={opt.trim() === ""}
                                                size="small"
                                            />
                                            <TextField
                                                value={opt}
                                                onChange={(e) =>
                                                    handleOptionChange(i, e.target.value)
                                                }
                                                placeholder={`Option ${i + 1}`}
                                                size="small"
                                                sx={{ flex: 1 }}
                                            />
                                            {mcOptions.length > 2 && (
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleRemoveOption(i)}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    ))}
                                </Stack>
                            </RadioGroup>
                            {mcOptions.length < 6 && (
                                <Button
                                    startIcon={<Add />}
                                    size="small"
                                    sx={{ mt: 1 }}
                                    onClick={() => setMcOptions((p) => [...p, ""])}
                                >
                                    Thêm lựa chọn
                                </Button>
                            )}
                        </Box>
                    )}

                    {/* ── True / False ── */}
                    {form.type === "true-false" && (
                        <FormControl>
                            <FormLabel>Đáp án đúng</FormLabel>
                            <RadioGroup
                                row
                                value={String(form.correctAnswer)}
                                onChange={(e) =>
                                    setForm((p) => ({ ...p, correctAnswer: e.target.value }))
                                }
                            >
                                <FormControlLabel
                                    value="true"
                                    control={<Radio />}
                                    label="Đúng"
                                />
                                <FormControlLabel
                                    value="false"
                                    control={<Radio />}
                                    label="Sai"
                                />
                            </RadioGroup>
                        </FormControl>
                    )}

                    <Divider />

                    {/* ── Actions ── */}
                    <Stack direction="row" spacing={1} justifyContent="flex-end" pt={1}>
                        <Button variant="outlined" onClick={onClose}>
                            Huỷ
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={!isValid}
                        >
                            {isEdit ? "Lưu thay đổi" : "Thêm câu hỏi"}
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Modal>
    );
}
