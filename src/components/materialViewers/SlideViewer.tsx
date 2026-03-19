import { Box, Typography, Button, Stack } from "@mui/material";
import { Download, OpenInNew } from "@mui/icons-material";
import type { SlideMaterial } from "../../types/teacherType";
import { isPdfExtension, isPptxExtension } from "./viewerUtils";

interface SlideViewerProps {
    content: SlideMaterial;
}

export default function SlideViewer({ content }: SlideViewerProps) {
    const isPdf = isPdfExtension(content.file_path);
    const isPptx = isPptxExtension(content.file_path);
    const canPreview = isPdf || isPptx;

    return (
        <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Bộ slide: <strong>{content.slide_name}</strong>
            </Typography>

            {isPptx && (
                <Typography variant="caption" color="info.main" sx={{ display: 'block', mb: 1 }}>
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
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 2,
                            mt: 1,
                        }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        {isPdf ? 'Nếu PDF không hiển thị, vui lòng tải về để xem' : 'Nếu slide không hiển thị, vui lòng tải về để xem'}
                    </Typography>
                </Box>
            )}

            {!canPreview && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                    Không thể xem trước định dạng này. Vui lòng tải về để xem.
                </Typography>
            )}

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<Download />}
                    href={content.file_path}
                    download={content.slide_name}
                >
                    Tải slide về
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<OpenInNew />}
                    href={content.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Mở tab mới
                </Button>
            </Stack>
        </Box>
    );
}
