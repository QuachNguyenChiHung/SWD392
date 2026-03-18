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
  width: { xs: "95%", sm: "80%", md: 800 },
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

  const handleModalClose = () => {
    if (isUploading) return;
    onClose();
  };

  const handleSave = async () => {
    if (!formData) return;

    setIsUploading(true);
    try {
      let updatedContent = material.content;

      if (formData.selectedFile && (material.type === "file" || material.type === "slide")) {
        const formDataToUpload = new FormData();

        if (material.type === "file") {
          const fileContent = material.content as FileMaterial;

          formDataToUpload.append("file", formData.selectedFile);
          formDataToUpload.append("file_name", formData.fileName || formData.selectedFile.name);

          const uploadedFile = await fileApiService.updateFileWithUpload(fileContent._id as string, formDataToUpload);
          console.log("Uploaded file response:", uploadedFile);
          updatedContent = uploadedFile;
        } else if (material.type === "slide") {
          const slideContent = material.content as SlideMaterial;

          formDataToUpload.append("slide", formData.selectedFile);
          formDataToUpload.append("slide_name", formData.slideName || formData.selectedFile.name);

          const uploadedSlide = await slideApiService.updateSlideWithUpload(slideContent._id as string, formDataToUpload);
          console.log("Uploaded slide response:", uploadedSlide);
          updatedContent = uploadedSlide;
        }
      } else {

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

          const updatedQuiz = await quizApiService.updateQuiz(q._id, {
            title: formData.quizTitle,
            type: formData.quizType,
            max_attempt_number: formData.quizMaxAttempts !== "" ? formData.quizMaxAttempts : undefined,
            status: formData.quizStatus,
            available_date: formData.quizStartDate ? new Date(formData.quizStartDate) : undefined,
            end_date: formData.quizEndDate ? new Date(formData.quizEndDate) : undefined,
          });

          const originalQuestions: Question[] = q.questions || [];
          const updatedQs = formData.quizQuestions;

          const updatedIdSet = new Set(updatedQs.map((q) => q._id).filter(Boolean));
          for (const orig of originalQuestions) {
            if (orig._id && !updatedIdSet.has(orig._id)) {
              await questionApiService.deleteQuestion(orig._id);
            }
          }

          const persistedQuestions: Question[] = [];
          for (const question of updatedQs) {
            if (question._id) {
              await questionApiService.updateQuestion(question._id, {
                title: question.title,
                options: question.options || [],
                correct_index: question.correct_index,
                type: question.type,
              });
              persistedQuestions.push(question);
            } else {
              // New question – create it
              const created = await questionApiService.createQuestion(
                {
                  quiz_id: q._id,
                  title: question.title,
                  type: question.type,
                  options: question.options || [],
                  correct_index: question.correct_index,
                },
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
    <>
      <Modal
        open={open}
        onClose={handleModalClose}
        aria-labelledby="edit-material-modal-title"
        aria-describedby="edit-material-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography
            id="edit-material-modal-title"
            variant="h6"
            component="h2"
            fontWeight={700}
            gutterBottom
          >
            Chỉnh sửa tài liệu
          </Typography>

          <MaterialForm
            mode="edit"
            material={material}
            onDataChange={handleFormDataChange}
          />

          <Stack
            direction="row"
            spacing={2}
            justifyContent="flex-end"
            sx={{ mt: 4 }}
          >
            <Button variant="outlined" onClick={handleModalClose} disabled={isUploading}>
              Hủy
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={!formData || isUploading}
            >
              {isUploading ? <CircularProgress size={24} color="inherit" /> : "Lưu thay đổi"}
            </Button>
          </Stack>

          {isUploading && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bgcolor: "rgba(0, 0, 0, 0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                zIndex: 1,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <CircularProgress color="inherit" size={60} sx={{ color: "#fff" }} />
                <Typography variant="h6" sx={{ mt: 2, color: "#fff" }}>
                  Đang lưu thay đổi...
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </>
  );
}
