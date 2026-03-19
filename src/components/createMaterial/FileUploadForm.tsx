import { Box, Typography, Button } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import type { ClassMaterialType } from "../../types/teacherType";

interface FileUploadFormProps {
    materialType: ClassMaterialType;
    selectedFile: File | null;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    isEditMode?: boolean;
}

export default function FileUploadForm({
    materialType,
    selectedFile,
    onFileChange,
    isEditMode = false
}: FileUploadFormProps) {
    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
                {isEditMode ? `Thay thế ${materialType === "file" ? "tệp tin" : "slide"}` : `Tải lên ${materialType === "file" ? "tệp tin" : "slide"}`}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                {isEditMode
                    ? "Chọn tệp mới để thay thế (hoặc bỏ qua để giữ tệp hiện tại). Kích thước tối đa: 10MB"
                    : "Kích thước tối đa: 10MB"
                }
            </Typography>
            <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                sx={{ mb: 1 }}
            >
                Chọn tệp
                <input
                    type="file"
                    hidden
                    onChange={onFileChange}
                    accept={materialType === "file" ? "*/*" : ".ppt,.pptx,.pdf,.odp"}
                />
            </Button>
            {selectedFile && (
                <Typography variant="body2" color="text.secondary">
                    Đã chọn: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
            )}
        </Box>
    );
}
