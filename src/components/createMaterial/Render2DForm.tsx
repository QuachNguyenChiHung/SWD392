import { Box, Typography } from "@mui/material";
import { ViewInAr } from "@mui/icons-material";

export default function Render2DForm() {
    return (
        <Box sx={{ p: 3, border: "1px dashed", borderColor: 'grey.400', borderRadius: 1, textAlign: 'center' }}>
            <ViewInAr sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
                Tính năng mô hình hóa 2D
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Tạo mô hình phân tử, cấu trúc hóa học tương tác
            </Typography>
        </Box>
    );
}
