import { Box, Typography, Stack, Paper, Button } from '@mui/material';
import { School, Assignment, People, AutoAwesome } from '@mui/icons-material';

const TeacherDashboard = () => {
  const stats = [
    { label: 'Lớp học quản lý', value: '3', icon: <School />, color: '#1976d2' },
    { label: 'Học sinh', value: '87', icon: <People />, color: '#2e7d32' },
    { label: 'Bài giảng', value: '24', icon: <Assignment />, color: '#ed6c02' },
    { label: 'AI đã tạo', value: '15', icon: <AutoAwesome />, color: '#9c27b0' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard Giáo viên
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Quản lý lớp học và tạo nội dung học tập
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
              Hoạt động gần đây
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Không có hoạt động nào gần đây
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: 1, minWidth: 250 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hành động nhanh
            </Typography>
            <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
              Tạo lớp học mới
            </Button>
            <Button fullWidth variant="outlined" sx={{ mb: 1 }}>
              Tạo bài giảng với AI
            </Button>
            <Button fullWidth variant="outlined">
              Xem tiến độ học sinh
            </Button>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default TeacherDashboard;
