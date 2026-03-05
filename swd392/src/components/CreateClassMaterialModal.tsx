import {
    Box,
    Typography,
    Stack,
    Button,
    TextField,
    Modal,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import { useState, useEffect } from "react";
import { type ClassMaterialType, type Question, type ClassMaterial, type CreateClassMaterialDTO } from "../types/teacherType";
import FileUploadForm from "./createMaterial/FileUploadForm";
import Render2DForm from "./createMaterial/Render2DForm";
import QuizForm from "./createMaterial/QuizForm";
import { fileApiService } from "../services/teacherApi/materialApi/fileApi";
import { quizApiService } from "../services/teacherApi/materialApi/quizApi";
import { questionApiService } from "../services/teacherApi/materialApi/questionApi";
import classMaterialApi from "../services/teacherApi/classMaterialApi";
import { slideApiService } from "../services/teacherApi/materialApi";

interface CreateClassMaterialModalProps {
    open: boolean;
    onClose: () => void;
    onMaterialCreated: (topicId: string, material: CreateClassMaterialDTO) => void;
    topicId: string;
    classId: string;
    currentMaterialCount: number;
    topicTitle?: string;
}

export default function CreateClassMaterialModal({
    open,
    onClose,
    onMaterialCreated,
    topicId,
    classId,
    currentMaterialCount,
    topicTitle
}: CreateClassMaterialModalProps) {
    const [selectedMaterialType, setSelectedMaterialType] = useState<ClassMaterialType | "">("");
    const [selectedQuizType, setSelectedQuizType] = useState("standard");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [materialName, setMaterialName] = useState("");
    const [materialDescription, setMaterialDescription] = useState("");
    const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);

    // Quiz-specific fields
    const [quizTitle, setQuizTitle] = useState("");
    const [quizStartDate, setQuizStartDate] = useState("");
    const [quizEndDate, setQuizEndDate] = useState("");
    const [maxAttempts, setMaxAttempts] = useState<number | "">("");

    // Reset form when modal opens/closes
    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);

    const resetForm = () => {
        setSelectedMaterialType("");
        setSelectedQuizType("standard");
        setSelectedFile(null);
        setMaterialName("");
        setMaterialDescription("");
        setQuizQuestions([]);
        setQuizTitle("");
        setQuizStartDate("");
        setQuizEndDate("");
        setMaxAttempts("");
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleModalClose = () => {
        resetForm();
        onClose();
    };

    const handleCreateMaterial = async () => {
        try {
            let content_id: string | undefined = undefined;

            switch (selectedMaterialType) {
                case "file": {
                    if (!selectedFile) {
                        alert("Vui lòng chọn tệp tin để tải lên.");
                        return;
                    }
                    // Step 1: Upload file to get file_path via Cloudinary/storage
                    const fileFormData = new FormData();
                    fileFormData.append('file', selectedFile);
                    const uploadResult = await fileApiService.uploadFile(fileFormData);

                    // Step 2: Create File record with file_name + file_path
                    const fileRecord = await fileApiService.createFile({
                        file_name: selectedFile.name,
                        file_path: uploadResult.file_path,
                    });
                    content_id = fileRecord._id;
                    break;
                }
                case "slide": {
                    if (!selectedFile) {
                        alert("Vui lòng chọn tệp tin để tải lên.");
                        return;
                    }
                    // Step 1: Upload slide file to get file_path
                    const slideFormData = new FormData();
                    slideFormData.append('slide', selectedFile);
                    const slideUploadResult = await slideApiService.uploadSlide(slideFormData);

                    // Step 2: Create Slide record with slide_name + file_path
                    const slideRecord = await slideApiService.createSlide({
                        slide_name: selectedFile.name,
                        file_path: slideUploadResult.file_path,
                    });
                    content_id = slideRecord._id;
                    break;
                }
                case "quiz": {
                    if (quizQuestions.length === 0) {
                        alert("Vui lòng thêm ít nhất một câu hỏi cho bài kiểm tra.");
                        return;
                    }

                    // Step 1: Create Quiz record
                    const quizData = {
                        title: quizTitle || materialName || `Bài kiểm tra ${currentMaterialCount + 1}`,
                        type: selectedQuizType,
                        status: true,
                        ...(quizStartDate && { available_date: new Date(quizStartDate) }),
                        ...(quizEndDate && { end_date: new Date(quizEndDate) }),
                        ...(maxAttempts !== "" && { max_attempt_number: maxAttempts }),
                    };
                    const quizResult = await quizApiService.createQuiz(quizData);
                    content_id = quizResult._id;

                    // Step 2: Create questions sequentially (order matters, use for...of)
                    for (const q of quizQuestions) {
                        await questionApiService.createQuestion({
                            content: q.content,
                            type: q.type,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                            has2DVisualization: q.has2DVisualization || false,
                        }, quizResult._id as string);
                    }
                    break;
                }
                default:
                    alert("Vui lòng chọn loại tài liệu.");
                    return;
            }

            // Step 3: Create ClassMaterial linking to the content
            const newMaterial: CreateClassMaterialDTO = {
                type: selectedMaterialType as ClassMaterialType,
                order_num: currentMaterialCount + 1,
                class_assign_id: classId,
                title: materialName || (selectedMaterialType === "quiz" ? quizTitle : `Tài liệu ${currentMaterialCount + 1}`),
                topic_id: topicId,
                content_id: content_id || undefined,
            };

            const createdMaterial = await classMaterialApi.createMaterial(newMaterial, content_id || undefined);
            console.log("Created material:", createdMaterial);
            if (!createdMaterial) {
                alert("Đã có lỗi xảy ra khi tạo tài liệu. Vui lòng thử lại.");
                // Cleanup: delete the content we just created
                if (content_id) {
                    try {
                        switch (selectedMaterialType) {
                            case "file":
                                await fileApiService.deleteFile(content_id);
                                break;
                            case "slide":
                                await slideApiService.deleteSlide(content_id);
                                break;
                            case "quiz":
                                await quizApiService.deleteQuiz(content_id);
                                break;
                        }
                    } catch (cleanupError) {
                        console.error("Cleanup failed:", cleanupError);
                    }
                }
                return;
            }

            onMaterialCreated(topicId, newMaterial);
            handleModalClose();

        } catch (error) {
            console.error("Error creating material:", error);
            alert("Đã có lỗi xảy ra khi tạo tài liệu. Vui lòng thử lại.");
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleModalClose}
            aria-labelledby="create-material-modal-title"
            aria-describedby="create-material-modal-description"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '95%', sm: '80%', md: 800 },
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                p: 4,
                maxHeight: '85vh',
                overflowY: 'auto'
            }}>
                <Typography id="create-material-modal-title" variant="h6" component="h2" gutterBottom>
                    Tạo tài liệu cho chủ đề: {topicTitle}
                </Typography>

                <Stack spacing={3}>
                    <TextField
                        label="Tên tài liệu"
                        variant="outlined"
                        fullWidth
                        value={materialName}
                        onChange={(e) => setMaterialName(e.target.value)}
                        placeholder="Nhập tên tài liệu..."
                    />

                    <TextField
                        label="Mô tả tài liệu"
                        variant="outlined"
                        multiline
                        rows={3}
                        fullWidth
                        value={materialDescription}
                        onChange={(e) => setMaterialDescription(e.target.value)}
                        placeholder="Nhập mô tả cho tài liệu (tùy chọn)..."
                    />

                    <FormControl fullWidth>
                        <InputLabel id="material-type-select-label">Loại tài liệu</InputLabel>
                        <Select
                            labelId="material-type-select-label"
                            id="material-type-select"
                            value={selectedMaterialType}
                            onChange={(e) => setSelectedMaterialType(e.target.value as ClassMaterialType)}
                            label="Loại tài liệu"
                        >
                            <MenuItem value="file">Tệp tin (PDF, DOC, etc.)</MenuItem>
                            <MenuItem value="slide">Slide thuyết trình</MenuItem>
                            <MenuItem value="2d_render">Mô hình hóa 2D</MenuItem>
                            <MenuItem value="quiz">Bài kiểm tra</MenuItem>
                        </Select>
                    </FormControl>

                    {/* File Upload for File and Slide types */}
                    {(selectedMaterialType === "file" || selectedMaterialType === "slide") && (
                        <FileUploadForm
                            materialType={selectedMaterialType}
                            selectedFile={selectedFile}
                            onFileChange={handleFileChange}
                        />
                    )}

                    {/* 2D Render placeholder */}
                    {selectedMaterialType === "2d_render" && (
                        <Render2DForm />
                    )}

                    {/* Quiz Creation */}
                    {selectedMaterialType === "quiz" && (
                        <QuizForm
                            quizType={selectedQuizType}
                            onQuizTypeChange={setSelectedQuizType}
                            quizTitle={quizTitle}
                            onQuizTitleChange={setQuizTitle}
                            quizStartDate={quizStartDate}
                            onQuizStartDateChange={setQuizStartDate}
                            quizEndDate={quizEndDate}
                            onQuizEndDateChange={setQuizEndDate}
                            maxAttempts={maxAttempts}
                            onMaxAttemptsChange={setMaxAttempts}
                            questions={quizQuestions}
                            onQuestionsChange={setQuizQuestions}
                        />
                    )}
                </Stack>

                <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                    <Button variant="outlined" onClick={handleModalClose}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateMaterial}
                    >
                        Tạo tài liệu
                    </Button>
                </Stack>
            </Box>
        </Modal>
    );
}