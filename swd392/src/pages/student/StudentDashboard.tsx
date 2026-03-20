import { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Paper, Chip, Grid, Divider, Skeleton, Pagination
} from '@mui/material';
import {
  PlayArrow, ErrorOutline, TrendingUp, AssignmentTurnedIn
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import type { ClassItem } from '../../types/studentType';
import { useNavigate } from 'react-router-dom';

const CLASS_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
const CLASSES_PER_PAGE = 4;

interface Enrollment {
  _id: string;
  class_id: string | { _id: string; class_name: string };
  student_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  completed?: boolean;
  date_join: string;
  date_end?: string | null;
}

interface QuizAttempt {
  _id: string;
  quiz_id: string | { _id: string; title: string; type: string };
  user_id: string;
  attempt_number: number;
  date: string;
  quizTitle?: string;
  record_json: {
    score?: number;
    time_taken?: number;
    answers?: number[];
  };
  score?: {
    total: number;
    correct: number;
    score: number;
    percentage: number;
  };
}

interface DashboardStats {
  total_classes: number;
  total_quizzes: number;
  average_score: number;
  completed_materials: number;
}

const getEnrollClassId = (enrollment: Enrollment): string => {
  if (typeof enrollment.class_id === 'object' && enrollment.class_id !== null) {
    return (enrollment.class_id as any)._id;
  }
  return enrollment.class_id as string;
};

const StudentDashboard = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classPage, setClassPage] = useState(1);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const userId = userStr ? JSON.parse(userStr).id : '';

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const classesData: ClassItem[] = await apiService.get('/student/class?page=1');
        setClasses(classesData);

        const enrollmentsData: Enrollment[] = await apiService.get('/enroll/student');
        const latestEnrollmentMap = new Map<string, Enrollment>();
        for (const enrollment of enrollmentsData) {
          const classId = getEnrollClassId(enrollment);
          const existing = latestEnrollmentMap.get(classId);
          if (!existing || new Date(enrollment.date_join) > new Date(existing.date_join)) {
            latestEnrollmentMap.set(classId, enrollment);
          }
        }
        setEnrollments(Array.from(latestEnrollmentMap.values()));

        try {
          const myAttempts: any[] = await apiService.get('/my-quiz-attempts');
          const mapped: QuizAttempt[] = myAttempts.map((item) => ({
            ...item.attempt,
            score: item.score,
            quizTitle: typeof item.attempt?.quiz_id === 'object'
              ? item.attempt.quiz_id.title
              : 'Quiz'
          }));
          setQuizAttempts(mapped);
        } catch (err) {
          console.warn('Failed to fetch quiz attempts');
        }

      } catch (err: any) {
        setError(err.message || 'Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userId]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const getEnrollmentForClass = (classId: string): Enrollment | undefined =>
    enrollments.find(e => getEnrollClassId(e) === classId);

  const calculateAverageScore = (): string => {
    const withScore = quizAttempts.filter(a => a.score?.score != null);
    if (withScore.length === 0) return 'N/A';
    const avg = Math.round(
      withScore.reduce((sum, a) => sum + (a.score?.score || 0), 0) / withScore.length
    );
    return avg + ' điểm';
  };

  const totalPages = Math.ceil(classes.length / CLASSES_PER_PAGE);
  const paginatedClasses = classes.slice(
    (classPage - 1) * CLASSES_PER_PAGE,
    classPage * CLASSES_PER_PAGE
  );

  return (
    <Box>
      <Typography variant="body1" color="text.secondary" paragraph>
        Quản lý lớp học và theo dõi lộ trình học tập của bạn
      </Typography>

      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container direction="column" spacing={3}>

              {/* Classes */}
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Lớp học của tôi</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {classes.length} lớp đang tham gia
                    </Typography>
                  </Stack>

                  {error && (
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #fecaca', background: '#fff5f5', mb: 2 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ErrorOutline sx={{ color: '#ef4444', fontSize: 20 }} />
                        <Typography sx={{ color: '#ef4444', fontWeight: 600, fontSize: 14 }}>{error}</Typography>
                      </Stack>
                    </Paper>
                  )}

                  <Grid container spacing={2}>
                    {loading
                      ? [1, 2, 3, 4].map((i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6 }}>
                          <Skeleton variant="rounded" height={180} />
                        </Grid>
                      ))
                      : paginatedClasses.map((cls, index) => {
                        const globalIndex = (classPage - 1) * CLASSES_PER_PAGE + index;
                        const color = CLASS_COLORS[globalIndex % CLASS_COLORS.length];
                        const enrollment = getEnrollmentForClass(cls._id);
                        const isCompleted = enrollment?.status === 'completed';

                        return (
                          <Grid key={cls._id} size={{ xs: 12, sm: 6 }}>
                            <Paper
                              variant="outlined"
                              sx={{
                                p: 2,
                                cursor: 'pointer',
                                transition: '0.2s',
                                height: '100%',
                                '&:hover': {
                                  borderColor: color,
                                  bgcolor: 'rgba(0,0,0,0.01)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                }
                              }}
                              onClick={() => navigate(`/student/class/${cls._id}`)}
                            >
                              <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Chip
                                    label={isCompleted ? 'Hoàn thành' : 'Đang học'}
                                    size="small"
                                    sx={{
                                      bgcolor: isCompleted ? '#d1fae5' : `${color}15`,
                                      color: isCompleted ? '#059669' : color,
                                      fontWeight: 'bold'
                                    }}
                                  />
                                  <PlayArrow sx={{ color: '#cbd5e1' }} />
                                </Box>
                                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                  {cls.class_name}
                                </Typography>
                                <Divider />
                                <Typography variant="caption" color="text.secondary">
                                  Tạo ngày: <b>{formatDate(cls.date_create)}</b>
                                </Typography>
                              </Stack>
                            </Paper>
                          </Grid>
                        );
                      })
                    }

                    {!loading && classes.length === 0 && !error && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                          Bạn chưa tham gia lớp học nào.
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  {!loading && totalPages > 1 && (
                    <Stack alignItems="center" mt={3}>
                      <Pagination
                        count={totalPages}
                        page={classPage}
                        onChange={(_, page) => setClassPage(page)}
                        color="primary"
                        size="small"
                      />
                    </Stack>
                  )}
                </Paper>
              </Grid>

              {/* Quiz Attempts */}
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Bài kiểm tra gần đây</Typography>
                    <Typography variant="body2" color="text.secondary">
                      5 kết quả mới nhất
                    </Typography>
                  </Stack>

                  {loading ? (
                    <Stack spacing={1}>
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} variant="rounded" height={60} />
                      ))}
                    </Stack>
                  ) : quizAttempts.length > 0 ? (
                    <Stack spacing={1.5}>
                      {quizAttempts.slice(0, 5).map((attempt) => {
                        const score = attempt.score?.score;
                        const hasScore = score != null;
                        const scoreColor = !hasScore ? '#94a3b8'
                          : score >= 70 ? '#059669'
                          : score >= 50 ? '#b45309'
                          : '#dc2626';
                        const scoreBg = !hasScore ? '#f1f5f9'
                          : score >= 70 ? '#d1fae5'
                          : score >= 50 ? '#fef3c7'
                          : '#fee2e2';

                        return (
                          <Paper
                            key={attempt._id}
                            variant="outlined"
                            sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {attempt.quizTitle || 'Quiz'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Lần {attempt.attempt_number} • {formatDate(attempt.date)}
                              </Typography>
                            </Box>
                            <Chip
                              label={hasScore ? `${score} điểm` : 'Chưa có điểm'}
                              size="small"
                              sx={{ bgcolor: scoreBg, color: scoreColor, fontWeight: 'bold' }}
                            />
                          </Paper>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                      Chưa có bài kiểm tra nào
                    </Typography>
                  )}
                </Paper>
              </Grid>

            </Grid>
          </Grid>

          {/* Right column */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Grid container direction="column" spacing={3}>

              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUp fontSize="small" />
                    Trạng thái học tập
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Tổng số lớp:</Typography>
                      {loading ? <Skeleton width={40} /> : (
                        <Typography variant="body2" fontWeight="bold">{classes.length}</Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Tổng quiz đã làm:</Typography>
                      {loading ? <Skeleton width={40} /> : (
                        <Typography variant="body2" fontWeight="bold">{quizAttempts.length}</Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Điểm trung bình:</Typography>
                      {loading ? <Skeleton width={40} /> : (
                        <Typography variant="body2" fontWeight="bold" sx={{ color: '#10b981' }}>
                          {calculateAverageScore()}
                        </Typography>
                      )}
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentTurnedIn fontSize="small" />
                        Lớp hoàn thành:
                      </Typography>
                      {loading ? <Skeleton width={40} /> : (
                        <Typography variant="body2" fontWeight="bold">
                          {enrollments.filter(e => e.status === 'completed').length}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3, bgcolor: '#f0f9ff', border: '1px solid #bfdbfe' }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Thông tin ghi danh
                  </Typography>
                  <Stack spacing={1.5}>
                    {loading ? (
                      <>
                        <Skeleton variant="rounded" height={40} />
                        <Skeleton variant="rounded" height={40} />
                      </>
                    ) : enrollments.length > 0 ? (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Tổng ghi danh:</Typography>
                          <Typography variant="body2" fontWeight="bold">{enrollments.length}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Đang học:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {enrollments.filter(e => e.status === 'in_progress').length}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">Đã hoàn thành:</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {enrollments.filter(e => e.status === 'completed').length}
                          </Typography>
                        </Box>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Chưa ghi danh lớp nào</Typography>
                    )}
                  </Stack>
                </Paper>
              </Grid>

            </Grid>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default StudentDashboard;