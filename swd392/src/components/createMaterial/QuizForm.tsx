import {
    Box,
    Stack,
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
} from "@mui/material";
import { DateField } from '@mui/x-date-pickers/DateField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { type Dayjs } from 'dayjs';

import type { Question } from "../../types/teacherType";
import QuestionManager from "../QuestionManager";

interface QuizFormProps {
    quizType: string;
    onQuizTypeChange: (value: string) => void;
    quizTitle: string;
    onQuizTitleChange: (value: string) => void;
    quizStartDate: string;
    onQuizStartDateChange: (value: string) => void;
    quizEndDate: string;
    onQuizEndDateChange: (value: string) => void;
    maxAttempts: number | "";
    onMaxAttemptsChange: (value: number | "") => void;
    questions: Question[];
    onQuestionsChange: (questions: Question[]) => void;
}

export default function QuizForm({
    quizType,
    onQuizTypeChange,
    quizTitle,
    onQuizTitleChange,
    quizStartDate,
    onQuizStartDateChange,
    quizEndDate,
    onQuizEndDateChange,
    maxAttempts,
    onMaxAttemptsChange,
    questions,
    onQuestionsChange
}: QuizFormProps) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
                <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                    <FormLabel component="legend">Loại bài kiểm tra</FormLabel>
                    <RadioGroup
                        value={quizType}
                        onChange={(e) => onQuizTypeChange(e.target.value)}
                    >
                        <FormControlLabel
                            value="interactive"
                            control={<Radio />}
                            label="Câu hỏi tương tác (có thể có 2D visualization)"
                        />
                        <FormControlLabel
                            value="standard"
                            control={<Radio />}
                            label="Chỉ câu hỏi thông thường"
                        />
                    </RadioGroup>
                </FormControl>

                {/* Quiz-specific settings */}
                <Stack spacing={2} sx={{ mb: 3 }}>
                    <TextField
                        label="Tiêu đề bài kiểm tra"
                        variant="outlined"
                        fullWidth
                        value={quizTitle}
                        onChange={(e) => onQuizTitleChange(e.target.value)}
                        placeholder="Để trống để sử dụng tên tài liệu"
                        helperText="Tiêu đề riêng cho bài kiểm tra (tùy chọn)"
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <DateField
                            label="Ngày bắt đầu"
                            fullWidth
                            value={quizStartDate ? dayjs(quizStartDate) : null}
                            format="DD/MM/YYYY"
                            onChange={(value: Dayjs | null) => onQuizStartDateChange(value && value.isValid() ? value.toISOString() : "")}
                            helperText="Thời gian mở bài kiểm tra (tùy chọn)"
                        />
                        <DateField
                            label="Ngày kết thúc"
                            fullWidth
                            value={quizEndDate ? dayjs(quizEndDate) : null}
                            format="DD/MM/YYYY"
                            onChange={(value: Dayjs | null) => onQuizEndDateChange(value && value.isValid() ? value.toISOString() : "")}
                            helperText="Thời gian đóng bài kiểm tra (tùy chọn)"
                        />
                    </Stack>

                    <TextField
                        label="Số lần làm tối đa"
                        type="number"
                        variant="outlined"
                        fullWidth
                        value={maxAttempts}
                        onChange={(e) => onMaxAttemptsChange(e.target.value === "" ? "" : parseInt(e.target.value))}
                        inputProps={{ min: 1, max: 20 }}
                        helperText="Giới hạn số lần học sinh có thể làm bài (tùy chọn)"
                    />
                </Stack>

                <QuestionManager
                    questions={questions}
                    onChange={onQuestionsChange}
                    quizType={quizType as 'interactive' | 'standard'}
                />
            </Box>
        </LocalizationProvider>
    );
}
