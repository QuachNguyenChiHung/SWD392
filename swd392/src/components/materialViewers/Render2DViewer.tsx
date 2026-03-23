import { Box, Typography } from "@mui/material";
import { ViewInAr } from "@mui/icons-material";
import type { Render2DMaterial } from "../../types/teacherType";
import { COLORS, RADIUS } from "../../pages/teacher/teacherStyles";

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
                p: 6,
                border: `2px dashed ${COLORS.info}`,
                borderRadius: RADIUS,
                bgcolor: COLORS.infoBg,
                minHeight: 250,
                gap: 2,
            }}
        >
            <ViewInAr sx={{ fontSize: 64, color: COLORS.info }} />
            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: COLORS.info }}>
                Trình xem 2D Render
            </Typography>
            <Typography sx={{ fontSize: "0.85rem", color: COLORS.textSecondary, textAlign: "center" }}>
                Tính năng 2D tương tác sắp ra mắt.
            </Typography>
            {content?.render_data && content.render_data !== "{}" && (
                <Box
                    component="pre"
                    sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: COLORS.card,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: RADIUS,
                        fontSize: "0.75rem",
                        color: COLORS.textDark,
                        maxWidth: "100%",
                        overflow: "auto",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                >
                    {content.render_data}
                </Box>
            )}
        </Box>
    );
}
