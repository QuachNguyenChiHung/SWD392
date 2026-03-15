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
  Paper,
  Select,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { Delete, Search } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import type { AdminClass, AdminClassStats, AdminQuiz } from '../../types/adminType';
import { adminSystemApi } from '../../services/adminApi';

const AdminSystemManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [classStats, setClassStats] = useState<AdminClassStats | null>(null);
  const [classLookupId, setClassLookupId] = useState('');
  const [classLookupResult, setClassLookupResult] = useState<AdminClass | null>(null);
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [quizSearchQuery, setQuizSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<AdminClassStats['timeRange']>('30days');
  const [statusFilter, setStatusFilter] = useState<AdminClassStats['status']>('all');
  const [error, setError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<AdminQuiz | null>(null);
  const [openDeleteClassDialog, setOpenDeleteClassDialog] = useState(false);
  const [openDeleteQuizDialog, setOpenDeleteQuizDialog] = useState(false);

  const fetchQuizzes = async () => {
    const response = await adminSystemApi.getAllQuizzes(1);
    setQuizzes(response);
  };

  const fetchClasses = async () => {
    const response = await adminSystemApi.getAllClasses({ timeRange, status: statusFilter });
    setClasses(response);
  };

  const fetchClassStats = async () => {
    const response = await adminSystemApi.getClassStats({ timeRange, status: statusFilter });
    setClassStats(response);
  };

  const fetchInitialData = async () => {
    try {
      setError(null);
      await Promise.all([fetchQuizzes(), fetchClasses()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system management data');
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchClassStats().catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load class stats');
    });

    fetchClasses().catch((err) => {
      setError(err instanceof Error ? err.message : 'Failed to load class list');
    });
  }, [timeRange, statusFilter]);

  const filteredQuizzes = useMemo(
    () => quizzes.filter((quiz) => quiz.title.toLowerCase().includes(quizSearchQuery.toLowerCase())),
    [quizSearchQuery, quizzes],
  );

  const filteredClasses = useMemo(() => {
    const keyword = classSearchQuery.trim().toLowerCase();
    const statusKeyword = statusFilter.toLowerCase();

    return classes.filter((classItem) => {
      const matchesKeyword =
        !keyword ||
        classItem.class_name.toLowerCase().includes(keyword) ||
        classItem._id.toLowerCase().includes(keyword);

      const matchesStatus = statusKeyword === 'all' || classItem.status === statusKeyword;

      return matchesKeyword && matchesStatus;
    });
  }, [classSearchQuery, statusFilter, classes]);

  const handleLookupClass = async () => {
    if (!classLookupId.trim()) return;
    try {
      const response = await adminSystemApi.getClassById(classLookupId.trim());
      setClassLookupResult(response);
    } catch (err) {
      setClassLookupResult(null);
      setError(err instanceof Error ? err.message : 'Failed to find class');
    }
  };

  const handleDeleteClass = async () => {
    if (!classLookupResult) return;
    try {
      await adminSystemApi.deleteClass(classLookupResult._id);
      setOpenDeleteClassDialog(false);
      setClassLookupResult(null);
      setClassLookupId('');
      await Promise.all([fetchClassStats(), fetchClasses()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete class');
    }
  };

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return;
    try {
      await adminSystemApi.deleteQuiz(selectedQuiz._id);
      setOpenDeleteQuizDialog(false);
      setSelectedQuiz(null);
      await fetchQuizzes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quiz');
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
          Quản lý lớp học và quiz
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tác vụ vận hành hệ thống: thống kê lớp học, xóa lớp và xóa quiz
        </Typography>
      </Box>

      <Alert severity="warning" sx={{ mb: 3 }}>
        Các thao tác trong trang này là thao tác hệ thống, đặc biệt các lệnh xóa là xóa vĩnh viễn.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">Thống kê lớp học</Typography>
              <Typography variant="body2" color="text.secondary">Tổng lớp: {classStats?.totalClasses ?? 0}</Typography>
              <Typography variant="body2" color="text.secondary">TB sĩ số: {classStats?.averageClassSize ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">Dữ liệu tải sẵn</Typography>
              <Typography variant="body2" color="text.secondary">Class stats đã tải</Typography>
              <Typography variant="body2" color="text.secondary">Quizzes: {quizzes.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
          <Tab label="Classes" />
          <Tab label="Quizzes" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Time range</InputLabel>
                <Select value={timeRange} label="Time range" onChange={(event) => setTimeRange(event.target.value as AdminClassStats['timeRange'])}>
                  <MenuItem value="7days">7 ngày</MenuItem>
                  <MenuItem value="30days">30 ngày</MenuItem>
                  <MenuItem value="3months">3 tháng</MenuItem>
                  <MenuItem value="1year">1 năm</MenuItem>
                  <MenuItem value="all">Tất cả</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select value={statusFilter} label="Trạng thái" onChange={(event) => setStatusFilter(event.target.value as AdminClassStats['status'])}>
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card><CardContent><Typography variant="h6">Tổng lớp</Typography><Typography variant="h4">{classStats?.totalClasses ?? 0}</Typography></CardContent></Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card><CardContent><Typography variant="h6">Active</Typography><Typography variant="h4">{classStats?.byStatus.active ?? 0}</Typography></CardContent></Card>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card><CardContent><Typography variant="h6">Inactive</Typography><Typography variant="h4">{classStats?.byStatus.inactive ?? 0}</Typography></CardContent></Card>
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Danh sách lớp</Typography>
              <TextField
                fullWidth
                placeholder="Tìm theo tên lớp hoặc ID"
                value={classSearchQuery}
                onChange={(event) => setClassSearchQuery(event.target.value)}
                sx={{ mb: 2 }}
              />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tên lớp</TableCell>
                      <TableCell>Class ID</TableCell>
                      <TableCell>Teacher ID</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Ngày tạo</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredClasses.length > 0 ? (
                      filteredClasses.map((classItem) => (
                        <TableRow key={classItem._id} hover>
                          <TableCell>{classItem.class_name}</TableCell>
                          <TableCell>{classItem._id}</TableCell>
                          <TableCell>{classItem.teacher_id}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={classItem.status === 'active' ? 'Active' : 'Inactive'}
                              color={classItem.status === 'active' ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{new Date(classItem.date_create).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              startIcon={<Search />}
                              onClick={() => {
                                setClassLookupId(classItem._id);
                                setClassLookupResult(classItem);
                              }}
                            >
                              Chọn
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                            Không tìm thấy lớp phù hợp
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Tra cứu lớp theo ID để xóa</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField fullWidth label="Class ID" value={classLookupId} onChange={(event) => setClassLookupId(event.target.value)} />
                <Button variant="contained" startIcon={<Search />} onClick={handleLookupClass}>Tra cứu</Button>
              </Stack>
              {classLookupResult && (
                <Box sx={{ mt: 3 }}>
                  <Typography><strong>Tên lớp:</strong> {classLookupResult.class_name}</Typography>
                  <Typography><strong>Teacher ID:</strong> {classLookupResult.teacher_id}</Typography>
                  <Typography><strong>Course ID:</strong> {classLookupResult.course_id}</Typography>
                  <Typography><strong>Keypass:</strong> {classLookupResult.keypass}</Typography>
                  <Typography><strong>Ngày tạo:</strong> {new Date(classLookupResult.date_create).toLocaleString('vi-VN')}</Typography>
                  <Button sx={{ mt: 2 }} color="error" variant="contained" startIcon={<Delete />} onClick={() => setOpenDeleteClassDialog(true)}>
                    Xóa lớp này
                  </Button>
                </Box>
              )}
            </Paper>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <TextField fullWidth placeholder="Tìm quiz theo tiêu đề" value={quizSearchQuery} onChange={(event) => setQuizSearchQuery(event.target.value)} sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tiêu đề</TableCell>
                    <TableCell>Loại</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Số lần làm tối đa</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredQuizzes.map((quiz) => (
                    <TableRow key={quiz._id} hover>
                      <TableCell>{quiz.title}</TableCell>
                      <TableCell>{quiz.type}</TableCell>
                      <TableCell>{quiz.status ? 'Active' : 'Inactive'}</TableCell>
                      <TableCell>{quiz.max_attempt_number ?? '-'}</TableCell>
                      <TableCell align="right">
                        <Button color="error" startIcon={<Delete />} onClick={() => {
                          setSelectedQuiz(quiz);
                          setOpenDeleteQuizDialog(true);
                        }}>
                          Xóa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      <Dialog open={openDeleteClassDialog} onClose={() => setOpenDeleteClassDialog(false)}>
        <DialogTitle>Xác nhận xóa lớp học</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            API admin sẽ xóa cascade toàn bộ dữ liệu liên quan của lớp.
          </Alert>
          <Typography>
            Bạn có chắc chắn muốn xóa lớp <strong>{classLookupResult?.class_name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteClassDialog(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDeleteClass}>
            Xóa lớp
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteQuizDialog} onClose={() => setOpenDeleteQuizDialog(false)}>
        <DialogTitle>Xác nhận xóa quiz</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            API admin sẽ xóa quiz, questions, attempts và progress liên quan.
          </Alert>
          <Typography>
            Bạn có chắc chắn muốn xóa quiz <strong>{selectedQuiz?.title}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteQuizDialog(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDeleteQuiz}>
            Xóa quiz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSystemManagement;
