import { Box, Typography, Stack, Paper, Button, Grid, Chip } from '@mui/material';
import { Quiz, CheckCircle, Timer, ChevronRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StudentQuizzes = () => {
  const navigate = useNavigate();

  const quizData = [
    { id: 'q1', title: 'Kiểm tra chương 1', class: 'Hóa cao cấp A1', status: 'available', time: '45 phút', color: '#6366f1' },
    { id: 'q2', title: 'Quiz giữa kỳ', class: 'Hóa cao cấp A1', status: 'completed', time: '60 phút', color: '#10b981' },
    { id: 'q3', title: 'Thực hành thí nghiệm', class: 'Hóa hữu cơ 2', status: 'locked', time: '30 phút', color: '#94a3b8' }
  ];

  const handleAction = (quizId: string, status: string) => {
    if (status === 'available') {
      navigate(`/student/take-quiz/${quizId}`);
    }
    if (status === 'completed') {
      navigate(`/student/quiz-result/${quizId}`);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Bài kiểm tra</Typography>
          <Typography color="text.secondary">Hoàn thành các bài đánh giá để tích lũy điểm số</Typography>
        </Box>
      </Stack>

      <Grid container spacing={3} mb={5}>
        {[
          { label: 'Cần làm', count: 1, color: '#6366f1' },
          { label: 'Đã xong', count: 1, color: '#10b981' },
          { label: 'Chưa mở', count: 1, color: '#94a3b8' }
        ].map((stat) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: 'center',
                borderTop: `4px solid ${stat.color}`,
                bgcolor: 'background.paper'
              }}
            >
              <Typography variant="h3" fontWeight="800" color={stat.color}>{stat.count}</Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Stack spacing={2}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Danh sách bài làm</Typography>
        {quizData.map((item) => (
          <Paper
            key={item.id}
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 4,
              transition: 'all 0.3s ease',
              border: '1px solid #e2e8f0',
              '&:hover': {
                bgcolor: '#fff',
                borderColor: item.color,
                transform: 'translateY(-2px)',
                boxShadow: `0 10px 20px ${item.color}10`
              }
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    p: 2,
                    bgcolor: `${item.color}12`,
                    borderRadius: 3,
                    display: 'flex',
                    color: item.color
                  }}
                >
                  {item.status === 'completed' ? <CheckCircle /> : <Quiz />}
                </Box>

                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                    <Typography fontWeight="700" variant="body1">{item.title}</Typography>
                    {item.status === 'completed' && (
                      <Chip label="Hoàn thành" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900 }} />
                    )}
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                      {item.class}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Timer sx={{ fontSize: 14, color: 'text.disabled' }} />
                      <Typography variant="caption" color="text.secondary">{item.time}</Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>

              <Button
                size="large"
                disabled={item.status === 'locked'}
                onClick={() => handleAction(item.id, item.status)}
                variant={item.status === 'completed' ? "outlined" : "contained"}
                endIcon={item.status !== 'completed' && <ChevronRight />}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  textTransform: 'none',
                  fontWeight: 700,
                  boxShadow: item.status === 'available' ? `0 8px 16px ${item.color}30` : 'none'
                }}
              >
                {item.status === 'completed' ? "Xem lại" : (item.status === 'locked' ? "Chưa mở" : "Làm bài")}
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default StudentQuizzes;