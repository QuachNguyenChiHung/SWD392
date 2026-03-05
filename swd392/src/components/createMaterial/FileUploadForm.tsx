import { Box, Typography, Button } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import type { ClassMaterialType } from "../../types/teacherType";

interface FileUploadFormProps {
    materialType: ClassMaterialType;
    selectedFile: File | null;
    onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileUploadForm({
    materialType,
    selectedFile,
    onFileChange
}: FileUploadFormProps) {
    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
                Tải lên {materialType === "file" ? "tệp tin" : "slide"}
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
                    Đã chọn: {selectedFile.name}
                </Typography>
            )}
        </Box>
    );
}
