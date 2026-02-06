import { Box, Typography, Button, Stack, Card, CardContent, CardActions, Chip } from '@mui/material';
import { Add, People } from '@mui/icons-material';

const StudentClasses = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Lớp học của tôi
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          Tham gia lớp học
        </Button>
      </Box>

      <Stack spacing={3} direction={{ xs: 'column', md: 'row' }} flexWrap="wrap">
        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hóa học 10 - Cơ bản
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Giáo viên: Nguyễn Văn A
              </Typography>
              <Chip icon={<People />} label="32 học sinh" size="small" />
            </CardContent>
            <CardActions>
              <Button size="small">Xem chi tiết</Button>
            </CardActions>
          </Card>
        </Box>
      </Stack>
    </Box>
  );
};

export default StudentClasses;
