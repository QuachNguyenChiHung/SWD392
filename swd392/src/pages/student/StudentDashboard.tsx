import { useEffect, useState } from 'react';
import { Box, Typography, Stack, Paper, Button, Chip, Skeleton } from '@mui/material';
import {
  Class, Quiz, TrendingUp, EmojiEvents,
  PlayArrow, Schedule, BookmarkBorder, Person, ErrorOutline
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import type { ClassItem } from '../../types/studentType';

const CLASS_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'done'>('all');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      setError(null);
      try {
        const data: ClassItem[] = await apiService.get(`/student/class?page=${page}`);
        setClasses(prev => page === 1 ? data : [...prev, ...data]);
        setHasMore(data.length === 12);
      } catch (error: any) {
        console.error('Lỗi khi lấy lớp học:', error);
        setError(error.message || 'Không thể tải danh sách lớp học');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [page]);

  const filtered = activeTab === 'all'
    ? classes
    : activeTab === 'active'
      ? classes.filter(c => c.status === 'active')
      : classes.filter(c => c.status !== 'active');

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const stats = [
    { label: 'Lớp đang học', value: classes.length, icon: <Class />, color: '#6366f1', bg: '#eef2ff' },
    { label: 'Lớp active', value: classes.filter(c => c.status === 'active').length, icon: <Quiz />, color: '#0ea5e9', bg: '#e0f2fe' },
    { label: 'Điểm trung bình', value: 'N/A', icon: <TrendingUp />, color: '#10b981', bg: '#d1fae5' },
    { label: 'Thành tựu', value: 'N/A', icon: <EmojiEvents />, color: '#f59e0b', bg: '#fef3c7' },
  ];

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      fontFamily: '"Nunito", sans-serif',
      p: { xs: 2, md: 4 },
    }}>

      {/* Stats */}
      <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        {stats.map((stat, i) => (
          <Box key={i} sx={{ flex: '1 1 160px', minWidth: 140 }}>
            <Paper elevation={0} sx={{
              p: 2.5, borderRadius: 3,
              border: '1px solid #e2e8f0', background: 'white',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
            }}>
              <Box sx={{
                width: 44, height: 44, borderRadius: 2,
                background: stat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mb: 1.5,
                '& svg': { color: stat.color, fontSize: 22 }
              }}>
                {stat.icon}
              </Box>
              <Typography sx={{ fontFamily: '"Space Grotesk"', fontWeight: 700, fontSize: 26, color: '#0f172a', lineHeight: 1 }}>
                {loading && classes.length === 0 ? '...' : stat.value}
              </Typography>
              <Typography sx={{ color: '#94a3b8', fontSize: 12, mt: 0.5, fontWeight: 600 }}>
                {stat.label}
              </Typography>
            </Paper>
          </Box>
        ))}
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        {/* Enrolled Classes */}
        <Box sx={{ flex: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography sx={{ fontFamily: '"Space Grotesk"', fontWeight: 700, fontSize: 18, color: '#0f172a' }}>
              Lớp học của tôi
            </Typography>
            <Stack direction="row" spacing={1}>
              {(['all', 'active', 'done'] as const).map(tab => (
                <Chip
                  key={tab}
                  label={tab === 'all' ? 'Tất cả' : tab === 'active' ? 'Đang học' : 'Khác'}
                  size="small"
                  onClick={() => setActiveTab(tab)}
                  sx={{
                    fontWeight: 600, fontSize: 12,
                    background: activeTab === tab ? '#6366f1' : 'white',
                    color: activeTab === tab ? 'white' : '#64748b',
                    border: '1px solid',
                    borderColor: activeTab === tab ? '#6366f1' : '#e2e8f0',
                    cursor: 'pointer',
                    '&:hover': { background: activeTab === tab ? '#4f46e5' : '#f8fafc' }
                  }}
                />
              ))}
            </Stack>
          </Stack>

          {/* Error */}
          {error && (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #fecaca', background: '#fff5f5', mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ErrorOutline sx={{ color: '#ef4444' }} />
                <Typography sx={{ color: '#ef4444', fontWeight: 600 }}>{error}</Typography>
              </Stack>
            </Paper>
          )}

          {/* Skeleton */}
          {loading && classes.length === 0 && (
            <Stack spacing={2}>
              {[1, 2, 3].map(i => (
                <Paper key={i} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="rounded" width={48} height={48} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width="60%" height={20} />
                      <Skeleton width="40%" height={16} sx={{ mt: 0.5 }} />
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}

          {/* Class cards */}
          <Stack spacing={2}>
            {filtered.map((cls, index) => {
              const color = CLASS_COLORS[index % CLASS_COLORS.length];
              return (
                <Paper key={cls._id} elevation={0} sx={{
                  p: 3, borderRadius: 3,
                  border: '1px solid #e2e8f0', background: 'white',
                  transition: 'all 0.2s',
                  '&:hover': { transform: 'translateX(4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', borderColor: color },
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{
                        width: 48, height: 48, borderRadius: 2.5,
                        overflow: 'hidden',
                        background: `${color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${color}30`,
                        flexShrink: 0,
                      }}>
                        {cls.img_cover_link ? (
                          <img
                            src={cls.img_cover_link}
                            alt={cls.class_name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <Class sx={{ color, fontSize: 22 }} />
                        )}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                          {cls.class_name}
                        </Typography>
                        {cls.keywords && (
                          <Typography sx={{ color: '#94a3b8', fontSize: 12 }}>
                            {cls.keywords}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                    <Chip
                      label={cls.status === 'active' ? 'Đang học' : cls.status}
                      size="small"
                      sx={{
                        background: cls.status === 'active' ? '#d1fae5' : '#f1f5f9',
                        color: cls.status === 'active' ? '#065f46' : '#64748b',
                        fontWeight: 700, fontSize: 11, flexShrink: 0, ml: 1,
                      }}
                    />
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Schedule sx={{ fontSize: 14, color: '#94a3b8' }} />
                      <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                        Tham gia: <strong style={{ color: '#475569' }}>{formatDate(cls.date_create)}</strong>
                      </Typography>
                    </Stack>
                    <Button size="small" variant="contained" startIcon={<PlayArrow />} sx={{
                      background: color,
                      borderRadius: 2, textTransform: 'none', fontWeight: 700,
                      fontSize: 12, px: 2, py: 0.5, boxShadow: 'none',
                      '&:hover': { background: color, filter: 'brightness(0.9)', boxShadow: 'none' }
                    }}>
                      Vào lớp
                    </Button>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>

          {/* Empty state */}
          {!loading && classes.length === 0 && !error && (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <Class sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
              <Typography sx={{ fontWeight: 600, color: '#64748b' }}>Bạn chưa tham gia lớp học nào</Typography>
              <Typography sx={{ color: '#94a3b8', fontSize: 13, mt: 0.5 }}>Nhấn "Tham gia lớp học" để bắt đầu</Typography>
            </Paper>
          )}

          {/* Load more */}
          {hasMore && !loading && classes.length > 0 && (
            <Button fullWidth variant="outlined" onClick={() => setPage(p => p + 1)} sx={{
              mt: 2, borderRadius: 2.5, textTransform: 'none', fontWeight: 700,
              borderColor: '#e2e8f0', color: '#475569',
              '&:hover': { borderColor: '#6366f1', color: '#6366f1', background: '#eef2ff' }
            }}>
              Xem thêm
            </Button>
          )}

          {!hasMore && classes.length > 0 && (
            <Typography sx={{ textAlign: 'center', color: '#94a3b8', fontSize: 13, mt: 2 }}>
              Đã hiển thị tất cả lớp học
            </Typography>
          )}
        </Box>

        {/* Sidebar */}
        <Box sx={{ flex: 1, minWidth: 260 }}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', background: 'white' }}>
            <Typography sx={{ fontFamily: '"Space Grotesk"', fontWeight: 700, fontSize: 16, color: '#0f172a', mb: 2 }}>
              Hành động nhanh
            </Typography>
            <Stack spacing={1.5}>
              <Button fullWidth variant="contained" startIcon={<Class />} sx={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: 2.5, textTransform: 'none', fontWeight: 700,
                boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                '&:hover': { boxShadow: '0 6px 20px rgba(99,102,241,0.5)' }
              }}>
                Tham gia lớp học
              </Button>
              <Button fullWidth variant="outlined" startIcon={<BookmarkBorder />} sx={{
                borderRadius: 2.5, textTransform: 'none', fontWeight: 700,
                borderColor: '#e2e8f0', color: '#475569',
                '&:hover': { borderColor: '#6366f1', color: '#6366f1', background: '#eef2ff' }
              }}>
                Bài tập của tôi
              </Button>
              <Button fullWidth variant="outlined" startIcon={<Person />} sx={{
                borderRadius: 2.5, textTransform: 'none', fontWeight: 700,
                borderColor: '#e2e8f0', color: '#475569',
                '&:hover': { borderColor: '#6366f1', color: '#6366f1', background: '#eef2ff' }
              }}>
                Trợ lý AI
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default StudentDashboard;