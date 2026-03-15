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
import { Delete, PersonAdd, Search } from '@mui/icons-material';
import { useEffect, useMemo, useState } from 'react';
import type { AdminClass, AdminClassStats, AdminQuiz, AdminUser, CreateUserRequest } from '../../types/adminType';
import { UserRole } from '../../types/adminType';
import { adminSystemApi, adminUsersApi } from '../../services/adminApi';

const AdminSystemManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [classStats, setClassStats] = useState<AdminClassStats | null>(null);
  const [classLookupId, setClassLookupId] = useState('');
  const [classLookupResult, setClassLookupResult] = useState<AdminClass | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [quizSearchQuery, setQuizSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<AdminClassStats['timeRange']>('30days');
  const [statusFilter, setStatusFilter] = useState<AdminClassStats['status']>('all');
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<AdminQuiz | null>(null);
  const [openDeleteUserDialog, setOpenDeleteUserDialog] = useState(false);
  const [openDeleteClassDialog, setOpenDeleteClassDialog] = useState(false);
  const [openDeleteQuizDialog, setOpenDeleteQuizDialog] = useState(false);
  const [openCreateModeratorDialog, setOpenCreateModeratorDialog] = useState(false);
  const [newModerator, setNewModerator] = useState<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
    role: UserRole.MODERATOR,
  });

  const fetchUsers = async () => {
    const response = await adminUsersApi.getAllUsers({ page: 1, limit: 100 });
    setUsers(response.users);
  };

  const fetchQuizzes = async () => {
    const response = await adminSystemApi.getAllQuizzes(1);
    setQuizzes(response);
  };

  const fetchClassStats = async () => {
    const response = await adminSystemApi.getClassStats({ timeRange, status: statusFilter });
    setClassStats(response);
  };

  const fetchInitialData = async () => {
    try {
      setError(null);
      await Promise.all([fetchUsers(), fetchQuizzes(), fetchClassStats()]);
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
  }, [timeRange, statusFilter]);

  const filteredUsers = useMemo(
    () => users.filter((user) => user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) || user.email.toLowerCase().includes(userSearchQuery.toLowerCase())),
    [userSearchQuery, users],
  );

  const filteredQuizzes = useMemo(
    () => quizzes.filter((quiz) => quiz.title.toLowerCase().includes(quizSearchQuery.toLowerCase())),
    [quizSearchQuery, quizzes],
  );

  const handleCreateModerator = async () => {
    try {
      await adminUsersApi.createUser(newModerator);
      setOpenCreateModeratorDialog(false);
      setNewModerator({ username: '', email: '', password: '', role: UserRole.MODERATOR });
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create moderator');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await adminUsersApi.deleteUser(selectedUser._id);
      setOpenDeleteUserDialog(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

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
      await fetchClassStats();
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
          Quản lý hệ thống
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Kết nối API thật cho tạo moderator, xóa user, tra cứu/xóa class và xóa quiz
        </Typography>
      </Box>

      <Alert severity="warning" sx={{ mb: 3 }}>
        Các thao tác trong trang này là thao tác hệ thống, đặc biệt các lệnh xóa là xóa vĩnh viễn.
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">Tạo moderator</Typography>
              <Typography variant="body2" color="text.secondary">Dùng `POST /api/users` với role moderator</Typography>
              <Button sx={{ mt: 2 }} variant="contained" startIcon={<PersonAdd />} onClick={() => setOpenCreateModeratorDialog(true)}>
                Tạo moderator
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">Thống kê lớp học</Typography>
              <Typography variant="body2" color="text.secondary">Tổng lớp: {classStats?.totalClasses ?? 0}</Typography>
              <Typography variant="body2" color="text.secondary">TB sĩ số: {classStats?.averageClassSize ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">Dữ liệu tải sẵn</Typography>
              <Typography variant="body2" color="text.secondary">Users: {users.length}</Typography>
              <Typography variant="body2" color="text.secondary">Quizzes: {quizzes.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)}>
          <Tab label="Users" />
          <Tab label="Classes" />
          <Tab label="Quizzes" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <TextField fullWidth placeholder="Tìm user theo username/email" value={userSearchQuery} onChange={(event) => setUserSearchQuery(event.target.value)} sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Username</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Chip label={user.status} size="small" color={user.status === 'active' ? 'success' : 'error'} />
                      </TableCell>
                      <TableCell align="right">
                        <Button color="error" startIcon={<Delete />} onClick={() => {
                          setSelectedUser(user);
                          setOpenDeleteUserDialog(true);
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

        {tabValue === 1 && (
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

        {tabValue === 2 && (
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

      <Dialog open={openCreateModeratorDialog} onClose={() => setOpenCreateModeratorDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo tài khoản moderator</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Username"
              fullWidth
              required
              value={newModerator.username}
              onChange={(e) => setNewModerator({...newModerator, username: e.target.value})}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={newModerator.email}
              onChange={(e) => setNewModerator({...newModerator, email: e.target.value})}
            />
            <TextField
              label="Mật khẩu"
              type="password"
              fullWidth
              required
              value={newModerator.password}
              onChange={(e) => setNewModerator({...newModerator, password: e.target.value})}
            />
            <Alert severity="info">
              Tài khoản sẽ được tạo với vai trò Người điều hành (Moderator)
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateModeratorDialog(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateModerator}
            disabled={!newModerator.username || !newModerator.email || !newModerator.password}
          >
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteUserDialog} onClose={() => setOpenDeleteUserDialog(false)}>
        <DialogTitle>Xác nhận xóa user</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa user <strong>{selectedUser?.username}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteUserDialog(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

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
