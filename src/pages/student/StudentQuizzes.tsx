import { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Paper, Button, Chip, Skeleton,
  Accordion, AccordionSummary, AccordionDetails, Avatar
} from '@mui/material';
import { Quiz, CheckCircle, Timer, ChevronRight, ExpandMore, School, MenuBook } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';

const CLASS_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

interface ClassItem {
  _id: string;
  class_name: string;
  img_cover_link?: string;
  course_id?: string;
}

interface Topic {
  _id: string;
  title: string;
  description?: string;
}

interface QuizMaterial {
  _id: string;
  title: string;
  type: string;
  content_id: string;
  topic_id?: string;
  status: string;
  quizTitle?: string;
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

interface TopicWithQuizzes {
  topic: Topic | null; // null = "Không có chủ đề"
  quizzes: QuizMaterial[];
}

interface ClassWithQuizzes {
  cls: ClassItem;
  topicGroups: TopicWithQuizzes[];
  colorIndex: number;
  totalQuizzes: number;
}

const StudentQuizzes = () => {
  const [classesWithQuizzes, setClassesWithQuizzes] = useState<ClassWithQuizzes[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const classesData: ClassItem[] = await apiService.get('/student/class?page=1');
        const results: ClassWithQuizzes[] = [];

        for (let i = 0; i < classesData.length; i++) {
          const cls = classesData[i];
          try {
            // Fetch materials và topics song song
            const [materials, topicsData] = await Promise.all([
              apiService.get(`/class-materials?class_id=${cls._id}`) as Promise<any[]>,
              cls.course_id
                ? apiService.get(`/topics/course/${cls.course_id}?page=1`).then((r: any) => r?.topics || []).catch(() => [])
                : Promise.resolve([])
            ]);

            const quizMaterials = materials.filter(m => m.type === 'quiz');
            if (!quizMaterials.length) continue;

            // Fetch quiz titles
            const quizzesWithTitle: QuizMaterial[] = await Promise.all(
              quizMaterials.map(async (q) => {
                if (!q.content_id) return { ...q };
                try {
                  const quizData: any = await apiService.get(`/quizzes/${q.content_id}`);
                  return { ...q, quizTitle: quizData?.title || q.title };
                } catch { return { ...q }; }
              })
            );

            // Group by topic_id
            const topicMap = new Map<string, Topic>(topicsData.map((t: Topic) => [t._id, t]));
            const grouped = new Map<string | null, QuizMaterial[]>();

            for (const quiz of quizzesWithTitle) {
              const key = quiz.topic_id && topicMap.has(quiz.topic_id) ? quiz.topic_id : null;
              if (!grouped.has(key)) grouped.set(key, []);
              grouped.get(key)!.push(quiz);
            }

            // Build topicGroups — topics first, then ungrouped
            const topicGroups: TopicWithQuizzes[] = [];
            for (const topic of topicsData as Topic[]) {
              if (grouped.has(topic._id)) {
                topicGroups.push({ topic, quizzes: grouped.get(topic._id)! });
              }
            }
            if (grouped.has(null)) {
              topicGroups.push({ topic: null, quizzes: grouped.get(null)! });
            }

            if (topicGroups.length > 0) {
              results.push({ cls, topicGroups, colorIndex: i, totalQuizzes: quizzesWithTitle.length });
            }
          } catch { console.warn(`Failed to fetch for class ${cls._id}`); }
        }
        setClassesWithQuizzes(results);

        // Fetch attempts
        try {
          const myAttempts: any[] = await apiService.get('/my-quiz-attempts');
          setAttempts(myAttempts.map(item => ({ ...item.attempt, score: item.score })));
        } catch { console.warn('Failed to fetch quiz attempts'); }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getAttemptForQuiz = (contentId: string) =>
    attempts.find(a => {
      const qId = typeof a.quiz_id === 'object' ? (a.quiz_id as any)._id : a.quiz_id;
      return qId === contentId;
    });

  const totalQuizzes = classesWithQuizzes.reduce((s, c) => s + c.totalQuizzes, 0);
  const completedQuizzes = classesWithQuizzes.reduce((s, c) =>
    s + c.topicGroups.reduce((ts, tg) => ts + tg.quizzes.filter(q => getAttemptForQuiz(q.content_id)).length, 0), 0);

  return (
    <Box>
      <Typography color="text.secondary" mb={4}>Hoàn thành các bài đánh giá để tích lũy điểm số</Typography>

      {/* Stats */}
      <Stack direction="row" spacing={2} mb={4}>
        {[
          { label: 'TỔNG BÀI', value: totalQuizzes, color: '#6366f1' },
          { label: 'ĐÃ LÀM', value: completedQuizzes, color: '#10b981' },
          { label: 'CHƯA LÀM', value: totalQuizzes - completedQuizzes, color: '#f59e0b' },
        ].map(({ label, value, color }) => (
          <Paper key={label} variant="outlined" sx={{ p: 2.5, flex: 1, textAlign: 'center', borderTop: `4px solid ${color}` }}>
            {loading ? <Skeleton width={40} sx={{ mx: 'auto' }} /> : <Typography variant="h4" fontWeight="800" color={color}>{value}</Typography>}
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Typography>
          </Paper>
        ))}
      </Stack>

      {loading && <Stack spacing={2}>{[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={80} />)}</Stack>}
      {!loading && !classesWithQuizzes.length && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Quiz sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Chưa có bài kiểm tra nào</Typography>
          <Typography color="text.secondary">Các bài kiểm tra sẽ xuất hiện khi giáo viên tạo</Typography>
        </Paper>
      )}

      {/* Grouped by class */}
      <Stack spacing={2}>
        {classesWithQuizzes.map(({ cls, topicGroups, colorIndex, totalQuizzes: total }) => {
          const color = CLASS_COLORS[colorIndex % 6];
          const doneCount = topicGroups.reduce((s, tg) => s + tg.quizzes.filter(q => getAttemptForQuiz(q.content_id)).length, 0);

          return (
            <Accordion key={cls._id} defaultExpanded variant="outlined" sx={{ borderRadius: '8px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 1 }}>
                  <Avatar sx={{ bgcolor: `${color}20`, color, width: 36, height: 36 }}><School fontSize="small" /></Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography fontWeight="bold">{cls.class_name}</Typography>
                    <Typography variant="caption" color="text.secondary">{total} bài kiểm tra</Typography>
                  </Box>
                  <Chip label={`${doneCount}/${total} hoàn thành`} size="small" sx={{ bgcolor: doneCount === total ? '#d1fae5' : `${color}15`, color: doneCount === total ? '#059669' : color, fontWeight: 'bold' }} />
                </Stack>
              </AccordionSummary>

              <AccordionDetails sx={{ pt: 0 }}>
                <Stack spacing={2}>
                  {topicGroups.map((tg, tIdx) => {
                    const topicDone = tg.quizzes.filter(q => getAttemptForQuiz(q.content_id)).length;
                    return (
                      <Box key={tg.topic?._id || 'ungrouped'}>
                        {/* Topic header */}
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5, px: 0.5 }}>
                          <MenuBook sx={{ fontSize: 16, color }} />
                          <Typography variant="subtitle2" fontWeight="bold" color={color}>
                            {tg.topic?.title || 'Chưa phân chủ đề'}
                          </Typography>
                          <Chip label={`${topicDone}/${tg.quizzes.length}`} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: `${color}10`, color }} />
                        </Stack>

                        {/* Quizzes */}
                        <Stack spacing={1} sx={{ pl: 2, borderLeft: `2px solid ${color}20` }}>
                          {tg.quizzes.map(quiz => {
                            const attempt = getAttemptForQuiz(quiz.content_id);
                            const isDone = !!attempt;
                            return (
                              <Paper key={quiz._id} variant="outlined" sx={{ p: 2, borderRadius: 2, transition: '0.2s', '&:hover': { borderColor: color, transform: 'translateX(4px)', boxShadow: `0 4px 12px ${color}15` } }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Box sx={{ p: 1, bgcolor: isDone ? '#d1fae520' : `${color}12`, borderRadius: 1.5, display: 'flex', color: isDone ? '#059669' : color }}>
                                      {isDone ? <CheckCircle sx={{ fontSize: 20 }} /> : <Quiz sx={{ fontSize: 20 }} />}
                                    </Box>
                                    <Box>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography fontWeight="700" variant="body2">{quiz.quizTitle || quiz.title}</Typography>
                                        {isDone && <Chip label="Đã làm" size="small" color="success" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 900 }} />}
                                      </Stack>
                                      {attempt && (
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                          <Timer sx={{ fontSize: 12, color: 'text.disabled' }} />
                                          <Typography variant="caption" color="text.secondary">Lần {attempt.attempt_number} • {new Date(attempt.date).toLocaleDateString('vi-VN')}</Typography>
                                        </Stack>
                                      )}
                                    </Box>
                                  </Stack>
                                  <Button size="small" variant={isDone ? 'outlined' : 'contained'} endIcon={!isDone && <ChevronRight />}
                                    onClick={() => navigate(isDone ? `/student/quiz-result/${quiz._id}` : `/student/take-quiz/${quiz._id}`)}
                                    sx={{ borderRadius: 2, px: 2.5, textTransform: 'none', fontWeight: 700, borderColor: isDone ? color : undefined, color: isDone ? color : undefined, bgcolor: !isDone ? color : undefined, '&:hover': { bgcolor: !isDone ? `${color}dd` : undefined } }}>
                                    {isDone ? 'Xem lại' : 'Làm bài'}
                                  </Button>
                                </Stack>
                              </Paper>
                            );
                          })}
                        </Stack>

                        {tIdx < topicGroups.length - 1 && <Box sx={{ mt: 2, borderBottom: '1px dashed #e2e8f0' }} />}
                      </Box>
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