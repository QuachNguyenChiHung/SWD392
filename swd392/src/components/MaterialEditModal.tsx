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
    Switch,
    FormControlLabel,
} from "@mui/material";
import { useState, useEffect } from "react";
import type { ClassMaterial, Quiz, FileMaterial, SlideMaterial } from "../types/teacherType";

interface MaterialEditModalProps {
    open: boolean;
    material: ClassMaterial;
    onClose: () => void;
    onSave: (updated: ClassMaterial) => void;
}

const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "90%", sm: 520 },
    bgcolor: "background.paper",
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
    maxHeight: "85vh",
    overflowY: "auto",
};

export default function MaterialEditModal({
    open,
    material,
    onClose,
    onSave,
}: MaterialEditModalProps) {
    const [title, setTitle] = useState(material.title);
    const [orderNum, setOrderNum] = useState(material.order_num);
    const [isAi, setIsAi] = useState(material.is_ai_material);

    // Quiz-specific state
    const [quizTitle, setQuizTitle] = useState("");
    const [quizKeyword, setQuizKeyword] = useState("");
    const [quizType, setQuizType] = useState<"interactive" | "standard">("standard");
    const [quizMaxAttempts, setQuizMaxAttempts] = useState<number>(3);
    const [quizStatus, setQuizStatus] = useState(true);
    const [quizAvailableDate, setQuizAvailableDate] = useState("");
    const [quizEndDate, setQuizEndDate] = useState("");

    // File/slide specific state
    const [fileName, setFileName] = useState("");
    const [slideName, setSlideName] = useState("");

    // Sync form when material changes
    useEffect(() => {
        setTitle(material.title);
        setOrderNum(material.order_num);
        setIsAi(material.is_ai_material);

        if (material.type === "quiz") {
            const q = material.content as Quiz;
            setQuizTitle(q.title);
            setQuizKeyword(q.keyword ?? "");
            setQuizType(q.type);
            setQuizMaxAttempts(q.max_attempt_number ?? 3);
            setQuizStatus(q.status);
            setQuizAvailableDate(
                q.available_date ? new Date(q.available_date).toISOString().split("T")[0] : ""
            );
            setQuizEndDate(
                q.end_date ? new Date(q.end_date).toISOString().split("T")[0] : ""
            );
        }
        if (material.type === "file") {
            setFileName((material.content as FileMaterial).file_name);
        }
        if (material.type === "slide") {
            setSlideName((material.content as SlideMaterial).slide_name);
        }
    }, [material]);

    const handleSave = () => {
        let updatedContent = material.content;

        if (material.type === "quiz") {
            const q = material.content as Quiz;
            updatedContent = {
                ...q,
                title: quizTitle,
                keyword: quizKeyword || null,
                type: quizType,
                max_attempt_number: quizMaxAttempts,
                status: quizStatus,
                available_date: quizAvailableDate ? new Date(quizAvailableDate) : null,
                end_date: quizEndDate ? new Date(quizEndDate) : null,
            };
        }
        if (material.type === "file") {
            updatedContent = { ...(material.content as FileMaterial), file_name: fileName };
        }
        if (material.type === "slide") {
            updatedContent = { ...(material.content as SlideMaterial), slide_name: slideName };
        }

        onSave({
            ...material,
            title,
            order_num: orderNum,
            is_ai_material: isAi,
            dateUpdate: new Date(),
            content: updatedContent,
        });
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={modalStyle}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                    Chỉnh sửa tài liệu
                </Typography>

                <Stack spacing={2}>
                    {/* Common fields */}
                    <TextField
                        label="Tiêu đề"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Số thứ tự"
                        type="number"
                        value={orderNum}
                        onChange={(e) => setOrderNum(Number(e.target.value))}
                        fullWidth
                    />
                    <FormControlLabel
                        control={<Switch checked={isAi} onChange={(e) => setIsAi(e.target.checked)} />}
                        label="Tài liệu do AI tạo"
                    />

                    {/* File-specific */}
                    {material.type === "file" && (
                        <TextField
                            label="Tên tệp"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            fullWidth
                        />
                    )}

                    {/* Slide-specific */}
                    {material.type === "slide" && (
                        <TextField
                            label="Tên slide"
                            value={slideName}
                            onChange={(e) => setSlideName(e.target.value)}
                            fullWidth
                        />
                    )}

                    {/* Quiz-specific */}
                    {material.type === "quiz" && (
                        <>
                            <TextField
                                label="Tiêu đề bài kiểm tra"
                                value={quizTitle}
                                onChange={(e) => setQuizTitle(e.target.value)}
                                fullWidth
                            />
                            <TextField
                                label="Từ khoá"
                                value={quizKeyword}
                                onChange={(e) => setQuizKeyword(e.target.value)}
                                fullWidth
                            />
                            <FormControl fullWidth>
                                <InputLabel>Loại bài kiểm tra</InputLabel>
                                <Select
                                    value={quizType}
                                    label="Loại bài kiểm tra"
                                    onChange={(e) => setQuizType(e.target.value as "interactive" | "standard")}
                                >
                                    <MenuItem value="standard">Thông thường</MenuItem>
                                    <MenuItem value="interactive">Tương tác</MenuItem>
                                </Select>
                            </FormControl>
                            <TextField
                                label="Số lần thử tối đa"
                                type="number"
                                value={quizMaxAttempts}
                                onChange={(e) => setQuizMaxAttempts(Number(e.target.value))}
                                fullWidth
                            />
                            <TextField
                                label="Ngày mở"
                                type="date"
                                value={quizAvailableDate}
                                onChange={(e) => setQuizAvailableDate(e.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                                fullWidth
                            />
                            <TextField
                                label="Hạn nộp"
                                type="date"
                                value={quizEndDate}
                                onChange={(e) => setQuizEndDate(e.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                                fullWidth
                            />
                            <FormControlLabel
                                control={
                                    <Switch checked={quizStatus} onChange={(e) => setQuizStatus(e.target.checked)} />
                                }
                                label="Đang hoạt động (học sinh có thể thấy)"
                            />
                        </>
                    )}

                    <Stack direction="row" spacing={1} justifyContent="flex-end" pt={1}>
                        <Button variant="outlined" onClick={onClose}>
                            Huỷ
                        </Button>
                        <Button variant="contained" onClick={handleSave}>
                            Lưu thay đổi
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Modal>
    );
}
