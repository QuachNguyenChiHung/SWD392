import {
  Box,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useState, useEffect } from "react";
import type {
  ClassMaterial,
  Quiz,
  FileMaterial,
  SlideMaterial,
  ClassMaterialType,
  Question,
} from "../types/teacherType";
import FileUploadForm from "./createMaterial/FileUploadForm";
import Render2DForm from "./createMaterial/Render2DForm";
import QuizForm from "./createMaterial/QuizForm";

interface MaterialFormProps {
  mode: "create" | "edit";
  material?: ClassMaterial; // Only needed for edit mode
  topicTitle?: string; // Only needed for create mode
  onDataChange: (data: MaterialFormData) => void;
}

export interface MaterialFormData {
  // Common fields
  title: string;
  orderNum: number;
  isAi: boolean;
  description?: string;
  materialType: ClassMaterialType | "";
  classMaterialStatus: "published" | "draft" | "deleted";

  // File/Slide specific
  selectedFile: File | null;
  fileName: string;
  slideName: string;

  // Quiz specific
  quizTitle: string;
  quizType: "interactive" | "standard";
  quizMaxAttempts: number | "";
  quizStatus: boolean;
  quizStartDate: string;
  quizEndDate: string;
  quizQuestions: Question[];
}

export default function MaterialForm({
  mode,
  material,
  onDataChange,
}: MaterialFormProps) {
  const [formData, setFormData] = useState<MaterialFormData>({
    title: "",
    orderNum: 1,
    isAi: false,
    description: "",
    materialType: "",
    classMaterialStatus: "draft",
    selectedFile: null,
    fileName: "",
    slideName: "",
    quizTitle: "",
    quizType: "standard",
    quizMaxAttempts: 3,
    quizStatus: true,
    quizStartDate: "",
    quizEndDate: "",
    quizQuestions: [],
  });

  // Initialize form data based on mode
  useEffect(() => {
    if (mode === "edit" && material) {
      const initialData: MaterialFormData = {
        title: material.title,
        orderNum: material.order_num,
        isAi: material.is_ai_material,
        description: "",
        materialType: material.type,
        classMaterialStatus:
          material.status === "published" ? "published" : "draft",
        selectedFile: null,
        fileName:
          material.type === "file" && material.content
            ? (material.content as FileMaterial)?.file_name || ""
            : "",
        slideName:
          material.type === "slide" && material.content
            ? (material.content as SlideMaterial)?.slide_name || ""
            : "",
        quizTitle: "",
        quizType: "standard",
        quizMaxAttempts: 3,
        quizStatus: true,
        quizStartDate: "",
        quizEndDate: "",
        quizQuestions: [],
      };

      // Quiz-specific data
      if (material.type === "quiz" && material.content) {
        const q = material.content as Quiz;
        initialData.quizTitle = q?.title || "";
        initialData.quizType = q?.type || "standard";
        initialData.quizMaxAttempts = q?.max_attempt_number ?? 3;
        initialData.quizStatus = q?.status ?? true;
        initialData.quizStartDate = q?.available_date
          ? new Date(q.available_date).toISOString().split("T")[0]
          : "";
        initialData.quizEndDate = q?.end_date
          ? new Date(q.end_date).toISOString().split("T")[0]
          : "";
        initialData.quizQuestions = q?.questions || [];
      }

      setFormData(initialData);
    }
  }, [mode, material]);

  // Notify parent of data changes
  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  const updateFormData = (updates: Partial<MaterialFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      updateFormData({ selectedFile: event.target.files[0] });
    }
  };

  return (
    <Box>
      <Stack spacing={3}>
        <TextField
          label="Tên tài liệu"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          fullWidth
          required
        />

        {mode === "create" && (
          <>
            <TextField
              label="Mô tả tài liệu"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              fullWidth
              placeholder="Nhập mô tả cho tài liệu (tùy chọn)..."
            />

            <FormControl fullWidth>
              <InputLabel>Loại tài liệu</InputLabel>
              <Select
                value={formData.materialType}
                onChange={(e) =>
                  updateFormData({
                    materialType: e.target.value as ClassMaterialType,
                  })
                }
                label="Loại tài liệu"
              >
                <MenuItem value="file">Tệp tin (PDF, DOC, etc.)</MenuItem>
                <MenuItem value="slide">Slide thuyết trình</MenuItem>
                <MenuItem value="2d_render">Mô hình hóa 2D</MenuItem>
                <MenuItem value="quiz">Bài kiểm tra</MenuItem>
              </Select>
            </FormControl>
          </>
        )}

        {mode === "edit" && (
          <>
            <TextField
              label="Số thứ tự"
              type="number"
              value={formData.orderNum}
              onChange={(e) =>
                updateFormData({ orderNum: Number(e.target.value) })
              }
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isAi}
                  onChange={(e) => updateFormData({ isAi: e.target.checked })}
                />
              }
              label="Tài liệu do AI tạo"
            />

            <FormControl fullWidth>
              <InputLabel>Trạng thái tài liệu</InputLabel>
              <Select
                value={formData.classMaterialStatus}
                onChange={(e) =>
                  updateFormData({
                    classMaterialStatus: e.target.value as
                      | "published"
                      | "draft"
                      | "deleted",
                  })
                }
                label="Trạng thái tài liệu"
              >
                <MenuItem value="draft">Bản nháp</MenuItem>
                <MenuItem value="published">Xuất bản</MenuItem>
              </Select>
            </FormControl>
          </>
        )}

        {/* File Upload for File and Slide types */}
        {(formData.materialType === "file" ||
          formData.materialType === "slide") && (
            <>
              {mode === "create" ? (
                <FileUploadForm
                  materialType={formData.materialType}
                  selectedFile={formData.selectedFile}
                  onFileChange={handleFileChange}
                />
              ) : (
                <>
                  {/* Edit mode: Show current file name field and allow file replacement */}
                  {formData.materialType === "file" && (
                    <TextField
                      label="Tên tệp"
                      value={formData.fileName}
                      onChange={(e) =>
                        updateFormData({ fileName: e.target.value })
                      }
                      fullWidth
                    />
                  )}
                  {formData.materialType === "slide" && (
                    <TextField
                      label="Tên slide"
                      value={formData.slideName}
                      onChange={(e) =>
                        updateFormData({ slideName: e.target.value })
                      }
                      fullWidth
                    />
                  )}
                  {/* Allow file replacement in edit mode */}
                  <FileUploadForm
                    materialType={formData.materialType}
                    selectedFile={formData.selectedFile}
                    onFileChange={handleFileChange}
                    isEditMode={true}
                  />
                </>
              )}
            </>
          )}

        {/* 2D Render */}
        {formData.materialType === "2d_render" && <Render2DForm />}

        {/* Quiz Form */}
        {formData.materialType === "quiz" && (
          <Stack spacing={2}>
            {mode === "edit" && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.quizStatus}
                    onChange={(e) =>
                      updateFormData({ quizStatus: e.target.checked })
                    }
                  />
                }
                label="Đang hoạt động (học sinh có thể thấy)"
              />
            )}

            <QuizForm
              quizType={formData.quizType}
              onQuizTypeChange={(value) =>
                updateFormData({
                  quizType: value as "interactive" | "standard",
                })
              }
              quizTitle={formData.quizTitle}
              onQuizTitleChange={(value) =>
                updateFormData({ quizTitle: value })
              }
              quizStartDate={formData.quizStartDate}
              onQuizStartDateChange={(value) =>
                updateFormData({ quizStartDate: value })
              }
              quizEndDate={formData.quizEndDate}
              onQuizEndDateChange={(value) =>
                updateFormData({ quizEndDate: value })
              }
              maxAttempts={formData.quizMaxAttempts}
              onMaxAttemptsChange={(value) =>
                updateFormData({ quizMaxAttempts: value })
              }
              questions={formData.quizQuestions}
              onQuestionsChange={(questions) =>
                updateFormData({ quizQuestions: questions })
              }
            />
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
