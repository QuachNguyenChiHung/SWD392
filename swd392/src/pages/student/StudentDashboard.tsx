import { useEffect, useState } from 'react';
import {
  Box, Typography, Stack, Paper, Button, Chip, Grid, Divider
} from '@mui/material';
import {
  Class, PlayArrow, BookmarkBorder, Person, ErrorOutline
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import type { ClassItem } from '../../types/studentType';
import { useNavigate } from 'react-router-dom';

const CLASS_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const StudentDashboard = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      setError(null);
      try {
        const data: ClassItem[] = await apiService.get('/student/class?page=1');
        setClasses(data.slice(0, 4));
      } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách lớp học');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

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
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
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
                      display: "grid",
                      gridAutoFlow: "column",
                      gridAutoColumns: "minmax(280px, 300px)",
                      gap: 2,
                      overflowX: "auto",
                      width: "100%",
                      pb: 1,
                    }}
                  >
                    {!loading && classes.map((cls, index) => {
                      const color = CLASS_COLORS[index % CLASS_COLORS.length];
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
                                label={cls.status === 'active' ? "Đang học" : cls.status}
                                size="small"
                                sx={{ bgcolor: `${color}15`, color: color, fontWeight: 'bold' }}
                              />
                              <PlayArrow sx={{ color: '#cbd5e1' }} />
                            </Box>
                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                              {cls.class_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ height: 20 }}>
                              {cls.keywords || "Chưa có mô tả"}
                            </Typography>
                            <Divider />
                            <Typography variant="caption" color="text.secondary">
                              Tham gia: <b>{formatDate(cls.date_create)}</b>
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
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Grid container direction="column" spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Hành động nhanh</Typography>
                    <Typography variant="caption" color="text.secondary">
                      3 mục
                    </Typography>
                  </Stack>

                  <Stack spacing={2}>
                    {[
                      { title: 'Tìm lớp học', desc: 'Khám phá kiến thức mới', icon: <Class />, label: 'Khám phá', path: '/student/classes' },
                      { title: 'Bài tập', desc: 'Xem lại kết quả học tập', icon: <BookmarkBorder />, label: 'Mở bài', path: '/student/assignments' },
                      { title: 'Trợ lý AI', desc: 'Giải đáp thắc mắc 24/7', icon: <Person />, label: 'Chat AI', path: '#' }
                    ].map((action) => (
                      <Paper
                        key={action.title}
                        variant="outlined"
                        sx={{
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {action.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {action.desc}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => action.path !== '#' && navigate(action.path)}
                        >
                          {action.label}
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Trạng thái học tập
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Tổng số lớp:</Typography>
                      <Typography variant="body2" fontWeight="bold">{classes.length}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">Điểm trung bình:</Typography>
                      <Typography variant="body2" fontWeight="bold">N/A</Typography>
                    </Box>
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