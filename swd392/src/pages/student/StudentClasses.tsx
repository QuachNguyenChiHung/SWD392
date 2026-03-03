import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Stack, Paper, Chip, Grid, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Skeleton } from '@mui/material';
import { Add, PlayArrow, Schedule } from '@mui/icons-material';
import { apiService } from '../../services/api';
import type { ClassItem } from '../../types/studentType';

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

const StudentClasses = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    apiService.get('/student/class?page=1').then(res => {
      setClasses(res);
      setLoading(false);
    });
  }, []);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Lớp học của tôi</Typography>
          <Typography color="text.secondary">Bạn đang tham gia {classes.length} lớp học</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
          Tham gia lớp
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {loading ? [1,2,3].map(i => <Grid key={i} size={{xs:12, sm:6, md:4}}><Skeleton variant="rectangular" height={200} sx={{borderRadius: 2}}/></Grid>) :
          classes.map((cls, index) => {
            const color = COLORS[index % 6];
            return (
              <Grid key={cls._id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 2, transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', borderColor: color, boxShadow: '0 10px 20px rgba(0,0,0,0.05)' } }}>
                  <Box sx={{ height: 120, bgcolor: `${color}15`, borderRadius: 1, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {cls.img_cover_link ? <img title={cls.class_name} src={cls.img_cover_link} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} /> : <PlayArrow sx={{ fontSize: 50, color: color }} />}
                  </Box>
                  <Chip label="Đang học" size="small" sx={{ mb: 1, bgcolor: `${color}15`, color: color, fontWeight: 'bold' }} />
                  <Typography variant="h6" fontWeight="bold" noWrap>{cls.class_name}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center" mt={1} mb={2} color="text.secondary">
                    <Schedule sx={{ fontSize: 16 }} />
                    <Typography variant="caption">{new Date(cls.date_create).toLocaleDateString('vi-VN')}</Typography>
                  </Stack>
                  <Button fullWidth variant="outlined" onClick={() => navigate(`/student/class/${cls._id}`)} sx={{ borderColor: color, color: color, '&:hover': { bgcolor: `${color}05`, borderColor: color } }}>
                    Vào học ngay
                  </Button>
                </Paper>
              </Grid>
            );
          })
        }
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Tham gia lớp mới</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField fullWidth label="Nhập mã keypass" size="small" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Hủy</Button>
          <Button variant="contained">Xác nhận</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentClasses;