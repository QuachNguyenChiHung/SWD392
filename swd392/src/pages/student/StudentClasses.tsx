import {
  Box, Typography, Button, Stack, Card,
  CardContent, CardActions, Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions
} from '@mui/material';
import { Add, ErrorOutline, PlayArrow, Schedule } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import type { ClassItem } from '../../types/studentType';
import { useNavigate } from 'react-router-dom';

const CLASS_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const StudentClasses = () => {

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Join class modal states
  const [openModal, setOpenModal] = useState(false);
  const [classId, setClassId] = useState('');
  const [keypass, setKeypass] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const data: ClassItem[] = await apiService.get(`/student/class?page=${page}`);
        setClasses(prev => page === 1 ? data : [...prev, ...data]);
      } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách lớp học');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, [page]);

  const handleJoinClass = async () => {
    if (!classId.trim() || !keypass.trim()) {
      setJoinError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setJoining(true);
    setJoinError(null);

    try {
      await apiService.post(`/enroll/${classId.trim()}`, { keypass: keypass.trim() });
      setJoinSuccess(true);

      setPage(1);
      const data: ClassItem[] = await apiService.get('/student/class?page=1');
      setClasses(data);
      setTimeout(() => {
        setOpenModal(false);
        setClassId('');
        setKeypass('');
        setJoinSuccess(false);
      }, 1500);
    } catch (err: any) {
      setJoinError(err.message || 'Tham gia lớp học thất bại');
    }
    setJoining(false);
  }

  const handleCloseModal = () => {
    setOpenModal(false);
    setClassId('');
    setKeypass('');
    setJoinError(null);
    setJoinSuccess(false);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: { xs: 20, md: 26 }, color: '#0f172a' }}>
            Lớp học của tôi
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: 14, mt: 0.3 }}>
            {loading ? '...' : `${classes.length} lớp đã tham gia`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenModal(true)}
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 2.5, textTransform: 'none', fontWeight: 700,
            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
            '&:hover': { boxShadow: '0 6px 20px rgba(99,102,241,0.5)' }
          }}
        >
          Tham gia lớp học
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} icon={<ErrorOutline />}>
          {error}
        </Alert>
      )}

      {/* Class cards */}
      <Stack direction="row" flexWrap="wrap" gap={3}>
        {classes.map((cls, index) => {
          const color = CLASS_COLORS[index % CLASS_COLORS.length];
          return (
            <Box key={cls._id} sx={{ flex: '1 1 300px', minWidth: 280, maxWidth: 380 }}>
              <Card elevation={0} sx={{
                border: '1px solid #e2e8f0', borderRadius: 3,
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 28px rgba(0,0,0,0.1)', borderColor: color }
              }}>
                {/* Cover image */}
                <Box sx={{
                  height: 140, background: `linear-gradient(135deg, ${color}22, ${color}44)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                  borderRadius: '12px 12px 0 0',
                }}>
                  <img
                    src={cls.img_cover_link}
                    alt={cls.class_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <Chip
                    label={cls.status === 'active' ? 'Đang học' : cls.status}
                    size="small"
                    sx={{
                      position: 'absolute', top: 10, right: 10,
                      background: cls.status === 'active' ? '#d1fae5' : '#f1f5f9',
                      color: cls.status === 'active' ? '#065f46' : '#64748b',
                      fontWeight: 700, fontSize: 11,
                    }}
                  />
                </Box>

                <CardContent sx={{ pb: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#0f172a', mb: 0.5 }}>
                    {cls.class_name}
                  </Typography>

                  {cls.keywords && (
                    <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 1.5 }}>
                      {cls.keywords.split(',').slice(0, 3).map((kw, i) => (
                        <Chip key={i} label={kw.trim()} size="small" sx={{
                          background: `${color}15`, color, fontWeight: 600, fontSize: 11,
                        }} />
                      ))}
                    </Stack>
                  )}

                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Schedule sx={{ fontSize: 13, color: '#94a3b8' }} />
                    <Typography sx={{ fontSize: 12, color: '#94a3b8' }}>
                      Tham gia: {formatDate(cls.date_create)}
                    </Typography>
                  </Stack>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    onClick={() => navigate(`/student/class/${cls._id}`)}
                    fullWidth variant="contained" size="small"
                    startIcon={<PlayArrow />}
                    sx={{
                      background: color, borderRadius: 2,
                      textTransform: 'none', fontWeight: 700,
                      boxShadow: 'none',
                      '&:hover': { background: color, filter: 'brightness(0.9)', boxShadow: 'none' }
                    }}
                  >
                    Vào lớp
                  </Button>
                </CardActions>
              </Card>
            </Box>
          );
        })}
      </Stack>

      {/* Empty state */}
      {!loading && classes.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 18, color: '#475569' }}>
            Bạn chưa tham gia lớp học nào
          </Typography>
          <Typography sx={{ color: '#94a3b8', mt: 1, mb: 3 }}>
            Nhấn nút bên dưới và nhập keypass để tham gia lớp học
          </Typography>
          <Button
            variant="contained" startIcon={<Add />}
            onClick={() => setOpenModal(true)}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 2.5, textTransform: 'none', fontWeight: 700,
            }}
          >
            Tham gia lớp học
          </Button>
        </Box>
      )}

      {/* Join Class Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: 18, color: '#0f172a', pb: 1 }}>
          Tham gia lớp học
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#64748b', fontSize: 14, mb: 2.5 }}>
            Nhập Class ID và Keypass do giáo viên cung cấp để tham gia lớp học.
          </Typography>

          {joinSuccess && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              Tham gia lớp học thành công!
            </Alert>
          )}

          {joinError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {joinError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Class ID"
            placeholder="VD: 6991511f642a83223fd0a5a5"
            value={classId}
            onChange={e => setClassId(e.target.value)}
            sx={{ mb: 2 }}
            size="small"
            onKeyDown={e => e.key === 'Enter' && handleJoinClass()}

          />
          <TextField
            fullWidth
            label="Keypass"
            placeholder="VD: CLASSKEY_5_xxx"
            value={keypass}
            onChange={e => setKeypass(e.target.value)}
            size="small"
            onKeyDown={e => e.key === 'Enter' && handleJoinClass()}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={handleCloseModal} sx={{ borderRadius: 2, textTransform: 'none', color: '#64748b' }}>
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleJoinClass}
            disabled={joining || joinSuccess}
            sx={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 2, textTransform: 'none', fontWeight: 700,
              boxShadow: 'none',
            }}
          >
            {joining ? 'Đang xử lý...' : 'Tham gia'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentClasses;
