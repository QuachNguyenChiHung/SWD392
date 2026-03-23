import { Box, Typography, Button, Stack } from "@mui/material";
import { Download, OpenInNew } from "@mui/icons-material";
import type { SlideMaterial } from "../../types/teacherType";
import { isPdfExtension, isPptxExtension } from "./viewerUtils";
import { COLORS, RADIUS, flatButtonContained, flatButtonOutlined } from "../../pages/teacher/teacherStyles";

interface SlideViewerProps {
    content: SlideMaterial;
}

export default function SlideViewer({ content }: SlideViewerProps) {
    const isPdf = isPdfExtension(content.file_path);
    const isPptx = isPptxExtension(content.file_path);
    const canPreview = isPdf || isPptx;

    return (
        <Box>
            <Typography sx={{ fontSize: "0.85rem", color: COLORS.textSecondary, mb: 2 }}>
                Bộ slide: <strong style={{ color: COLORS.textDark }}>{content.slide_name}</strong>
            </Typography>

            {isPptx && (
                <Typography sx={{ fontSize: "0.75rem", color: COLORS.info, mb: 1.5, fontWeight: 500 }}>
                    Tệp PowerPoint đang được hiển thị dưới dạng PDF
                </Typography>
            )}

            {canPreview && (
                <Box>
                    <Box
                        component="iframe"
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(content.file_path)}&embedded=true`}
                        title={content.slide_name}
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
                        {isPdf ? 'Nếu PDF không hiển thị, vui lòng tải về để xem' : 'Nếu slide không hiển thị, vui lòng tải về để xem'}
                    </Typography>
                </Box>
            )}

            {!canPreview && (
                <Typography sx={{ mt: 3, textAlign: "center", fontSize: "0.85rem", color: COLORS.textSecondary }}>
                    Không thể xem trước định dạng này. Vui lòng tải về để xem.
                </Typography>
            )}

            <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    startIcon={<Download />}
                    href={content.file_path}
                    download={content.slide_name}
                    sx={{
                        ...flatButtonContained,
                        bgcolor: COLORS.info,
                        "&:hover": {
                            bgcolor: "#2563EB",
                            boxShadow: "none",
                        },
                    }}
                >
                    Tải slide về
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<OpenInNew />}
                    href={content.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                        ...flatButtonOutlined,
                        borderColor: COLORS.info,
                        color: COLORS.info,
                        "&:hover": {
                            bgcolor: COLORS.infoBg,
                            borderColor: COLORS.info,
                            boxShadow: "none",
                        },
                    }}
                >
                    Mở tab mới
                </Button>
            </Stack>
        </Box>
    );
}
