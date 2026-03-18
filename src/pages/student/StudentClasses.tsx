import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Stack, Paper, Chip, Grid, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Skeleton, Alert, CircularProgress, InputAdornment
} from '@mui/material';
import { Add, PlayArrow, Schedule, ErrorOutline, CheckCircle, Lock } from '@mui/icons-material';
import { apiService } from '../../services/api';
import type { ClassItem, Enrollment } from '../../types/studentType';

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

interface EnhancedClassItem extends ClassItem {
  enrollment?: Enrollment;
}

const StudentClasses = () => {
  const [classes, setClasses] = useState<EnhancedClassItem[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [keypass, setKeypass] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const classesData: ClassItem[] = await apiService.get('/student/class?page=1');
      const enrollmentsData: Enrollment[] = await apiService.get('/enroll/student');

      setEnrollments(enrollmentsData);

      const enhancedClasses = classesData.map(cls => {
        // Lấy tất cả enrollments của class này
        const classEnrollments = enrollmentsData.filter(e => {
          const enrollClassId = typeof e.class_id === 'object'
            ? (e.class_id as any)._id
            : e.class_id;
          return enrollClassId === cls._id;
        });

        // Lấy enrollment mới nhất theo date_join
        const enrollment = classEnrollments.sort((a, b) =>
          new Date(b.date_join).getTime() - new Date(a.date_join).getTime()
        )[0];

        return { ...cls, enrollment };
      });
      setClasses(enhancedClasses);
      return true;
    } catch (err: any) {
      console.error('Error fetching classes:', err);
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    loadData();
  }, []);

  const handleJoinClass = async () => {
    if (!keypass.trim()) {
      setJoinError('Vui lòng nhập mã keypass');
      return;
    }

    setJoining(true);
    setJoinError(null);
    setJoinSuccess(false);

    try {
      const enrollResponse = await apiService.post('/enroll/keypass', {
        keypass: keypass.trim()
      });

      if (enrollResponse) {
        setJoinSuccess(true);
        setKeypass('');

        setTimeout(async () => {
          const success = await fetchData();
          if (success) {
            setTimeout(() => {
              setOpen(false);
              setJoinSuccess(false);
            }, 500);
          }
        }, 1500);
      }
    } catch (err: any) {
      console.error('Join error:', err);
      setJoinError(err.message || 'Mã keypass không hợp lệ hoặc lớp không tồn tại');
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  const getClassStatus = (cls: EnhancedClassItem) => {
    if (!cls.enrollment) {
      return { label: 'Chưa tham gia', color: '#6b7280', bg: '#f3f4f6' };
    }
    switch (cls.enrollment.status) {
      case 'completed':
        return { label: 'Hoàn thành', color: '#059669', bg: '#d1fae5' };
      case 'in_progress':
        return { label: 'Đang học', color: '#065f46', bg: '#d1fae5' };
      case 'pending':
        return { label: 'Chờ duyệt', color: '#b45309', bg: '#fef3c7' };
      default:
        return { label: 'Đang học', color: '#065f46', bg: '#d1fae5' };
    }
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Lớp học của tôi
          </Typography>
          <Typography color="text.secondary">
            Bạn đang tham gia {classes.length} lớp học
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setOpen(true);
              setJoinError(null);
              setJoinSuccess(false);
              setKeypass('');
            }}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            Tham gia lớp
          </Button>
        </Stack>
      </Stack>

      {/* Classes Grid */}
      <Grid container spacing={3}>
        {loading
          ? [1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
            </Grid>
          ))
          : classes.length > 0
            ? classes.map((cls, index) => {
              const color = COLORS[index % 6];
              const status = getClassStatus(cls);

              return (
                <Grid key={cls._id} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      transition: '0.3s',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        borderColor: color,
                        boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                      }
                    }}
                  >
                    {/* Cover Image */}
                    <Box
                      sx={{
                        height: 120,
                        bgcolor: `${color}15`,
                        borderRadius: 1,
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      {cls.img_cover_link ? (
                        <img
                          title={cls.class_name}
                          src={cls.img_cover_link}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ) : (
                        <PlayArrow sx={{ fontSize: 50, color: color }} />
                      )}
                    </Box>

                    {/* Status Chip */}
                    <Chip
                      label={status.label}
                      size="small"
                      sx={{
                        mb: 1,
                        bgcolor: status.bg,
                        color: status.color,
                        fontWeight: 'bold'
                      }}
                    />

                    {/* Class Name */}
                    <Typography variant="h6" fontWeight="bold" noWrap sx={{ mb: 1 }}>
                      {cls.class_name}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {cls.keywords || 'Chưa có mô tả'}
                    </Typography>

                    {/* Date */}
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mt: 'auto', mb: 2, color: 'text.secondary' }}
                    >
                      <Schedule sx={{ fontSize: 16 }} />
                      <Typography variant="caption">
                        {formatDate(cls.date_create)}
                      </Typography>
                    </Stack>

                    {/* Enrollment date */}
                    {cls.enrollment && (
                      <Typography variant="caption" color="success.main" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CheckCircle sx={{ fontSize: 14 }} />
                        Ghi danh: {formatDate(cls.enrollment.date_join)}
                      </Typography>
                    )}

                    {/* Action Button */}
                    <Button
                      fullWidth
                      variant={cls.enrollment ? 'outlined' : 'contained'}
                      onClick={() => navigate(`/student/class/${cls._id}`)}
                      sx={{
                        borderColor: color,
                        color: cls.enrollment ? color : 'white',
                        bgcolor: cls.enrollment ? 'transparent' : color,
                        '&:hover': {
                          bgcolor: cls.enrollment ? `${color}05` : undefined,
                          borderColor: color
                        }
                      }}
                    >
                      {cls.enrollment ? 'Tiếp tục học' : 'Xem chi tiết'}
                    </Button>
                  </Paper>
                </Grid>
              );
            })
            : (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Lock sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Chưa tham gia lớp học nào
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    Hãy nhập mã keypass để tham gia một lớp học
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpen(true)}
                  >
                    Tham gia lớp
                  </Button>
                </Paper>
              </Grid>
            )}
      </Grid>

      {/* Join Class Dialog */}
      <Dialog
        open={open}
        onClose={() => !joining && setOpen(false)}
        maxWidth="xs"
        fullWidth 
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.3rem' }}>
          Tham gia lớp mới
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            {joinSuccess && (
              <Alert severity="success" icon={<CheckCircle />}>
                Tham gia lớp học thành công! Đang cập nhật dữ liệu...
              </Alert>
            )}

            {joinError && (
              <Alert severity="error" icon={<ErrorOutline />}>
                {joinError}
              </Alert>
            )}

            {!joinSuccess && (
              <TextField
                fullWidth
                label="Mã keypass"
                placeholder="Nhập mã keypass của lớp học"
                size="small"
                value={keypass}
                onChange={(e) => setKeypass(e.target.value)}
                disabled={joining}
                InputProps={{
                  endAdornment: joining && (
                    <InputAdornment position="end">
                      <CircularProgress size={20} />
                    </InputAdornment>
                  )
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !joining) {
                    handleJoinClass();
                  }
                }}
              />
            )}

            <Typography variant="caption" color="text.secondary">
              Mã keypass được cung cấp bởi giáo viên. Kiểm tra lại nếu bạn không chắc chắn.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            onClick={() => setOpen(false)}
            disabled={joining}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleJoinClass}
            disabled={!keypass.trim() || joining || joinSuccess}
          >
            {joining ? 'Đang xử lý...' : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentClasses;