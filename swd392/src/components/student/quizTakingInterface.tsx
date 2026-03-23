import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Stack, Paper, Button,
  Radio, RadioGroup, FormControlLabel, LinearProgress,
  Divider, IconButton, Grid, Chip,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Skeleton, Alert
} from '@mui/material';
import {
  Timer, ChevronLeft, ChevronRight, Send,
  FlagOutlined, Flag, WarningAmber
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

interface QuestionOption {
  text: string;
  index: number;
}

interface Question {
  _id: string;
  quiz_id: string;
  title: string;
  type: 'multiple_choice' | 'true_false';
  options: QuestionOption[] | string[];
  correct_index: number;
}

interface QuizInfo {
  _id: string;
  title: string;
  type: string;
  max_attempt_number: number;
  available_date: string;
  end_date: string;
  status: boolean;
}

const QuizTakingInterface = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quizInfo, setQuizInfo] = useState<QuizInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(1800);
  const [flagged, setFlagged] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const userStr = localStorage.getItem('user');
  void userStr;

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        const materialRes: any = await apiService.get(`/class-materials/${id}`);
        const material = materialRes?.data || materialRes;
        const quizId = material?.content_id;

        if (!quizId) {
          setError('Bài kiểm tra chưa có nội dung');
          return;
        }

        const quiz: QuizInfo = await apiService.get(`/quizzes/${quizId}`);
        setQuizInfo(quiz);

        const qs: Question[] = await apiService.get(`/quizzes/${quizId}/questions`);
        setQuestions(qs);
        setTimeLeft(1800);
      } catch (err: any) {
        setError(err.message || 'Không thể tải bài kiểm tra');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchQuiz();
  }, [id]);

  const executeSubmit = useCallback(async () => {
    setOpenConfirm(false);
    setSubmitting(true);
    try {
      // Build answers array theo format API
      const answersPayload = questions.map((question, idx) => {
        const payload: any = {
          question_id: question._id,
          text: '',
          option: {}
        };
        if (answers[idx] !== undefined) {
          payload.options_picked_index = answers[idx];
        }
        return payload;
      });

      await apiService.post('/quiz-attempts/submit', {
        quiz_id: quizInfo?._id,
        record_json: {
          time_taken: 1800 - timeLeft
        },
        answers: answersPayload
      });

      navigate(`/student/quiz-result/${id}?t=${Date.now()}`, { replace: true });
    } catch (err: any) {
      console.error('Submit error:', err);
      navigate(`/student/quiz-result/${id}?t=${Date.now()}`, { replace: true });
    } finally {
      setSubmitting(false);
    }
  }, [answers, quizInfo, questions, timeLeft]);

  useEffect(() => {
    if (loading || questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          executeSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [executeSubmit, loading, questions.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFlag = () => {
    setFlagged(prev =>
      prev.includes(currentIdx)
        ? prev.filter(i => i !== currentIdx)
        : [...prev, currentIdx]
    );
  };

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="rounded" height={80} sx={{ mb: 3 }} />
        <Stack direction="row" spacing={3}>
          <Skeleton variant="rounded" height={400} sx={{ flex: 2 }} />
          <Skeleton variant="rounded" height={400} sx={{ flex: 1 }} />
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </Box>
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', p: { xs: 2, md: 4 } }}>
      {/* Header Bar */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0', position: 'sticky', top: 10, zIndex: 10 }}>
        <Grid container alignItems="center">
          <Grid size={{ xs: 4 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                color="inherit"
                onClick={() => navigate(-1)}
                sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }}
              >
                ✕
              </Button>
              <Box>
                <Typography variant="caption" color="text.secondary">Bài kiểm tra</Typography>
                <Typography fontWeight="bold" noWrap>{quizInfo?.title || 'Quiz'}</Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 4 }} sx={{ textAlign: 'center' }}>
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
              <Timer color={timeLeft < 300 ? 'error' : 'primary'} />
              <Typography variant="h5" fontWeight="900" color={timeLeft < 300 ? 'error.main' : 'text.primary'}>
                {formatTime(timeLeft)}
              </Typography>
            </Stack>
            {timeLeft < 300 && (
              <Typography variant="caption" color="error">Sắp hết giờ!</Typography>
            )}
          </Grid>
          <Grid size={{ xs: 4 }} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={() => setOpenConfirm(true)}
              disabled={submitting}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >
              Nộp bài
            </Button>
          </Grid>
        </Grid>
        <LinearProgress variant="determinate" value={progress} sx={{ mt: 2, height: 6, borderRadius: 3 }} />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
          {answeredCount}/{questions.length} câu đã trả lời
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Question Area */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, minHeight: 400 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" color="primary" fontWeight="bold">
                  Câu {currentIdx + 1}/{questions.length}
                </Typography>
              </Stack>
              <IconButton onClick={toggleFlag} color={flagged.includes(currentIdx) ? 'error' : 'default'}>
                {flagged.includes(currentIdx) ? <Flag color="error" /> : <FlagOutlined />}
              </IconButton>
            </Stack>

            <Paper variant="outlined" sx={{ p: 2, mb: 4, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="body1" fontWeight="600">
                {currentQuestion?.title || `Câu hỏi số ${currentIdx + 1}`}
              </Typography>
            </Paper>

            <RadioGroup
              value={answers[currentIdx] !== undefined ? answers[currentIdx].toString() : ''}
              onChange={(e) => setAnswers({ ...answers, [currentIdx]: parseInt(e.target.value) })}
            >
              <Stack spacing={2}>
                {currentQuestion?.options.map((opt, optIdx) => {
                  const optIndex = typeof opt === 'string' ? optIdx : (opt.index ?? optIdx);
                  const optText = typeof opt === 'string' ? opt : opt.text;
                  const isSelected = answers[currentIdx] === optIndex;

                  return (
                    <Paper
                      key={optIdx}
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        borderColor: isSelected ? 'primary.main' : '#e2e8f0',
                        borderWidth: isSelected ? 2 : 1,
                        bgcolor: isSelected ? '#f0f7ff' : 'transparent',
                        transition: '0.2s',
                        cursor: 'pointer',
                        '&:hover': { borderColor: 'primary.light', bgcolor: '#f8fbff' }
                      }}
                      onClick={() => setAnswers({ ...answers, [currentIdx]: optIndex })}
                    >
                      <FormControlLabel
                        value={optIndex.toString()}
                        control={<Radio />}
                        label={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={String.fromCharCode(65 + optIdx)}
                              size="small"
                              sx={{
                                bgcolor: isSelected ? 'primary.main' : '#f1f5f9',
                                color: isSelected ? 'white' : 'text.secondary',
                                fontWeight: 'bold',
                                minWidth: 28,
                                height: 24
                              }}
                            />
                            <Typography>{optText}</Typography>
                          </Stack>
                        }
                        sx={{ width: '100%', m: 0, px: 2, py: 1.5 }}
                      />
                    </Paper>
                  );
                })}
              </Stack>
            </RadioGroup>

            <Divider sx={{ my: 4 }} />
            <Stack direction="row" justifyContent="space-between">
              <Button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => prev - 1)}
                startIcon={<ChevronLeft />}
                variant="outlined"
              >
                Câu trước
              </Button>
              <Button
                disabled={currentIdx === questions.length - 1}
                onClick={() => setCurrentIdx(prev => prev + 1)}
                endIcon={<ChevronRight />}
                variant="outlined"
              >
                Tiếp theo
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 4, position: 'sticky', top: 160 }}>
            <Typography fontWeight="bold" mb={2}>Bảng câu hỏi</Typography>
            <Grid container spacing={1}>
              {questions.map((_, idx) => {
                const isAnswered = answers[idx] !== undefined;
                const isCurrent = currentIdx === idx;
                const isFlagged = flagged.includes(idx);

                return (
                  <Grid size={{ xs: 3 }} key={idx}>
                    <Button
                      fullWidth
                      size="small"
                      variant={isCurrent ? 'contained' : 'outlined'}
                      onClick={() => setCurrentIdx(idx)}
                      sx={{
                        minWidth: 0,
                        fontWeight: 'bold',
                        bgcolor: isAnswered && !isCurrent ? '#dbeafe' : undefined,
                        borderColor: isFlagged ? '#ef4444' : (isCurrent ? undefined : '#e2e8f0'),
                        borderWidth: isFlagged ? 2 : 1,
                        color: isAnswered && !isCurrent ? '#1d4ed8' : undefined,
                      }}
                    >
                      {idx + 1}
                    </Button>
                  </Grid>
                );
              })}
            </Grid>

            <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Stack spacing={0.5}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 12, height: 12, bgcolor: '#dbeafe', border: '1px solid #93c5fd', borderRadius: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">Đã trả lời</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 12, height: 12, bgcolor: 'white', border: '2px solid #ef4444', borderRadius: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">Đã đánh dấu</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 12, height: 12, bgcolor: 'white', border: '1px solid #e2e8f0', borderRadius: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">Chưa trả lời</Typography>
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ mt: 2, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
              <Typography variant="caption" color="success.main" fontWeight="bold">
                Tiến độ: {answeredCount}/{questions.length} câu
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                color="success"
                sx={{ mt: 1, height: 4, borderRadius: 2 }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirm Dialog */}
      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmber color="warning" /> Xác nhận nộp bài?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn đã hoàn thành <b>{answeredCount}/{questions.length}</b> câu hỏi.
            {answeredCount < questions.length && (
              <> Còn <b>{questions.length - answeredCount}</b> câu chưa trả lời.</>
            )}
            {' '}Sau khi nộp, bạn sẽ không thể chỉnh sửa câu trả lời.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenConfirm(false)} color="inherit">Kiểm tra lại</Button>
          <Button onClick={executeSubmit} variant="contained" disabled={submitting} autoFocus>
            {submitting ? 'Đang nộp...' : 'Xác nhận nộp'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizTakingInterface;