import { Box, Typography, Button } from "@mui/material";
import { Download } from "@mui/icons-material";
import type { FileMaterial } from "../../types/teacherType";
import { isImageExtension, isPdfExtension, isPptxExtension } from "./viewerUtils";
import { COLORS, RADIUS, flatButtonContained } from "../../pages/teacher/teacherStyles";

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
            <Typography sx={{ fontSize: "0.85rem", color: COLORS.textSecondary, mb: 2 }}>
                Tên tệp: <strong style={{ color: COLORS.textDark }}>{content.file_name}</strong>
            </Typography>

            {isPptx && (
                <Typography sx={{ fontSize: "0.75rem", color: COLORS.info, mb: 1.5, fontWeight: 500 }}>
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
                        maxHeight: 500,
                        borderRadius: RADIUS,
                        border: `1px solid ${COLORS.border}`,
                        objectFit: "contain",
                        display: "block",
                        mt: 1,
                    }}
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        const errorMsg = document.createElement("div");
                        errorMsg.textContent = "Không thể tải hình ảnh";
                        errorMsg.style.color = COLORS.error;
                        errorMsg.style.textAlign = "center";
                        errorMsg.style.padding = "20px";
                        errorMsg.style.backgroundColor = COLORS.errorBg;
                        errorMsg.style.borderRadius = RADIUS;
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
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: RADIUS,
                            mt: 1,
                            bgcolor: COLORS.bg,
                        }}
                    />
                    <Typography sx={{ fontSize: "0.75rem", color: COLORS.textSecondary, mt: 1.5 }}>
                        {isPdf ? 'Nếu PDF không hiển thị, vui lòng tải về để xem' : 'Nếu không hiển thị, vui lòng tải về để xem'}
                    </Typography>
                </Box>
            )}

            {!isImage && !canShowAsPdf && (
                <Typography sx={{ fontSize: "0.85rem", color: COLORS.textSecondary, mt: 1 }}>
                    Không thể xem trước loại tệp này. Vui lòng tải về để xem.
                </Typography>
            )}

            <Button
                variant="contained"
                startIcon={<Download />}
                onClick={async () => {
                    try {
                        const response = await fetch(content.file_path);
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = content.file_name;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                    } catch {
                        window.open(content.file_path, '_blank');
                    }
                }}
                sx={{
                    ...flatButtonContained,
                    mt: 3,
                    bgcolor: COLORS.info,
                    "&:hover": {
                        bgcolor: "#2563EB",
                        boxShadow: "none",
                    },
                }}
            >
                Tải tệp về
            </Button>
        </Box>
    );
}
