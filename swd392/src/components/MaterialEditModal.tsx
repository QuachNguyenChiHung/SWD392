import { Modal, Box, Typography, Stack, Button } from "@mui/material";
import { useState } from "react";
import type {
  ClassMaterial,
  Quiz,
  FileMaterial,
  SlideMaterial,
} from "../types/teacherType";
import MaterialForm, { type MaterialFormData } from "./MaterialForm";

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

  const handleFormDataChange = (data: MaterialFormData) => {
    setFormData(data);
  };

  const handleSave = () => {
    if (!formData) return;

    let updatedContent = material.content;

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

    onSave({
      ...material,
      title: formData.title,
      order_num: formData.orderNum,
      is_ai_material: formData.isAi,
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

        <MaterialForm
          mode="edit"
          material={material}
          onDataChange={handleFormDataChange}
        />

        <Stack direction="row" spacing={1} justifyContent="flex-end" pt={3}>
          <Button variant="outlined" onClick={onClose}>
            Huỷ
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={!formData}>
            Lưu thay đổi
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
}
