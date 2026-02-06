import { Box, Typography, Paper } from '@mui/material';

const StudentQuizzes = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Bài kiểm tra
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Chưa có bài kiểm tra nào được giao. Kiểm tra lại sau!
        </Typography>
      </Paper>
    </Box>
  );
};

export default StudentQuizzes;
