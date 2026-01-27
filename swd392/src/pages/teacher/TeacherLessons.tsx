import { Box, Typography, Button, Paper } from '@mui/material';
import { Add, AutoAwesome } from '@mui/icons-material';

const TeacherLessons = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Bài giảng
        </Typography>
        <Box>
          <Button variant="outlined" startIcon={<Add />} sx={{ mr: 2 }}>
            Tạo thủ công
          </Button>
          <Button variant="contained" startIcon={<AutoAwesome />}>
            Tạo với AI
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Chưa có bài giảng nào. Bắt đầu tạo bài giảng đầu tiên!
        </Typography>
      </Paper>
    </Box>
  );
};

export default TeacherLessons;
