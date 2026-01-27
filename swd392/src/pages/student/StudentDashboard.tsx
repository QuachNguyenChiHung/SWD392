import { Box, Typography, Stack, Paper, Button } from '@mui/material';
import { Class, Quiz, TrendingUp, EmojiEvents } from '@mui/icons-material';

const StudentDashboard = () => {
  const stats = [
    { label: 'Lớp học đã tham gia', value: '5', icon: <Class />, color: '#1976d2' },
    { label: 'Bài kiểm tra hoàn thành', value: '12', icon: <Quiz />, color: '#2e7d32' },
    { label: 'Điểm trung bình', value: '8.5', icon: <TrendingUp />, color: '#ed6c02' },
    { label: 'Thành tựu', value: '7', icon: <EmojiEvents />, color: '#9c27b0' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard Học sinh
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Theo dõi tiến độ học tập của bạn
      </Typography>

      <Stack spacing={3} direction="row" flexWrap="wrap" sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Box key={index} sx={{ flex: '1 1 200px', minWidth: 200 }}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: stat.color,
                color: 'white',
              }}
            >
              <Box sx={{ fontSize: 40, mb: 1 }}>{stat.icon}</Box>
              <Typography variant="h4" fontWeight="bold">
                {stat.value}
              </Typography>
              <Typography variant="body2">{stat.label}</Typography>
            </Paper>
          </Box>
        ))}
      </Stack>

      <Stack spacing={3} direction={{ xs: 'column', md: 'row' }}>
        <Box sx={{ flex: 2 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bài kiểm tra gần đây
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chưa có bài kiểm tra nào. Tham gia lớp học để bắt đầu!
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: 1, minWidth: 250 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hành động nhanh
            </Typography>
            <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
              Tham gia lớp học
            </Button>
            <Button fullWidth variant="outlined">
              Trợ lý AI
            </Button>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default StudentDashboard;
