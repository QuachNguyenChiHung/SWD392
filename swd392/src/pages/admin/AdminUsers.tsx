import { Box, Typography, Paper, Tabs, Tab, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControl, InputLabel, Select, Alert, Stack } from '@mui/material';
import { useState, useEffect } from 'react';
import { Add, Search, Edit, Delete, PersonAdd } from '@mui/icons-material';
import type { User } from '../../types';
import { UserRole } from '../../types';

const AdminUsers = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.TEACHER as UserRole,
  });

  useEffect(() => {
    // TODO: Fetch users from API
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        role: UserRole.TEACHER,
        status: 'active',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        role: UserRole.STUDENT,
        status: 'active',
        createdAt: new Date('2024-02-20'),
      },
      {
        id: '3',
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        role: UserRole.MODERATOR,
        status: 'active',
        createdAt: new Date('2024-03-10'),
      },
      {
        id: '4',
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        role: UserRole.STUDENT,
        status: 'inactive',
        createdAt: new Date('2024-04-05'),
      },
    ];
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  }, []);

  useEffect(() => {
    let filtered = users;

    // Filter by tab
    switch (tabValue) {
      case 1: // Teachers
        filtered = filtered.filter(u => u.role === UserRole.TEACHER);
        break;
      case 2: // Students
        filtered = filtered.filter(u => u.role === UserRole.STUDENT);
        break;
      case 3: // Moderators
        filtered = filtered.filter(u => u.role === UserRole.MODERATOR);
        break;
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [tabValue, searchQuery, users]);

  const handleCreateUser = () => {
    // TODO: API call to create user
    console.log('Creating user:', newUser);
    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      createdAt: new Date(),
    };
    setUsers([...users, user]);
    setOpenCreateDialog(false);
    setNewUser({ name: '', email: '', password: '', role: UserRole.TEACHER });
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    // TODO: API call to update user
    console.log('Updating user:', selectedUser);
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setOpenEditDialog(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    // TODO: API call to delete user
    console.log('Deleting user:', selectedUser.id);
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setOpenDeleteDialog(false);
    setSelectedUser(null);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'error';
      case UserRole.MODERATOR: return 'secondary';
      case UserRole.TEACHER: return 'success';
      case UserRole.STUDENT: return 'primary';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'Quản trị viên';
      case UserRole.MODERATOR: return 'Người điều hành';
      case UserRole.TEACHER: return 'Giáo viên';
      case UserRole.STUDENT: return 'Học sinh';
      default: return role;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Không hoạt động';
      case 'suspended': return 'Bị khóa';
      default: return status;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Quản lý người dùng
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý tài khoản và vai trò người dùng trong hệ thống
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Tạo người dùng
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label={`Tất cả (${users.length})`} />
          <Tab label={`Giáo viên (${users.filter(u => u.role === UserRole.TEACHER).length})`} />
          <Tab label={`Học sinh (${users.filter(u => u.role === UserRole.STUDENT).length})`} />
          <Tab label={`Người điều hành (${users.filter(u => u.role === UserRole.MODERATOR).length})`} />
        </Tabs>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getRoleLabel(user.role)} 
                        size="small" 
                        color={getRoleColor(user.role) as any}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(user.status)} 
                        size="small" 
                        color={getStatusColor(user.status) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => {
                          setSelectedUser(user);
                          setOpenEditDialog(true);
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => {
                          setSelectedUser(user);
                          setOpenDeleteDialog(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      Không tìm thấy người dùng nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create User Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PersonAdd />
            <Typography variant="h6">Tạo người dùng mới</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Họ và tên"
              fullWidth
              required
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            />
            <TextField
              label="Mật khẩu"
              type="password"
              fullWidth
              required
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            />
            <FormControl fullWidth>
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={newUser.role}
                label="Vai trò"
                onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}
              >
                <MenuItem value={UserRole.TEACHER}>Teacher</MenuItem>
                <MenuItem value={UserRole.MODERATOR}>Người điều hành</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateUser}
            disabled={!newUser.name || !newUser.email || !newUser.password}
          >
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Họ và tên"
                fullWidth
                value={selectedUser.name}
                onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={selectedUser.email}
                onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
              />
              <FormControl fullWidth>
                <InputLabel>Vai trò</InputLabel>
                <Select
                  value={selectedUser.role}
                  label="Vai trò"
                  onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value as UserRole})}
                >
                  <MenuItem value={UserRole.STUDENT}>Học sinh</MenuItem>
                  <MenuItem value={UserRole.TEACHER}>Giáo viên</MenuItem>
                  <MenuItem value={UserRole.MODERATOR}>Người điều hành</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={selectedUser.status || 'active'}
                  label="Trạng thái"
                  onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value as any})}
                >
                  <MenuItem value="active">Hoạt động</MenuItem>
                  <MenuItem value="inactive">Không hoạt động</MenuItem>
                  <MenuItem value="suspended">Bị khóa</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleEditUser}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Hành động này sẽ xóa vĩnh viễn người dùng khỏi hệ thống!
          </Alert>
          <Typography>
            Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.name}</strong> ({selectedUser?.email})?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tất cả dữ liệu liên quan đến người dùng này sẽ bị xóa.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>
            Xóa vĩnh viễn
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;
