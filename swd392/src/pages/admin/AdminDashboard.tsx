import { Box, Typography, Stack, Paper } from '@mui/material';
import { People, School, Assignment, Gavel } from '@mui/icons-material';

const AdminDashboard = () => {
  const stats = [
    { label: 'Tổng người dùng', value: '1,234', icon: <People />, color: '#1976d2' },
    { label: 'Lớp học', value: '156', icon: <School />, color: '#2e7d32' },
    { label: 'Bài giảng', value: '892', icon: <Assignment />, color: '#ed6c02' },
    { label: 'Yêu cầu chờ duyệt', value: '12', icon: <Gavel />, color: '#d32f2f' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard Quản trị
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Quản lý toàn bộ hệ thống
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
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hoạt động hệ thống
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Theo dõi hoạt động hệ thống ở đây
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Yêu cầu gần đây
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Không có yêu cầu nào
            </Typography>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default AdminDashboard;
