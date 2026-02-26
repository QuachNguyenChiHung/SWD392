import { Box, Typography, Stack, Paper, Button, Chip } from '@mui/material';
import { Quiz, Timer, CheckCircle, Lock, CalendarToday } from '@mui/icons-material';

const mockQuizzes = [
  {
    id: 1,
    title: 'Kiểm tra chương 1: Nguyên tử và phân tử',
    class_name: 'Hóa cao cấp A1',
    status: 'available',
    due_date: '2026-03-10',
    duration: 45,
    questions: 20,
    attempts: 0,
    max_attempts: 2,
  },
  {
    id: 2,
    title: 'Quiz giữa kỳ: Phản ứng hóa học',
    class_name: 'Hóa cao cấp A1',
    status: 'completed',
    due_date: '2026-02-20',
    duration: 60,
    questions: 30,
    attempts: 1,
    max_attempts: 1,
    score: 8.5,
  },
  {
    id: 3,
    title: 'Kiểm tra chương 3: Liên kết hóa học',
    class_name: 'Hóa cao cấp A1',
    status: 'locked',
    due_date: '2026-03-25',
    duration: 30,
    questions: 15,
    attempts: 0,
    max_attempts: 3,
  },
];

const statusConfig = {
  available: { label: 'Có thể làm', color: '#6366f1', bg: '#eef2ff', icon: <Quiz sx={{ fontSize: 16 }} /> },
  completed:  { label: 'Đã hoàn thành', color: '#10b981', bg: '#d1fae5', icon: <CheckCircle sx={{ fontSize: 16 }} /> },
  locked:     { label: 'Chưa mở', color: '#94a3b8', bg: '#f1f5f9', icon: <Lock sx={{ fontSize: 16 }} /> },
};

const StudentQuizzes = () => {
  const available = mockQuizzes.filter(q => q.status === 'available');
  const completed = mockQuizzes.filter(q => q.status === 'completed');
  const locked = mockQuizzes.filter(q => q.status === 'locked');

  const QuizCard = ({ quiz }: { quiz: typeof mockQuizzes[0] }) => {
    const cfg = statusConfig[quiz.status as keyof typeof statusConfig];
    return (
      <Paper elevation={0} sx={{
        p: 3, borderRadius: 3,
        border: '1px solid #e2e8f0', background: 'white',
        transition: 'all 0.2s',
        opacity: quiz.status === 'locked' ? 0.6 : 1,
        '&:hover': quiz.status !== 'locked'
          ? { transform: 'translateX(4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderColor: cfg.color }
          : {},
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{
              width: 48, height: 48, borderRadius: 2.5, flexShrink: 0,
              background: cfg.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              '& svg': { color: cfg.color, fontSize: 24 }
            }}>
              {cfg.icon}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0f172a', mb: 0.3 }}>
                {quiz.title}
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                {quiz.class_name}
              </Typography>
            </Box>
          </Stack>
          <Chip
            label={cfg.label}
            size="small"
            sx={{ background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 11, flexShrink: 0, ml: 1 }}
          />
        </Stack>

        <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Timer sx={{ fontSize: 14, color: '#94a3b8' }} />
            <Typography sx={{ fontSize: 12, color: '#64748b' }}>{quiz.duration} phút</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Quiz sx={{ fontSize: 14, color: '#94a3b8' }} />
            <Typography sx={{ fontSize: 12, color: '#64748b' }}>{quiz.questions} câu</Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <CalendarToday sx={{ fontSize: 14, color: '#94a3b8' }} />
            <Typography sx={{ fontSize: 12, color: '#64748b' }}>
              Hạn: {new Date(quiz.due_date).toLocaleDateString('vi-VN')}
            </Typography>
          </Stack>
          {quiz.status === 'completed' && quiz.score && (
            <Chip label={`${quiz.score}/10`} size="small" sx={{
              background: '#d1fae5', color: '#065f46', fontWeight: 700, fontSize: 12,
            }} />
          )}
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
            Lần làm: {quiz.attempts}/{quiz.max_attempts}
          </Typography>
          {quiz.status === 'available' && (
            <Button size="small" variant="contained" startIcon={<Quiz />} sx={{
              background: '#6366f1', borderRadius: 2,
              textTransform: 'none', fontWeight: 700, fontSize: 12,
              px: 2, boxShadow: 'none',
              '&:hover': { background: '#4f46e5', boxShadow: 'none' }
            }}>
              Làm bài
            </Button>
          )}
          {quiz.status === 'completed' && (
            <Button size="small" variant="outlined" startIcon={<CheckCircle />} sx={{
              borderColor: '#10b981', color: '#10b981', borderRadius: 2,
              textTransform: 'none', fontWeight: 700, fontSize: 12, px: 2,
              '&:hover': { background: '#d1fae5', borderColor: '#10b981' }
            }}>
              Xem kết quả
            </Button>
          )}
          {quiz.status === 'locked' && (
            <Button size="small" variant="outlined" disabled startIcon={<Lock />} sx={{
              borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: 12, px: 2,
            }}>
              Chưa mở
            </Button>
          )}
        </Stack>
      </Paper>
    );
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      p: { xs: 2, md: 4 },
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontWeight: 700, fontSize: { xs: 20, md: 26 }, color: '#0f172a' }}>
          Bài kiểm tra
        </Typography>
        <Typography sx={{ color: '#64748b', fontSize: 14, mt: 0.3 }}>
          Danh sách bài kiểm tra của bạn
        </Typography>
      </Box>

      {/* Stats */}
      <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        {[
          { label: 'Cần làm', value: available.length, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Đã hoàn thành', value: completed.length, color: '#10b981', bg: '#d1fae5' },
          { label: 'Chưa mở', value: locked.length, color: '#94a3b8', bg: '#f1f5f9' },
        ].map((s, i) => (
          <Paper key={i} elevation={0} sx={{
            p: 2.5, borderRadius: 3, border: '1px solid #e2e8f0',
            background: 'white', flex: '1 1 140px', minWidth: 130,
          }}>
            <Typography sx={{ fontWeight: 700, fontSize: 28, color: s.color, lineHeight: 1 }}>
              {s.value}
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: 12, mt: 0.5, fontWeight: 600 }}>
              {s.label}
            </Typography>
          </Paper>
        ))}
      </Stack>

      {/* Available */}
      {available.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#0f172a', mb: 2 }}>
            🔔 Cần làm ngay
          </Typography>
          <Stack spacing={2}>
            {available.map(q => <QuizCard key={q.id} quiz={q} />)}
          </Stack>
        </Box>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#0f172a', mb: 2 }}>
            ✅ Đã hoàn thành
          </Typography>
          <Stack spacing={2}>
            {completed.map(q => <QuizCard key={q.id} quiz={q} />)}
          </Stack>
        </Box>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#0f172a', mb: 2 }}>
            🔒 Sắp mở
          </Typography>
          <Stack spacing={2}>
            {locked.map(q => <QuizCard key={q.id} quiz={q} />)}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default StudentQuizzes;