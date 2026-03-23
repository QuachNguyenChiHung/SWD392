import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Stack, Paper, Chip, Button,
  Skeleton, Alert, Divider, LinearProgress, Grid
} from '@mui/material';
import {
  ArrowBack, CheckCircle, Cancel, Timer,
  EmojiEvents, Quiz, BarChart, Replay
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import StudentPageShell from '../../components/student/StudentPageShell';

interface QuizResult {
  _id: string;
  quiz_attempt_id: string;
  text: string;
  options: { text: string; index: number }[] | Record<string, any> | null;
  options_picked_index: number;
  isCorrect: boolean;
}

interface AttemptInfo {
  _id: string;
  quiz_id: { _id: string; title: string; type: string } | string;
  user_id: any;
  attempt_number: number;
  date: string;
  record_json: any;
}

interface Score {
  total: number;
  correct: number;
  score: number;
  percentage: number;
}

const QuizResultView = () => {
  const { id } = useParams<{ id: string }>(); // material ID
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get('classId');

  const [attempt, setAttempt] = useState<AttemptInfo | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [score, setScore] = useState<Score | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [_quizId, setQuizId] = useState<string | null>(null);
  const [maxAttempts, setMaxAttempts] = useState<number>(999);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const timestamp = searchParams.get('t');

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Get material to find quiz_id
        const material: any = await apiService.get(`/class-materials/${id}`);
        const qId = material?.content_id;

        if (!qId) {
          setError('Bài kiểm tra chưa có nội dung');
          return;
        }
        setQuizId(qId);

        // Fetch quiz info for max_attempt_number
        try {
          const quizInfo: any = await apiService.get(`/quizzes/${qId}`);
          setMaxAttempts(quizInfo?.max_attempt_number ?? 999);
        } catch {}

        // 2. Get my attempts, find latest for this quiz
        const myAttempts: any[] = await apiService.get('/my-quiz-attempts');
        const matchingAttempt = myAttempts
          .filter(a => {
            const aQuizId = typeof a.attempt?.quiz_id === 'object'
              ? a.attempt.quiz_id._id
              : a.attempt?.quiz_id;
            return aQuizId === qId;
          })
          .sort((a, b) =>
            new Date(b.attempt.date).getTime() - new Date(a.attempt.date).getTime()
          )[0];

        if (!matchingAttempt) {
          setError('Chưa có kết quả cho bài kiểm tra này');
          return;
        }

        // 3. Get attempt with results (latest)
        const data: any = await apiService.get(
          `/quiz-attempts/${matchingAttempt.attempt._id}/with-results`
        );

        setAttempt(data.attempt);
        // Count total attempts for this quiz
        const totalAttempts = myAttempts.filter(a => {
          const aQuizId = typeof a.attempt?.quiz_id === 'object' ? a.attempt.quiz_id._id : a.attempt?.quiz_id;
          return aQuizId === qId;
        }).length;
        setAttemptCount(totalAttempts);
        setResults(data.results || []);
        setScore(data.score || matchingAttempt.score);
      } catch (err: any) {
        setError(err.message || 'Không thể tải kết quả');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchResult();
  }, [id, timestamp]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 80) return 'Xuất sắc';
    if (percentage >= 65) return 'Khá';
    if (percentage >= 50) return 'Trung bình';
    return 'Cần cố gắng';
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="text" height={40} width="30%" sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={200} sx={{ mb: 3 }} />
        <Stack spacing={2}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={100} />)}
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => classId ? navigate(`/student/class/${classId}`) : navigate(-1)} sx={{ mb: 3 }}>
          Quay lại
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const quizTitle = typeof attempt?.quiz_id === 'object'
    ? attempt.quiz_id.title
    : 'Bài kiểm tra';

  const scoreColor = score ? getScoreColor(score.percentage) : '#6366f1';
  const timeTaken = attempt?.record_json?.time_taken;

  return (
    <StudentPageShell
      title="Kết quả bài kiểm tra"
      subtitle={quizTitle}
      chipLabel="Đánh giá học tập"
      actions={(
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => classId ? navigate(`/student/class/${classId}`) : navigate(-1)}
            sx={{ textTransform: 'none', fontWeight: 700, color: '#12344d' }}
          >
            Quay lại
          </Button>
          <Button
            variant="outlined"
            startIcon={<Replay />}
            onClick={() => navigate(`/student/take-quiz/${id}`, { replace: true })}
            disabled={attemptCount >= maxAttempts}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            {attemptCount >= maxAttempts ? `Hết lượt (${maxAttempts} lần)` : 'Làm lại'}
          </Button>
        </Stack>
      )}
    >

      <Grid container spacing={3}>
        {/* Score Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            <Paper sx={{
              p: 4, textAlign: 'center',
              background: `linear-gradient(135deg, ${scoreColor}15, ${scoreColor}05)`,
              border: `1px solid ${scoreColor}30`,
              borderRadius: 3
            }}>
              <EmojiEvents sx={{ fontSize: 48, color: scoreColor, mb: 1 }} />
              <Typography variant="h2" fontWeight="900" sx={{ color: scoreColor }}>
                {score?.score ?? 0}
              </Typography>
              <Chip
                label={getScoreLabel(score?.percentage ?? 0)}
                sx={{ bgcolor: `${scoreColor}20`, color: scoreColor, fontWeight: 'bold', mt: 1 }}
              />
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {score?.correct ?? 0}/{score?.total ?? 0} câu đúng
              </Typography>
            </Paper>

            <Paper sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                <BarChart sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                Thống kê
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Lần thử</Typography>
                  <Typography variant="body2" fontWeight="bold">#{attempt?.attempt_number}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Ngày làm</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {attempt?.date ? formatDate(attempt.date) : '-'}
                  </Typography>
                </Box>
                {timeTaken !== undefined && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      <Timer sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                      Thời gian
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {Math.floor(timeTaken / 60)}p {timeTaken % 60}s
                    </Typography>
                  </Box>
                )}
                <Divider />
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="success.main">Đúng</Typography>
                    <Typography variant="caption" color="success.main" fontWeight="bold">
                      {score?.correct ?? 0}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={score?.percentage ?? 0}
                    color="success"
                    sx={{ height: 6, borderRadius: 3, mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="error.main">Sai</Typography>
                    <Typography variant="caption" color="error.main" fontWeight="bold">
                      {(score?.total ?? 0) - (score?.correct ?? 0)}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Question Results */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" mb={3}>
              <Quiz sx={{ color: '#6366f1' }} />
              <Typography variant="h6" fontWeight="bold">Chi tiết câu hỏi</Typography>
              <Chip label={`${results.length} câu`} size="small" sx={{ bgcolor: '#f0f7ff', color: '#6366f1' }} />
            </Stack>

            <Stack spacing={2}>
              {results.map((result, index) => {
                const options = Array.isArray(result.options) ? result.options : [];

                return (
                  <Paper
                    key={result._id}
                    variant="outlined"
                    sx={{
                      p: 2.5, borderRadius: 2,
                      borderColor: result.isCorrect ? '#bbf7d0' : '#fecaca',
                      bgcolor: result.isCorrect ? '#f0fdf4' : '#fff5f5'
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{ flexShrink: 0, mt: 0.3 }}>
                        {result.isCorrect
                          ? <CheckCircle sx={{ color: '#10b981', fontSize: 20 }} />
                          : <Cancel sx={{ color: '#ef4444', fontSize: 20 }} />
                        }
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" color="text.secondary">Câu {index + 1}</Typography>
                          <Chip
                            label={result.isCorrect ? 'Đúng' : 'Sai'}
                            size="small"
                            sx={{
                              bgcolor: result.isCorrect ? '#d1fae5' : '#fee2e2',
                              color: result.isCorrect ? '#059669' : '#dc2626',
                              fontWeight: 'bold', height: 20, fontSize: '0.7rem'
                            }}
                          />
                        </Stack>

                        <Typography variant="body1" fontWeight="600" mb={1.5}>
                          {result.text || `Câu hỏi ${index + 1}`}
                        </Typography>

                        {options.length > 0 ? (
                          <Stack spacing={0.75}>
                            {options.map((opt: any, optIdx: number) => {
                              const optText = typeof opt === 'string' ? opt : opt.text;
                              const optIndex = typeof opt === 'string' ? optIdx : (opt.index ?? optIdx);
                              const isPicked = result.options_picked_index === optIndex;

                              return (
                                <Box
                                  key={optIdx}
                                  sx={{
                                    px: 1.5, py: 0.75, borderRadius: 1.5,
                                    bgcolor: isPicked ? (result.isCorrect ? '#d1fae5' : '#fee2e2') : '#f8fafc',
                                    border: '1px solid',
                                    borderColor: isPicked ? (result.isCorrect ? '#6ee7b7' : '#fca5a5') : '#e2e8f0',
                                    display: 'flex', alignItems: 'center', gap: 1
                                  }}
                                >
                                  <Chip
                                    label={String.fromCharCode(65 + optIdx)}
                                    size="small"
                                    sx={{
                                      height: 20, minWidth: 24, fontSize: '0.65rem', fontWeight: 'bold',
                                      bgcolor: isPicked ? (result.isCorrect ? '#10b981' : '#ef4444') : '#e2e8f0',
                                      color: isPicked ? 'white' : 'text.secondary'
                                    }}
                                  />
                                  <Typography variant="body2">{optText}</Typography>
                                  {isPicked && (
                                    result.isCorrect
                                      ? <CheckCircle sx={{ fontSize: 14, color: '#10b981', ml: 'auto' }} />
                                      : <Cancel sx={{ fontSize: 14, color: '#ef4444', ml: 'auto' }} />
                                  )}
                                </Box>
                              );
                            })}
                          </Stack>
                        ) : (
                          <Box sx={{ px: 1.5, py: 1, borderRadius: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                            <Typography variant="body2" color="text.secondary">
                              Đã chọn đáp án #{result.options_picked_index + 1} •{' '}
                              <b style={{ color: result.isCorrect ? '#059669' : '#dc2626' }}>
                                {result.isCorrect ? 'Đúng' : 'Sai'}
                              </b>
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}

              {results.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Không có dữ liệu chi tiết câu hỏi
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </StudentPageShell>
  );
};

export default QuizResultView;
