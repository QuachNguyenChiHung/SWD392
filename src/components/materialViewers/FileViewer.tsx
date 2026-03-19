import { Box, Typography, Button } from "@mui/material";
import { Download } from "@mui/icons-material";
import type { FileMaterial } from "../../types/teacherType";
import { isImageExtension, isPdfExtension, isPptxExtension } from "./viewerUtils";

interface FileViewerProps {
    content: FileMaterial;
}

export default function FileViewer({ content }: FileViewerProps) {
    const isPdf = isPdfExtension(content.file_path);
    const isPptx = isPptxExtension(content.file_path);
    const isImage = isImageExtension(content.file_path);
    const canShowAsPdf = isPdf || isPptx;

    return (
        <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tên tệp: <strong>{content.file_name}</strong>
            </Typography>

            {isPptx && (
                <Typography variant="caption" color="info.main" sx={{ display: 'block', mb: 1 }}>
                    Tệp PowerPoint đang được hiển thị dưới dạng PDF
                </Typography>
            )}

            {isImage && (
                <Box
                    component="img"
                    src={content.file_path}
                    alt={content.file_name}
                    sx={{
                        maxWidth: "100%",
                        maxHeight: 420,
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        objectFit: "contain",
                        display: "block",
                        mt: 1,
                    }}
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        const errorMsg = document.createElement("div");
                        errorMsg.textContent = "Không thể tải hình ảnh";
                        errorMsg.style.color = "red";
                        errorMsg.style.textAlign = "center";
                        errorMsg.style.padding = "20px";
                        (e.target as HTMLImageElement).parentNode?.appendChild(errorMsg);
                    }}
                />
            )}

            {canShowAsPdf && (
                <Box>
                    <Box
                        component="iframe"
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(content.file_path)}&embedded=true`}
                        title={content.file_name}
                        sx={{
                            width: "100%",
                            height: 600,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            mt: 1,
                        }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        {isPdf ? 'Nếu PDF không hiển thị, vui lòng tải về để xem' : 'Nếu không hiển thị, vui lòng tải về để xem'}
                    </Typography>
                </Box>
            )}

            {!isImage && !canShowAsPdf && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Không thể xem trước loại tệp này. Vui lòng tải về để xem.
                </Typography>
            )}

            <Button
                variant="outlined"
                startIcon={<Download />}
                href={content.file_path}
                download={content.file_name}
                sx={{ mt: 2 }}
            >
                Tải tệp về
            </Button>
        </Box>
    );
}
