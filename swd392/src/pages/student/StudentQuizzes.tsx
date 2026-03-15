import { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Paper, Button, Chip, Skeleton,
  Accordion, AccordionSummary, AccordionDetails, Avatar
} from '@mui/material';
import { Quiz, CheckCircle, Timer, ChevronRight, ExpandMore, School } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const CLASS_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

interface ClassItem {
  _id: string;
  class_name: string;
  img_cover_link?: string;
}

interface ClassMaterial {
  _id: string;
  title: string;
  type: string;
  content_id: string;
  status: string;
  order_num?: number;
  quizTitle?: string; // fetched from /quizzes/{content_id}
}

interface QuizAttempt {
  _id: string;
  quiz_id: string | { _id: string; title: string; type: string };
  user_id: string;
  attempt_number: number;
  date: string;
  record_json: any;
  score?: { total: number; correct: number; score: number; percentage: number };
}

interface ClassWithQuizzes {
  cls: ClassItem;
  quizzes: ClassMaterial[];
  colorIndex: number;
}

const StudentQuizzes = () => {
  const [classesWithQuizzes, setClassesWithQuizzes] = useState<ClassWithQuizzes[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Get all enrolled classes
        const classesData: ClassItem[] = await apiService.get('/student/class?page=1');

        // 2. For each class, get materials and filter quiz type
        const results: ClassWithQuizzes[] = [];
        for (let i = 0; i < classesData.length; i++) {
          const cls = classesData[i];
          try {
            const materials: ClassMaterial[] = await apiService.get(
              `/class-materials?class_id=${cls._id}`
            );
            const quizzes = materials.filter(m => m.type === 'quiz');
            // Fetch quiz title for each quiz material
            const quizzesWithTitle = await Promise.all(quizzes.map(async (q) => {
              if (!q.content_id) return q;
              try {
                const quizData: any = await apiService.get(`/quizzes/${q.content_id}`);
                return { ...q, quizTitle: quizData?.title || q.title };
              } catch {
                return q;
              }
            }));
            if (quizzesWithTitle.length > 0) {
              results.push({ cls, quizzes: quizzesWithTitle, colorIndex: i });
            }
          } catch (err) {
            console.warn(`Failed to fetch materials for class ${cls._id}`);
          }
        }
        setClassesWithQuizzes(results);
        console.log('quiz content_ids:', results.flatMap(c => c.quizzes.map(q => q.content_id)));

        // 3. Get user's quiz attempts via /my-quiz-attempts (quiz_id is populated)
        try {
          const myAttempts: any[] = await apiService.get('/my-quiz-attempts');
          const mapped: QuizAttempt[] = myAttempts.map((item) => ({
            ...item.attempt,
            score: item.score,
          }));
          setAttempts(mapped);
          console.log('attempts quiz_ids:', mapped.map(a => typeof a.quiz_id === 'object' ? (a.quiz_id as any)._id : a.quiz_id));
        } catch (err) {
          console.warn('Failed to fetch quiz attempts');
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const getAttemptForQuiz = (contentId: string): QuizAttempt | undefined =>
    attempts.find(a => {
      const qId = typeof a.quiz_id === 'object' ? (a.quiz_id as any)._id : a.quiz_id;
      return qId === contentId;
    });

  const totalQuizzes = classesWithQuizzes.reduce((sum, c) => sum + c.quizzes.length, 0);
  const completedQuizzes = classesWithQuizzes.reduce((sum, c) => {
    return sum + c.quizzes.filter(q => getAttemptForQuiz(q.content_id)).length;
  }, 0);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4}>
        <Box>
          <Typography color="text.secondary">Hoàn thành các bài đánh giá để tích lũy điểm số</Typography>
        </Box>
      </Stack>

      {/* Stats */}
      <Stack direction="row" spacing={2} mb={4}>
        <Paper variant="outlined" sx={{ p: 2.5, flex: 1, textAlign: 'center', borderTop: '4px solid #6366f1' }}>
          {loading ? <Skeleton width={40} sx={{ mx: 'auto' }} /> : (
            <Typography variant="h4" fontWeight="800" color="#6366f1">{totalQuizzes}</Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            Tổng bài
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.5, flex: 1, textAlign: 'center', borderTop: '4px solid #10b981' }}>
          {loading ? <Skeleton width={40} sx={{ mx: 'auto' }} /> : (
            <Typography variant="h4" fontWeight="800" color="#10b981">{completedQuizzes}</Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            Đã làm
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.5, flex: 1, textAlign: 'center', borderTop: '4px solid #f59e0b' }}>
          {loading ? <Skeleton width={40} sx={{ mx: 'auto' }} /> : (
            <Typography variant="h4" fontWeight="800" color="#f59e0b">{totalQuizzes - completedQuizzes}</Typography>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
            Chưa làm
          </Typography>
        </Paper>
      </Stack>

      {/* Loading */}
      {loading && (
        <Stack spacing={2}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={80} />)}
        </Stack>
      )}

      {/* Empty */}
      {!loading && classesWithQuizzes.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Quiz sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Chưa có bài kiểm tra nào</Typography>
          <Typography color="text.secondary">Các bài kiểm tra sẽ xuất hiện khi giáo viên tạo</Typography>
        </Paper>
      )}

      {/* Grouped by class */}
      <Stack spacing={2}>
        {classesWithQuizzes.map(({ cls, quizzes, colorIndex }) => {
          const color = CLASS_COLORS[colorIndex % CLASS_COLORS.length];
          const doneCount = quizzes.filter(q => getAttemptForQuiz(q.content_id)).length;

          return (
            <Accordion key={cls._id} defaultExpanded variant="outlined" sx={{ borderRadius: '8px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 1 }}>
                  <Avatar sx={{ bgcolor: `${color}20`, color: color, width: 36, height: 36 }}>
                    <School fontSize="small" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight="bold">{cls.class_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {quizzes.length} bài kiểm tra
                    </Typography>
                  </Box>
                  <Chip
                    label={`${doneCount}/${quizzes.length} hoàn thành`}
                    size="small"
                    sx={{
                      bgcolor: doneCount === quizzes.length ? '#d1fae5' : `${color}15`,
                      color: doneCount === quizzes.length ? '#059669' : color,
                      fontWeight: 'bold'
                    }}
                  />
                </Stack>
              </AccordionSummary>

              <AccordionDetails sx={{ pt: 0 }}>
                <Stack spacing={1.5}>
                  {quizzes.map((quiz) => {
                    const attempt = getAttemptForQuiz(quiz.content_id);
                    const isDone = !!attempt;

                    return (
                      <Paper
                        key={quiz._id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          transition: '0.2s',
                          '&:hover': {
                            borderColor: color,
                            transform: 'translateX(4px)',
                            boxShadow: `0 4px 12px ${color}15`
                          }
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1.5, bgcolor: isDone ? '#d1fae520' : `${color}12`, borderRadius: 2, display: 'flex', color: isDone ? '#059669' : color }}>
                              {isDone ? <CheckCircle /> : <Quiz />}
                            </Box>
                            <Box>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography fontWeight="700">{quiz.quizTitle || quiz.title}</Typography>
                                {isDone && (
                                  <Chip label="Đã làm" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900 }} />
                                )}
                              </Stack>
                              {attempt && (
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <Timer sx={{ fontSize: 13, color: 'text.disabled' }} />
                                  <Typography variant="caption" color="text.secondary">
                                    Lần {attempt.attempt_number} • {new Date(attempt.date).toLocaleDateString('vi-VN')}
                                  </Typography>
                                </Stack>
                              )}
                            </Box>
                          </Stack>

                          <Button
                            size="small"
                            variant={isDone ? 'outlined' : 'contained'}
                            endIcon={!isDone && <ChevronRight />}
                            onClick={() => navigate(isDone
                              ? `/student/quiz-result/${quiz._id}`
                              : `/student/take-quiz/${quiz._id}`
                            )}
                            sx={{
                              borderRadius: 2,
                              px: 3,
                              textTransform: 'none',
                              fontWeight: 700,
                              borderColor: isDone ? color : undefined,
                              color: isDone ? color : undefined,
                              bgcolor: !isDone ? color : undefined,
                              '&:hover': { bgcolor: !isDone ? `${color}dd` : undefined }
                            }}
                          >
                            {isDone ? 'Xem lại' : 'Làm bài'}
                          </Button>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Box>
  );
};

export default StudentQuizzes;