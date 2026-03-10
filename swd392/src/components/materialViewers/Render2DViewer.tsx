import { Box, Typography } from "@mui/material";
import { ViewInAr } from "@mui/icons-material";
import type { Render2DMaterial } from "../../types/teacherType";

interface Render2DViewerProps {
    content: Render2DMaterial;
}

export default function Render2DViewer({ content }: Render2DViewerProps) {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 4,
                border: "2px dashed",
                borderColor: "primary.light",
                borderRadius: 2,
                bgcolor: "action.hover",
                minHeight: 200,
                gap: 2,
            }}
        >
            <ViewInAr sx={{ fontSize: 56, color: "primary.light" }} />
            <Typography variant="h6" color="text.secondary">
                Trình xem 2D Render
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
                Tính năng 2D tương tác sắp ra mắt.
            </Typography>
            {content?.render_data && content.render_data !== "{}" && (
                <Box
                    component="pre"
                    sx={{
                        mt: 1,
                        p: 2,
                        bgcolor: "background.default",
                        borderRadius: 1,
                        fontSize: 12,
                        maxWidth: "100%",
                        overflow: "auto",
                    }}
                >
                    {content.render_data}
                </Box>
            )}
        </Box>
    );
}
