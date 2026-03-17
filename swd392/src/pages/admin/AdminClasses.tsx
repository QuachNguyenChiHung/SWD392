import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Search } from '@mui/icons-material';
import type { AdminClass, AdminClassStats, AdminUser } from '../../types/adminType';
import { adminSystemApi, adminUsersApi } from '../../services/adminApi';

type ExtendedAdminClass = AdminClass & {
  teacher_name?: string;
  teacher_email?: string;
  teacher?: Partial<AdminUser>;
  student_count?: number;
  course_name?: string;
};

const AdminClasses = () => {
  const [classes, setClasses] = useState<ExtendedAdminClass[]>([]);
  const [stats, setStats] = useState<AdminClassStats | null>(null);
  const [selectedClass, setSelectedClass] = useState<ExtendedAdminClass | null>(null);
  const [teacherDetail, setTeacherDetail] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AdminClassStats['status']>('all');
  const [timeRange, setTimeRange] = useState<AdminClassStats['timeRange']>('30days');

  const fetchStats = async () => {
    const response = await adminSystemApi.getClassStats({ timeRange, status: statusFilter });
    setStats(response);
  };

  const fetchClasses = async (keyword: string, pageNumber: number) => {
    const response = await adminSystemApi.searchClasses(keyword, pageNumber);
    setClasses(response.classes as ExtendedAdminClass[]);
    setPage(response.page);
    setHasNextPage(response.hasNextPage);
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([fetchStats(), fetchClasses(search, page)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu lớp học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchStats().catch((err) => {
      setError(err instanceof Error ? err.message : 'Không thể tải thống kê lớp học');
    });
  }, [timeRange, statusFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchClasses(search, page).catch((err) => {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách lớp học');
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, page]);

  const filteredClasses = useMemo(() => {
    if (statusFilter === 'all') {
      return classes;
    }
    return classes.filter((classItem) => classItem.status === statusFilter);
  }, [classes, statusFilter]);

  const handleOpenClassDetail = async (classItem: ExtendedAdminClass) => {
    setSelectedClass(classItem);
    setTeacherDetail(null);

    if (classItem.teacher?.username || classItem.teacher_name) {
      setTeacherDetail({
        _id: classItem.teacher_id,
        username: classItem.teacher?.username || classItem.teacher_name || 'N/A',
        email: classItem.teacher?.email || classItem.teacher_email || 'N/A',
        role: 'teacher',
        status: 'active',
        date_create: '',
      });
      return;
    }

    if (!classItem.teacher_id) {
      return;
    }

    try {
      setDetailLoading(true);
      const response = await adminUsersApi.getUserById(classItem.teacher_id);
      setTeacherDetail(response);
    } catch {
      setTeacherDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Danh sách lớp học
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Theo dõi toàn bộ lớp học trong hệ thống và xem chi tiết giáo viên phụ trách.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Tổng lớp</Typography>
              <Typography variant="h5" fontWeight="bold">{stats?.totalClasses ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Đang hoạt động</Typography>
              <Typography variant="h5" fontWeight="bold">{stats?.byStatus?.active ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Không hoạt động</Typography>
              <Typography variant="h5" fontWeight="bold">{stats?.byStatus?.inactive ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">Sĩ số trung bình</Typography>
              <Typography variant="h5" fontWeight="bold">{stats?.averageClassSize ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Tìm theo tên lớp"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <FormControl fullWidth>
            <InputLabel>Thời gian</InputLabel>
            <Select
              value={timeRange}
              label="Thời gian"
              onChange={(event) => setTimeRange(event.target.value as AdminClassStats['timeRange'])}
            >
              <MenuItem value="7days">7 ngày</MenuItem>
              <MenuItem value="30days">30 ngày</MenuItem>
              <MenuItem value="3months">3 tháng</MenuItem>
              <MenuItem value="1year">1 năm</MenuItem>
              <MenuItem value="all">Tất cả</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusFilter}
              label="Trạng thái"
              onChange={(event) => {
                setStatusFilter(event.target.value as AdminClassStats['status']);
                setPage(1);
              }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Top lớp có nhiều học viên</Typography>
        {stats?.topEnrolledClasses?.length ? (
          <Stack spacing={1}>
            {stats.topEnrolledClasses.map((item) => (
              <Box key={item.classId} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography>{item.className}</Typography>
                <Chip size="small" label={`${item.enrollments} học viên`} color="primary" />
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">Không có dữ liệu top lớp.</Typography>
        )}
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên lớp</TableCell>
                <TableCell>Class ID</TableCell>
                <TableCell>Teacher</TableCell>
                <TableCell>Sĩ số</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right">Chi tiết</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredClasses.length > 0 ? (
                filteredClasses.map((classItem) => (
                  <TableRow key={classItem._id} hover>
                    <TableCell>{classItem.class_name}</TableCell>
                    <TableCell>{classItem._id}</TableCell>
                    <TableCell>{classItem.teacher_name || classItem.teacher?.username || classItem.teacher_id}</TableCell>
                    <TableCell>{classItem.student_count ?? '-'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={classItem.status === 'active' ? 'Active' : 'Inactive'}
                        color={classItem.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{new Date(classItem.date_create).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell align="right">
                      <Button size="small" startIcon={<Search />} onClick={() => handleOpenClassDetail(classItem)}>
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell align="center" colSpan={7}>
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      {loading ? 'Đang tải dữ liệu...' : 'Không có lớp học nào phù hợp'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 2 }}>
          <Typography variant="body2" color="text.secondary">Trang {page}</Typography>
          <Pagination
            color="primary"
            page={page}
            count={hasNextPage ? page + 1 : page}
            onChange={(_, value) => setPage(value)}
            disabled={loading}
          />
        </Stack>
      </Paper>

      <Dialog open={Boolean(selectedClass)} onClose={() => setSelectedClass(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết lớp học</DialogTitle>
        <DialogContent dividers>
          {selectedClass && (
            <Stack spacing={1.5}>
              <Typography><strong>Tên lớp:</strong> {selectedClass.class_name}</Typography>
              <Typography><strong>Class ID:</strong> {selectedClass._id}</Typography>
              <Typography><strong>Course ID:</strong> {selectedClass.course_id}</Typography>
              <Typography><strong>Teacher ID:</strong> {selectedClass.teacher_id}</Typography>
              <Typography><strong>Keypass:</strong> {selectedClass.keypass}</Typography>
              <Typography><strong>Trạng thái:</strong> {selectedClass.status}</Typography>
              <Typography><strong>Ngày tạo:</strong> {new Date(selectedClass.date_create).toLocaleString('vi-VN')}</Typography>

              <Box sx={{ pt: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">Thông tin giáo viên</Typography>
                {detailLoading ? (
                  <Typography variant="body2" color="text.secondary">Đang tải thông tin giáo viên...</Typography>
                ) : teacherDetail ? (
                  <Stack spacing={0.5} sx={{ mt: 1 }}>
                    <Typography><strong>Họ tên:</strong> {teacherDetail.username}</Typography>
                    <Typography><strong>Email:</strong> {teacherDetail.email}</Typography>
                    <Typography><strong>Trạng thái:</strong> {teacherDetail.status}</Typography>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Chưa lấy được hồ sơ giáo viên. Hiện có Teacher ID để tra cứu: {selectedClass.teacher_id}
                  </Typography>
                )}
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedClass(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminClasses;