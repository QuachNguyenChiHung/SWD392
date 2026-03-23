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
    MenuItem,
    CircularProgress,
} from "@mui/material";
import { useState, useEffect } from "react";
import {
    type ClassMaterialType,
    type Question,
    type CreateClassMaterialDTO,
    type ClassMaterial,
    type Quiz,
} from "../types/teacherType";
import FileUploadForm from "./createMaterial/FileUploadForm";
import Render2DForm from "./createMaterial/Render2DForm";
import QuizForm from "./createMaterial/QuizForm";
import { fileApiService } from "../services/teacherApi/materialApi/fileApi";
import { quizApiService } from "../services/teacherApi/materialApi/quizApi";
import { questionApiService } from "../services/teacherApi/materialApi/questionApi";
import classMaterialApi from "../services/teacherApi/classMaterialApi";
import { slideApiService } from "../services/teacherApi/materialApi";
import {
    flatModal,
    sectionLabel,
    sectionTitle,
    pageTitle,
    flatButtonContained,
    flatButtonOutlined,
    COLORS,
    RADIUS,
} from "../pages/teacher/teacherStyles";

interface CreateClassMaterialModalProps {
    open: boolean;
    onClose: () => void;
    onMaterialCreated: (
        topicId: string,
        material: CreateClassMaterialDTO,
    ) => void;
    topicId: string;
    classId: string;
    currentMaterialCount: number;
    topicTitle?: string;
    aiPreviewMaterial?: ClassMaterial | null;
}

export default function CreateClassMaterialModal({
    open,
    onClose,
    onMaterialCreated,
    topicId,
    classId,
    currentMaterialCount,
    topicTitle,
    aiPreviewMaterial,
}: CreateClassMaterialModalProps) {
    const [selectedMaterialType, setSelectedMaterialType] = useState<
        ClassMaterialType | ""
    >("");
    const [selectedQuizType, setSelectedQuizType] = useState("standard");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<"published" | "draft">("draft");
    const [materialName, setMaterialName] = useState("");
    const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Quiz-specific fields
    const [quizTitle, setQuizTitle] = useState("");
    const [quizStartDate, setQuizStartDate] = useState("");
    const [quizEndDate, setQuizEndDate] = useState("");
    const [maxAttempts, setMaxAttempts] = useState<number | "">(""  );

    const resetForm = () => {
        setSelectedMaterialType("");
        setSelectedQuizType("standard");
        setSelectedFile(null);
        setSelectedStatus("draft");
        setMaterialName("");
        setQuizQuestions([]);
        setQuizTitle("");
        setQuizStartDate("");
        setQuizEndDate("");
        setMaxAttempts("");
    };
    // Reset form when modal opens/closes
    useEffect(() => {
        if (!open) {
            resetForm();
        }
    }, [open]);

    useEffect(() => {
        if (!open || !aiPreviewMaterial) return;
        setSelectedMaterialType(aiPreviewMaterial.type);
        setMaterialName(aiPreviewMaterial.title || "");
        setSelectedStatus("draft");

        if (aiPreviewMaterial.type === "quiz") {
            const quizContent = aiPreviewMaterial.content as Quiz;
            setQuizTitle(quizContent?.title || aiPreviewMaterial.title || "");
            setSelectedQuizType(quizContent?.type || "standard");
            setQuizQuestions(quizContent?.questions || []);
            setQuizStartDate(
                quizContent?.available_date
                    ? new Date(quizContent.available_date).toISOString().slice(0, 10)
                    : "",
            );
            setQuizEndDate(
                quizContent?.end_date
                    ? new Date(quizContent.end_date).toISOString().slice(0, 10)
                    : "",
            );
            setMaxAttempts(quizContent?.max_attempt_number ?? "");
        }
    }, [aiPreviewMaterial, open]);

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
            setIsLoading(true);
            let content_id: string | undefined = undefined;
            const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

            if (aiPreviewMaterial) {
                switch (aiPreviewMaterial.type) {
                    case "file": {
                        const fileContent = aiPreviewMaterial.content as { file_name: string; file_path: string };
                        const response = await fetch(fileContent.file_path);
                        const blob = await response.blob();
                        const aiFile = new File([blob], fileContent.file_name || "ai-document.pdf", {
                            type: blob.type || "application/pdf",
                        });
                        if (aiFile.size > MAX_FILE_SIZE) {
                            alert("Tệp tin quá lớn. Vui lòng tạo tệp có kích thước tối đa 10MB.");
                            return;
                        }
                        const fileFormData = new FormData();
                        fileFormData.append("file", aiFile);
                        const uploadResult = await fileApiService.uploadFile(fileFormData);
                        content_id = uploadResult._id;
                        break;
                    }
                    case "slide": {
                        const slideContent = aiPreviewMaterial.content as { slide_name: string; file_path: string };
                        const response = await fetch(slideContent.file_path);
                        const blob = await response.blob();
                        const aiSlide = new File([blob], slideContent.slide_name || "ai-slides.pptx", {
                            type: blob.type || "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        });
                        if (aiSlide.size > MAX_FILE_SIZE) {
                            alert("Tệp tin quá lớn. Vui lòng tạo tệp có kích thước tối đa 10MB.");
                            return;
                        }
                        const slideFormData = new FormData();
                        slideFormData.append("slide", aiSlide);
                        const slideUploadResult = await slideApiService.uploadSlide(slideFormData);
                        content_id = slideUploadResult._id;
                        break;
                    }
                    case "quiz": {
                        const quizContent = aiPreviewMaterial.content as Quiz;
                        const quizData = {
                            title: materialName || quizTitle || `Bài kiểm tra ${currentMaterialCount + 1}`,
                            type: selectedQuizType,
                            status: quizContent?.status ?? true,
                            ...(quizStartDate && { available_date: new Date(quizStartDate) }),
                            ...(quizEndDate && { end_date: new Date(quizEndDate) }),
                            ...(maxAttempts !== "" && { max_attempt_number: maxAttempts }),
                        };
                        const quizResult = await quizApiService.createQuiz(quizData);
                        content_id = quizResult._id;

                        const aiQuestions = quizQuestions.length > 0 ? quizQuestions : quizContent?.questions || [];
                        for (const q of aiQuestions) {
                            await questionApiService.createQuestion({
                                quiz_id: quizResult._id as string,
                                title: q.title,
                                type: q.type,
                                options: q.options || [],
                                correct_index: q.correct_index,
                            });
                        }
                        break;
                    }
                    default:
                        alert("Vui lòng chọn loại tài liệu.");
                        return;
                }

                const newMaterial: CreateClassMaterialDTO = {
                    type: aiPreviewMaterial.type as ClassMaterialType,
                    status: selectedStatus,
                    order_num: currentMaterialCount + 1,
                    class_assign_id: classId,
                    title: materialName || aiPreviewMaterial.title || `Tài liệu ${currentMaterialCount + 1}`,
                    topic_id: topicId,
                    content_id: content_id || undefined,
                    is_ai_material: true,
                    ai_content_id: aiPreviewMaterial.ai_content_id || undefined,
                };

                const createdMaterial = await classMaterialApi.createMaterial(
                    newMaterial,
                    content_id || undefined,
                );
                if (!createdMaterial) {
                    alert("Đã có lỗi xảy ra khi tạo tài liệu. Vui lòng thử lại.");
                    return;
                }

                onMaterialCreated(topicId, newMaterial);
                handleModalClose();
                return;
            }

            switch (selectedMaterialType) {
                case "file": {
                    if (!selectedFile) {
                        alert("Vui lòng chọn tệp tin để tải lên.");
                        return;
                    }
                    if (selectedFile.size > MAX_FILE_SIZE) {
                        alert("Tệp tin quá lớn. Vui lòng chọn tệp tin có kích thước tối đa 10MB.");
                        return;
                    }
                    const fileFormData = new FormData();
                    fileFormData.append("file", selectedFile);
                    const uploadResult = await fileApiService.uploadFile(fileFormData);
                    console.log(uploadResult);
                    content_id = uploadResult._id;
                    break;
                }
                case "slide": {
                    if (!selectedFile) {
                        alert("Vui lòng chọn tệp tin để tải lên.");
                        return;
                    }
                    if (selectedFile.size > MAX_FILE_SIZE) {
                        alert("Tệp tin quá lớn. Vui lòng chọn tệp tin có kích thước tối đa 10MB.");
                        return;
                    }
                    const slideFormData = new FormData();
                    slideFormData.append("slide", selectedFile);
                    const slideUploadResult =
                        await slideApiService.uploadSlide(slideFormData);
                    content_id = slideUploadResult._id;
                    break;
                }
                case "quiz": {
                    if (quizQuestions.length === 0) {
                        alert("Vui lòng thêm ít nhất một câu hỏi cho bài kiểm tra.");
                        return;
                    }
                    const quizData = {
                        title:
                            quizTitle ||
                            materialName ||
                            `Bài kiểm tra ${currentMaterialCount + 1}`,
                        type: selectedQuizType,
                        status: true,
                        ...(quizStartDate && { available_date: new Date(quizStartDate) }),
                        ...(quizEndDate && { end_date: new Date(quizEndDate) }),
                        ...(maxAttempts !== "" && { max_attempt_number: maxAttempts }),
                    };
                    const quizResult = await quizApiService.createQuiz(quizData);
                    content_id = quizResult._id;

                    for (const q of quizQuestions) {
                        await questionApiService.createQuestion(
                            {
                                quiz_id: quizResult._id as string,
                                title: q.title,
                                type: q.type,
                                options: q.options || [],
                                correct_index: q.correct_index,
                            },
                        );
                    }
                    break;
                }
                default:
                    alert("Vui lòng chọn loại tài liệu.");
                    return;
            }

            const newMaterial: CreateClassMaterialDTO = {
                type: selectedMaterialType as ClassMaterialType,
                status: selectedStatus,
                order_num: currentMaterialCount + 1,
                class_assign_id: classId,
                title:
                    materialName ||
                    (selectedMaterialType === "quiz"
                        ? quizTitle
                        : `Tài liệu ${currentMaterialCount + 1}`),
                topic_id: topicId,
                content_id: content_id || undefined,
            };

            const createdMaterial = await classMaterialApi.createMaterial(
                newMaterial,
                content_id || undefined,
            );
            console.log("Created material:", createdMaterial);
            if (!createdMaterial) {
                alert("Đã có lỗi xảy ra khi tạo tài liệu. Vui lòng thử lại.");
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
        } finally {
            setIsLoading(false);
        }
    };

    const inputSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: RADIUS,
        },
    };

    return (
        <>
            <Modal
                open={open}
                onClose={handleModalClose}
                aria-labelledby="create-material-modal-title"
                aria-describedby="create-material-modal-description"
            >
                <Box sx={{ ...flatModal, width: { xs: "95%", sm: "80%", md: 800 } }}>
                    <Typography sx={sectionLabel}>New material</Typography>
                    <Typography
                        id="create-material-modal-title"
                        sx={{ ...pageTitle, fontSize: "1.25rem", mb: 1 }}
                    >
                        Tạo tài liệu mới
                    </Typography>
                    <Typography sx={{ fontSize: "0.85rem", color: COLORS.textSecondary, mb: 3 }}>
                        Chủ đề: {topicTitle}
                    </Typography>

                    <Stack spacing={3}>
                        <TextField
                            label="Tên tài liệu"
                            variant="outlined"
                            fullWidth
                            value={materialName}
                            onChange={(e) => setMaterialName(e.target.value)}
                            placeholder="Nhập tên tài liệu..."
                            sx={inputSx}
                        />


                        {!aiPreviewMaterial && (
                            <FormControl fullWidth>
                                <InputLabel id="material-type-select-label">
                                    Loại tài liệu
                                </InputLabel>
                                <Select
                                    labelId="material-type-select-label"
                                    id="material-type-select"
                                    value={selectedMaterialType}
                                    onChange={(e) =>
                                        setSelectedMaterialType(e.target.value as ClassMaterialType)
                                    }
                                    label="Loại tài liệu"
                                    sx={inputSx}
                                >
                                    <MenuItem value="file">Tệp tin (PDF, DOC, etc.)</MenuItem>
                                    <MenuItem value="slide">Slide thuyết trình</MenuItem>
                                    <MenuItem value="quiz">Bài kiểm tra</MenuItem>
                                </Select>
                            </FormControl>
                        )}

                        <FormControl fullWidth>
                            <InputLabel id="material-status-select-label">
                                Trạng thái
                            </InputLabel>
                            <Select
                                labelId="material-status-select-label"
                                id="material-status-select"
                                value={selectedStatus}
                                onChange={(e) =>
                                    setSelectedStatus(e.target.value as "published" | "draft")
                                }
                                label="Trạng thái"
                                sx={inputSx}
                            >
                                <MenuItem value="draft">Bản nháp</MenuItem>
                                <MenuItem value="published">Xuất bản</MenuItem>
                            </Select>
                        </FormControl>

                        {/* File Upload for File and Slide types */}
                        {!aiPreviewMaterial &&
                            (selectedMaterialType === "file" ||
                                selectedMaterialType === "slide") && (
                                <FileUploadForm
                                    materialType={selectedMaterialType}
                                    selectedFile={selectedFile}
                                    onFileChange={handleFileChange}
                                />
                            )}

                        {/* 2D Render placeholder */}
                        {!aiPreviewMaterial && selectedMaterialType === "2d_render" && <Render2DForm />}

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

                    <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="flex-end"
                        sx={{ mt: 4 }}
                    >
                        <Button
                            variant="outlined"
                            onClick={handleModalClose}
                            disabled={isLoading}
                            sx={flatButtonOutlined}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleCreateMaterial}
                            disabled={isLoading}
                            sx={flatButtonContained}
                        >
                            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Tạo tài liệu"}
                        </Button>
                    </Stack>

                    {/* Loading Overlay inside Modal */}
                    {isLoading && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: RADIUS,
                                zIndex: 1,
                            }}
                        >
                            <Box sx={{ textAlign: 'center' }}>
                                <CircularProgress color="inherit" size={60} sx={{ color: '#fff' }} />
                                <Typography sx={{ mt: 2, color: '#fff', fontWeight: 600, fontSize: "0.95rem" }}>
                                    Đang tải lên tài liệu...
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Modal>
        </>
    );
}
