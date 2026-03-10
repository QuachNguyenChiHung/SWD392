import { Modal, Box, Typography, Stack, Button, CircularProgress } from "@mui/material";
import { useState } from "react";
import type {
  ClassMaterial,
  Quiz,
  FileMaterial,
  SlideMaterial,
  Question,
} from "../types/teacherType";
import MaterialForm, { type MaterialFormData } from "./MaterialForm";
import { fileApiService } from "../services/teacherApi/materialApi/fileApi";
import { slideApiService } from "../services/teacherApi/materialApi/slideApi";
import { quizApiService } from "../services/teacherApi/materialApi/quizApi";
import { questionApiService } from "../services/teacherApi/materialApi/questionApi";

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
  const [formData, setFormData] = useState<MaterialFormData | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFormDataChange = (data: MaterialFormData) => {
    setFormData(data);
  };

  const handleSave = async () => {
    if (!formData) return;

    setIsUploading(true);
    try {
      let updatedContent = material.content;

      // Handle file upload if a new file is selected
      if (formData.selectedFile && (material.type === "file" || material.type === "slide")) {
        const formDataToUpload = new FormData();

        if (material.type === "file") {
          const fileContent = material.content as FileMaterial;
          // Use "file" as field name as expected by backend
          formDataToUpload.append("file", formData.selectedFile);
          formDataToUpload.append("file_name", formData.fileName || formData.selectedFile.name);
          // Update existing file using PUT endpoint
          const uploadedFile = await fileApiService.updateFileWithUpload(fileContent._id as string, formDataToUpload);
          console.log("Uploaded file response:", uploadedFile);
          updatedContent = uploadedFile;
        } else if (material.type === "slide") {
          const slideContent = material.content as SlideMaterial;
          // Use "slide" as field name as expected by backend
          formDataToUpload.append("slide", formData.selectedFile);
          formDataToUpload.append("slide_name", formData.slideName || formData.selectedFile.name);
          // Update existing slide using PUT endpoint
          const uploadedSlide = await slideApiService.updateSlideWithUpload(slideContent._id as string, formDataToUpload);
          console.log("Uploaded slide response:", uploadedSlide);
          updatedContent = uploadedSlide;
        }
      } else {
        // No new file – update metadata via content-specific API and local state
        if (material.type === "file") {
          const fileContent = (material.content as FileMaterial) || {};
          if (fileContent._id) {
            const updatedFile = await fileApiService.updateFile(fileContent._id as string, {
              file_name: formData.fileName,
            });
            updatedContent = updatedFile;
          } else {
            updatedContent = { ...fileContent, file_name: formData.fileName };
          }
        } else if (material.type === "slide") {
          const slideContent = (material.content as SlideMaterial) || {};
          if (slideContent._id) {
            const updatedSlide = await slideApiService.updateSlide(slideContent._id as string, {
              slide_name: formData.slideName,
            });
            updatedContent = updatedSlide;
          } else {
            updatedContent = { ...slideContent, slide_name: formData.slideName };
          }
        } else if (material.type === "quiz") {
          const q = (material.content as Quiz) || {};
          // 1. Persist quiz settings to backend
          const updatedQuiz = await quizApiService.updateQuiz(q._id, {
            title: formData.quizTitle,
            type: formData.quizType,
            max_attempt_number: formData.quizMaxAttempts !== "" ? formData.quizMaxAttempts : undefined,
            status: formData.quizStatus,
            available_date: formData.quizStartDate ? new Date(formData.quizStartDate) : undefined,
            end_date: formData.quizEndDate ? new Date(formData.quizEndDate) : undefined,
          });

          // 2. Sync questions: delete removed, update existing, create new
          const originalQuestions: Question[] = q.questions || [];
          const updatedQs = formData.quizQuestions;

          // Delete questions that were removed
          const updatedIdSet = new Set(updatedQs.map((q) => q._id).filter(Boolean));
          for (const orig of originalQuestions) {
            if (orig._id && !updatedIdSet.has(orig._id)) {
              await questionApiService.deleteQuestion(orig._id);
            }
          }

          // Create new / update existing questions
          const persistedQuestions: Question[] = [];
          for (const question of updatedQs) {
            if (question._id) {
              // Existing question – update options/type in backend format
              const backendOptions = [question.content, ...(question.options || [])];
              const correctStr =
                typeof question.correctAnswer === "string"
                  ? question.correctAnswer
                  : question.correctAnswer[0] ?? "";
              const correct_index = Math.max(0, backendOptions.indexOf(correctStr));
              const backendType: "multiple_choice" | "true_false" =
                question.type === "true-false" ? "true_false" : "multiple_choice";
              await questionApiService.updateQuestion(question._id, {
                options: backendOptions,
                correct_index,
                type: backendType,
              });
              persistedQuestions.push(question);
            } else {
              // New question – create it
              const created = await questionApiService.createQuestion(
                {
                  content: question.content,
                  type: question.type,
                  options: question.options,
                  correctAnswer: question.correctAnswer,
                  has2DVisualization: question.has2DVisualization,
                },
                q._id
              );
              persistedQuestions.push(created);
            }
          }

          updatedContent = {
            ...updatedQuiz,
            keyword: formData.quizKeyword || null,
            questions: persistedQuestions,
          };
        }
      }

      const updatedMaterial = {
        ...material,
        title: formData.title,
        order_num: formData.orderNum,
        is_ai_material: formData.isAi,
        dateUpdate: new Date(),
        content: updatedContent,
      };

      console.log("Saving updated material:", updatedMaterial);
      onSave(updatedMaterial);
      onClose();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Lỗi khi tải lên tệp. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" fontWeight={700} mb={2}>
          Chỉnh sửa tài liệu
        </Typography>

        <MaterialForm
          mode="edit"
          material={material}
          onDataChange={handleFormDataChange}
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end" pt={3}>
          <Button variant="outlined" onClick={onClose} disabled={isUploading}>
            Huỷ
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formData || isUploading}
            startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isUploading ? "Đang tải lên..." : "Lưu thay đổi"}
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
