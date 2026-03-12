import { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Paper, Chip, Grid, Divider, Skeleton, LinearProgress
} from '@mui/material';
import {
  PlayArrow, ErrorOutline, TrendingUp, AssignmentTurnedIn
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import type { ClassItem } from '../../types/studentType';
import { useNavigate } from 'react-router-dom';

const CLASS_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

interface Enrollment {
  _id: string;
  class_id: string | { _id: string; class_name: string }; // ✅ FIX: populated object
  student_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  completed?: boolean;
  date_join: string; // ✅ FIX: was date_enroll
  date_end?: string | null;
}

interface ProgressData {
  completed: number;
  total: number;
  percentage: number;
}

interface QuizAttempt {
  _id: string;
  quiz_id: string;
  score: number;
  total_points: number;
  status: string;
  date_attempt: string;
}

interface DashboardStats {
  total_classes: number;
  total_quizzes: number;
  average_score: number;
  completed_materials: number;
}

// Helper: extract class_id string from populated or plain enrollment
const getEnrollClassId = (enrollment: Enrollment): string => {
  if (typeof enrollment.class_id === 'object' && enrollment.class_id !== null) {
    return (enrollment.class_id as any)._id;
  }
  return enrollment.class_id as string;
};

const StudentDashboard = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, ProgressData>>(new Map());
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch classes
        const classesData: ClassItem[] = await apiService.get('/student/class?page=1');
        setClasses(classesData.slice(0, 4));

        // 2. Fetch enrollments
        const enrollmentsData: Enrollment[] = await apiService.get('/enroll/student');

        // ✅ FIX: Deduplicate - keep latest enrollment per class
        const latestEnrollmentMap = new Map<string, Enrollment>();
        for (const enrollment of enrollmentsData) {
          const classId = getEnrollClassId(enrollment);
          const existing = latestEnrollmentMap.get(classId);
          if (!existing || new Date(enrollment.date_join) > new Date(existing.date_join)) {
            latestEnrollmentMap.set(classId, enrollment);
          }
        }
        const deduplicatedEnrollments = Array.from(latestEnrollmentMap.values());
        setEnrollments(deduplicatedEnrollments);

        // 3. Fetch progress for each enrollment
        const progressMapData = new Map<string, ProgressData>();
        for (const enrollment of deduplicatedEnrollments) {
          try {
            const progressData: any = await apiService.get(`/progress/${enrollment._id}`);
            if (progressData) {
              progressMapData.set(enrollment._id, {
                completed: progressData.completed || 0,
                total: progressData.total || 0,
                percentage: progressData.percentage || 0
              });
            }
          } catch (err) {
            console.warn(`Failed to fetch progress for enrollment ${enrollment._id}`);
          }
        }
        setProgressMap(progressMapData);

        // 4. Fetch quiz attempts
        if (userId) {
          try {
            const attemptsData: QuizAttempt[] = await apiService.get(
              `/users/${userId}/quiz-attempts`
            );
            setQuizAttempts(attemptsData.slice(0, 5));
          } catch (err) {
            console.warn('Failed to fetch quiz attempts');
          }
        }

        // 5. Fetch dashboard stats
        try {
          const statsData: DashboardStats = await apiService.get('/dashboard');
          setDashboardStats(statsData);
        } catch (err) {
          console.warn('Failed to fetch dashboard stats');
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

  const getProgressForClass = (classId: string): ProgressData | undefined => {
    // ✅ FIX: use helper to compare class_id
    const enrollment = enrollments.find(e => getEnrollClassId(e) === classId);
    if (enrollment) {
      return progressMap.get(enrollment._id);
    }
    return undefined;
  };

  const calculateAverageScore = (): string => {
    if (quizAttempts.length === 0) return 'N/A';
    const avg = quizAttempts.reduce((sum, attempt) => {
      const score = (attempt.score / attempt.total_points) * 100;
      return sum + score;
    }, 0) / quizAttempts.length;
    return avg.toFixed(1);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard Học sinh
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Quản lý lớp học và theo dõi lộ trình học tập của bạn
      </Typography>

      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container direction="column" spacing={3}>
              {/* Recent Classes */}
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Lớp học gần đây</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Các lớp bạn đang tham gia
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

                  <Box
                    sx={{
                      display: 'grid',
                      gridAutoFlow: 'column',
                      gridAutoColumns: 'minmax(280px, 300px)',
                      gap: 2,
                      overflowX: 'auto',
                      width: '100%',
                      pb: 1,
                    }}
                  >
                    {!loading && classes.map((cls, index) => {
                      const color = CLASS_COLORS[index % CLASS_COLORS.length];
                      const progress = getProgressForClass(cls._id);

                      return (
                        <Paper
                          key={cls._id}
                          variant="outlined"
                          sx={{
                            p: 2,
                            cursor: 'pointer',
                            transition: '0.2s',
                            '&:hover': {
                              borderColor: color,
                              bgcolor: 'rgba(0,0,0,0.01)',
                              transform: 'translateY(-2px)'
                            }
                          }}
                          onClick={() => navigate(`/student/class/${cls._id}`)}
                        >
                          <Stack spacing={1.5}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Chip
                                label={cls.status === 'active' ? 'Đang học' : cls.status}
                                size="small"
                                sx={{ bgcolor: `${color}15`, color: color, fontWeight: 'bold' }}
                              />
                              <PlayArrow sx={{ color: '#cbd5e1' }} />
                            </Box>
                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                              {cls.class_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ height: 20 }}>
                              {cls.keywords || 'Chưa có mô tả'}
                            </Typography>

                            {/* Progress Bar */}
                            {progress && (
                              <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Tiến độ
                                  </Typography>
                                  <Typography variant="caption" fontWeight="bold">
                                    {progress.completed}/{progress.total}
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={progress.percentage}
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: `${color}20`,
                                    '& .MuiLinearProgress-bar': { bgcolor: color }
                                  }}
                                />
                              </Box>
                            )}

                            <Divider />
                            <Typography variant="caption" color="text.secondary">
                              Tạo ngày: <b>{formatDate(cls.date_create)}</b>
                            </Typography>
                          </Stack>
                        </Paper>
                      );
                    })}

                    {!loading && classes.length === 0 && !error && (
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center', gridColumn: '1/-1' }}>
                        Bạn chưa tham gia lớp học nào.
                      </Typography>
                    )}

                    {loading && [1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} variant="rounded" width={300} height={200} />
                    ))}
                  </Box>
                </Paper>
              </Grid>

              {/* Recent Quiz Attempts */}
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
                      {quizAttempts.map((attempt) => {
                        const percentage = (attempt.score / attempt.total_points) * 100;
                        let scoreColor = '#ef4444';
                        if (percentage >= 70) scoreColor = '#10b981';
                        else if (percentage >= 50) scoreColor = '#f59e0b';

                        return (
                          <Paper
                            key={attempt._id}
                            variant="outlined"
                            sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                Quiz {attempt._id.substring(0, 8)}...
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(attempt.date_attempt)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body2" fontWeight="bold" sx={{ color: scoreColor }}>
                                {attempt.score}/{attempt.total_points}
                              </Typography>
                              <Chip
                                label={`${percentage.toFixed(0)}%`}
                                size="small"
                                sx={{
                                  bgcolor: `${scoreColor}15`,
                                  color: scoreColor,
                                  fontWeight: 'bold',
                                  minWidth: 60,
                                }}
                              />
                            </Box>
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

          <Grid size={{ xs: 12, md: 4 }}>
            <Grid container direction="column" spacing={3}>
              {/* Learning Status */}
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
                        <Typography variant="body2" fontWeight="bold">
                          {dashboardStats?.total_classes || classes.length}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Tổng quiz:</Typography>
                      {loading ? <Skeleton width={40} /> : (
                        <Typography variant="body2" fontWeight="bold">
                          {dashboardStats?.total_quizzes || quizAttempts.length}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Điểm trung bình:</Typography>
                      {loading ? <Skeleton width={40} /> : (
                        <Typography variant="body2" fontWeight="bold" sx={{ color: '#10b981' }}>
                          {dashboardStats?.average_score?.toFixed(1) || calculateAverageScore()}%
                        </Typography>
                      )}
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentTurnedIn fontSize="small" />
                        Bài tập hoàn thành:
                      </Typography>
                      {loading ? <Skeleton width={40} /> : (
                        <Typography variant="body2" fontWeight="bold">
                          {dashboardStats?.completed_materials || 0}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              {/* Enrollment Stats */}
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