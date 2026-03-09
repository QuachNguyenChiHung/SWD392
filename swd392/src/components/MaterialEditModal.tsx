import { Modal, Box, Typography, Stack, Button, CircularProgress } from "@mui/material";
import { useState } from "react";
import type {
  ClassMaterial,
  Quiz,
  FileMaterial,
  SlideMaterial,
} from "../types/teacherType";
import MaterialForm, { type MaterialFormData } from "./MaterialForm";
import { fileApiService } from "../services/teacherApi/materialApi/fileApi";
import { slideApiService } from "../services/teacherApi/materialApi/slideApi";

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
        // No new file, just update metadata
        if (material.type === "quiz") {
          const q = (material.content as Quiz) || {};
          updatedContent = {
            ...q,
            title: formData.quizTitle,
            keyword: formData.quizKeyword || null,
            type: formData.quizType,
            max_attempt_number: formData.quizMaxAttempts || null,
            status: formData.quizStatus,
            available_date: formData.quizStartDate
              ? new Date(formData.quizStartDate)
              : null,
            end_date: formData.quizEndDate ? new Date(formData.quizEndDate) : null,
            questions: formData.quizQuestions,
          };
        }
        if (material.type === "file") {
          const fileContent = (material.content as FileMaterial) || {};
          updatedContent = {
            ...fileContent,
            file_name: formData.fileName,
          };
        }
        if (material.type === "slide") {
          const slideContent = (material.content as SlideMaterial) || {};
          updatedContent = {
            ...slideContent,
            slide_name: formData.slideName,
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
