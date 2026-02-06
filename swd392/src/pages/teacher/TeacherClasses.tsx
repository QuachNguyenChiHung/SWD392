import { Box, Typography, Button, Stack, Card, CardContent, CardActions, Chip } from '@mui/material';
import { Add, People, Assignment } from '@mui/icons-material';

const TeacherClasses = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Quản lý lớp học
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          Tạo lớp học mới
        </Button>
      </Box>

      <Stack spacing={3} direction={{ xs: 'column', md: 'row' }} flexWrap="wrap">
        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hóa học 10A1
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Mã lớp: CH10A1-2026
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip icon={<People />} label="32 học sinh" size="small" />
                <Chip icon={<Assignment />} label="8 bài giảng" size="small" />
              </Box>
            </CardContent>
            <CardActions>
              <Button size="small">Quản lý</Button>
              <Button size="small">Xem chi tiết</Button>
            </CardActions>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
};

export default TeacherClasses;
