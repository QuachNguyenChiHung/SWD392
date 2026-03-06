import { Box, Typography, Paper, Grid, Card, CardContent, CardActions, Button, Dialog, DialogTitle, DialogContent, DialogActions, Alert, TextField, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Chip, Tabs, Tab } from '@mui/material';
import { useState, useEffect } from 'react';
import { Delete, Warning, PersonAdd, Search } from '@mui/icons-material';
import type { User, Class } from '../../types';
import { UserRole } from '../../types';

interface Quiz {
  id: string;
  title: string;
  className: string;
  createdDate: Date;
  status: 'active' | 'inactive';
}

const AdminSystemManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDeleteUserDialog, setOpenDeleteUserDialog] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Classes state
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [openDeleteClassDialog, setOpenDeleteClassDialog] = useState(false);
  const [classSearchQuery, setClassSearchQuery] = useState('');

  // Quizzes state
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [openDeleteQuizDialog, setOpenDeleteQuizDialog] = useState(false);
  const [quizSearchQuery, setQuizSearchQuery] = useState('');

  // Create Moderator state
  const [openCreateModeratorDialog, setOpenCreateModeratorDialog] = useState(false);
  const [newModerator, setNewModerator] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    // TODO: Fetch data from API
    const mockUsers: User[] = [
      { id: '1', name: 'Nguyễn Văn A', email: 'a@example.com', role: UserRole.STUDENT, status: 'active' },
      { id: '2', name: 'Trần Thị B', email: 'b@example.com', role: UserRole.TEACHER, status: 'active' },
    ];
    setUsers(mockUsers);

    const mockClasses: Class[] = [
      {
        class_id: '1',
        class_name: 'Web Development',
        keypass: 'ABC123',
        course_id: 'c1',
        teacher_id: 't1',
        img_cover_link: '',
        keywords: 'web,html,css',
        date_create: new Date('2024-01-15'),
        status: 'active',
      },
      {
        class_id: '2',
        class_name: 'Mobile App Development',
        keypass: 'XYZ789',
        course_id: 'c2',
        teacher_id: 't2',
        img_cover_link: '',
        keywords: 'mobile,android,ios',
        date_create: new Date('2024-02-20'),
        status: 'inactive',
      },
    ];
    setClasses(mockClasses);

    const mockQuizzes: Quiz[] = [
      { id: '1', title: 'HTML Basics Quiz', className: 'Web Development', createdDate: new Date('2024-03-01'), status: 'active' },
      { id: '2', title: 'CSS Advanced Test', className: 'Web Development', createdDate: new Date('2024-03-10'), status: 'active' },
    ];
    setQuizzes(mockQuizzes);
  }, []);

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    // TODO: API call to permanently delete user
    console.log('Permanently deleting user:', selectedUser.id);
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setOpenDeleteUserDialog(false);
    setSelectedUser(null);
  };

  const handleDeleteClass = () => {
    if (!selectedClass) return;
    // TODO: API call to permanently delete class
    console.log('Permanently deleting class:', selectedClass.class_id);
    setClasses(classes.filter(c => c.class_id !== selectedClass.class_id));
    setOpenDeleteClassDialog(false);
    setSelectedClass(null);
  };

  const handleDeleteQuiz = () => {
    if (!selectedQuiz) return;
    // TODO: API call to permanently delete quiz
    console.log('Permanently deleting quiz:', selectedQuiz.id);
    setQuizzes(quizzes.filter(q => q.id !== selectedQuiz.id));
    setOpenDeleteQuizDialog(false);
    setSelectedQuiz(null);
  };

  const handleCreateModerator = () => {
    // TODO: API call to create moderator
    console.log('Creating moderator:', newModerator);
    const moderator: User = {
      id: Date.now().toString(),
      name: newModerator.name,
      email: newModerator.email,
      role: UserRole.MODERATOR,
      status: 'active',
      createdAt: new Date(),
    };
    setUsers([...users, moderator]);
    setOpenCreateModeratorDialog(false);
    setNewModerator({ name: '', email: '', password: '' });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const filteredClasses = classes.filter(c => 
    c.class_name.toLowerCase().includes(classSearchQuery.toLowerCase())
  );

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(quizSearchQuery.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Quản lý Hệ thống
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Thao tác cơ sở dữ liệu cấp hệ thống - Cần thận trọng khi sử dụng
        </Typography>
      </Box>

      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold">
          Cảnh báo: Các thao tác xóa trong phần này là vĩnh viễn!
        </Typography>
        <Typography variant="body2">
          Dữ liệu không thể khôi phục sau khi xóa. Vui lòng kiểm tra kỹ trước khi thực hiện.
        </Typography>
      </Alert>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Tạo tài khoản Moderator
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tạo mới tài khoản Người điều hành trực tiếp
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                startIcon={<PersonAdd />}
                onClick={() => setOpenCreateModeratorDialog(true)}
              >
                Tạo Moderator
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="error">
                Xóa người dùng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {users.length} người dùng trong hệ thống
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                variant="outlined" 
                color="error" 
                fullWidth
                onClick={() => setTabValue(0)}
              >
                Quản lý
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="bold" color="error">
                Xóa lớp học & bài kiểm tra
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {classes.length} lớp học, {quizzes.length} bài kiểm tra
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                variant="outlined" 
                color="error" 
                fullWidth
                onClick={() => setTabValue(1)}
              >
                Quản lý
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      <Paper>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Xóa người dùng" />
          <Tab label="Xóa lớp học" />
          <Tab label="Xóa bài kiểm tra" />
        </Tabs>

        {/* Tab 0: Delete Users */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm người dùng..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ mb: 2 }}
            />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Vai trò</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip label={user.role} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          size="small" 
                          color={user.status === 'active' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => {
                            setSelectedUser(user);
                            setOpenDeleteUserDialog(true);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab 1: Delete Classes */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm lớp học..."
              value={classSearchQuery}
              onChange={(e) => setClassSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ mb: 2 }}
            />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tên lớp</TableCell>
                    <TableCell>Mã lớp</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClasses.map((classItem) => (
                    <TableRow key={classItem.class_id}>
                      <TableCell>{classItem.class_name}</TableCell>
                      <TableCell>{classItem.keypass}</TableCell>
                      <TableCell>
                        {new Date(classItem.date_create).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={classItem.status} 
                          size="small" 
                          color={classItem.status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => {
                            setSelectedClass(classItem);
                            setOpenDeleteClassDialog(true);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Tab 2: Delete Quizzes */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm bài kiểm tra..."
              value={quizSearchQuery}
              onChange={(e) => setQuizSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ mb: 2 }}
            />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tiêu đề</TableCell>
                    <TableCell>Lớp học</TableCell>
                    <TableCell>Ngày tạo</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredQuizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell>{quiz.title}</TableCell>
                      <TableCell>{quiz.className}</TableCell>
                      <TableCell>
                        {new Date(quiz.createdDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={quiz.status} 
                          size="small" 
                          color={quiz.status === 'active' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => {
                            setSelectedQuiz(quiz);
                            setOpenDeleteQuizDialog(true);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* Create Moderator Dialog */}
      <Dialog open={openCreateModeratorDialog} onClose={() => setOpenCreateModeratorDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PersonAdd />
            <Typography variant="h6">Tạo tài khoản Moderator</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Họ và tên"
              fullWidth
              required
              value={newModerator.name}
              onChange={(e) => setNewModerator({...newModerator, name: e.target.value})}
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
            disabled={!newModerator.name || !newModerator.email || !newModerator.password}
          >
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={openDeleteUserDialog} onClose={() => setOpenDeleteUserDialog(false)}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1} color="error.main">
            <Warning />
            <Typography variant="h6">Xác nhận xóa vĩnh viễn</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>CẢNH BÁO:</strong> Hành động này không thể hoàn tác!
          </Alert>
          <Typography>
            Bạn có chắc chắn muốn xóa vĩnh viễn người dùng <strong>{selectedUser?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tất cả dữ liệu liên quan sẽ bị xóa khỏi hệ thống:
          </Typography>
          <ul>
            <li><Typography variant="body2">Thông tin cá nhân</Typography></li>
            <li><Typography variant="body2">Lịch sử hoạt động</Typography></li>
            <li><Typography variant="body2">Dữ liệu học tập/giảng dạy</Typography></li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteUserDialog(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>
            Xóa vĩnh viễn
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Class Dialog */}
      <Dialog open={openDeleteClassDialog} onClose={() => setOpenDeleteClassDialog(false)}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1} color="error.main">
            <Warning />
            <Typography variant="h6">Xác nhận xóa vĩnh viễn lớp học</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>CẢNH BÁO:</strong> Hành động này không thể hoàn tác!
          </Alert>
          <Typography>
            Bạn có chắc chắn muốn xóa vĩnh viễn lớp học <strong>{selectedClass?.class_name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tất cả dữ liệu liên quan sẽ bị xóa:
          </Typography>
          <ul>
            <li><Typography variant="body2">Danh sách học sinh</Typography></li>
            <li><Typography variant="body2">Bài giảng và tài liệu</Typography></li>
            <li><Typography variant="body2">Bài kiểm tra và điểm số</Typography></li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteClassDialog(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDeleteClass}>
            Xóa vĩnh viễn
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Quiz Dialog */}
      <Dialog open={openDeleteQuizDialog} onClose={() => setOpenDeleteQuizDialog(false)}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1} color="error.main">
            <Warning />
            <Typography variant="h6">Xác nhận xóa vĩnh viễn bài kiểm tra</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>CẢNH BÁO:</strong> Hành động này không thể hoàn tác!
          </Alert>
          <Typography>
            Bạn có chắc chắn muốn xóa vĩnh viễn bài kiểm tra <strong>{selectedQuiz?.title}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tất cả dữ liệu liên quan sẽ bị xóa:
          </Typography>
          <ul>
            <li><Typography variant="body2">Câu hỏi và đáp án</Typography></li>
            <li><Typography variant="body2">Kết quả làm bài của học sinh</Typography></li>
            <li><Typography variant="body2">Điểm số và nhận xét</Typography></li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteQuizDialog(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDeleteQuiz}>
            Xóa vĩnh viễn
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSystemManagement;
