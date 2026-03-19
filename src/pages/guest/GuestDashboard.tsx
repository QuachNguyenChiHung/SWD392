import { Box, Typography, Stack, Paper, Button } from '@mui/material';
import { School, MenuBook, Group } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const GuestDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <School sx={{ fontSize: 60 }} />,
      title: 'Xem nội dung lớp học',
      description: 'Truy cập các bài giảng và tài liệu đã được công khai',
    },
    {
      icon: <MenuBook sx={{ fontSize: 60 }} />,
      title: 'Khám phá Hóa học',
      description: 'Tìm hiểu các khái niệm hóa học qua trực quan hóa 2D',
    },
    {
      icon: <Group sx={{ fontSize: 60 }} />,
      title: 'Tham gia cộng đồng',
      description: 'Đăng ký để tham gia lớp học và làm bài kiểm tra',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Chào mừng đến với Hệ thống giảng dạy Hóa học THPT
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Nền tảng học tập tương tác với AI hỗ trợ và trực quan hóa 2D
      </Typography>

      {!isAuthenticated && (
        <Box sx={{ mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/auth/login')}
            sx={{ mr: 2 }}
          >
            Đăng nhập
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/auth/register')}
          >
            Đăng ký
          </Button>
        </Box>
      )}

      <Stack spacing={3} direction={{ xs: 'column', md: 'row' }} sx={{ mt: 2 }}>
        {features.map((feature, index) => (
          <Box key={index} sx={{ flex: 1 }}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
              <Typography variant="h6" gutterBottom>
                {feature.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {feature.description}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default GuestDashboard;
