import { Box, Typography, Paper, Tabs, Tab, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, FormControl, InputLabel, Select, Alert, Stack, CircularProgress, Pagination } from '@mui/material';
import { useState, useEffect } from 'react';
import { Add, Search, Edit, Delete, PersonAdd, Block, CheckCircle } from '@mui/icons-material';
import type { AdminUser, CreateUserRequest, UpdateUserRequest } from '../../types/adminType';
import { UserRole } from '../../types/adminType';
import { adminUsersApi } from '../../services/adminApi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;

const AdminUsers = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasTriedCreateSubmit, setHasTriedCreateSubmit] = useState(false);

  const PAGE_SIZE = 12;

  // New user form state
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
    role: UserRole.TEACHER,
    credentialFile: null,
  });

  // Edit user form state
  const [editUser, setEditUser] = useState<UpdateUserRequest>({
    username: '',
    email: '',
  });

  const createValidationErrors = {
    username:
      newUser.username.trim().length === 0 ? 'Tên người dùng là bắt buộc' : '',
    email:
      newUser.email.trim().length === 0
        ? 'Email là bắt buộc'
        : !EMAIL_REGEX.test(newUser.email.trim())
          ? 'Email không hợp lệ'
          : '',
    password:
      newUser.password.length === 0
        ? 'Mật khẩu là bắt buộc'
        : !PASSWORD_REGEX.test(newUser.password)
          ? 'Mật khẩu phải có ít nhất 10 ký tự, gồm 1 chữ in hoa, 1 số và 1 ký tự đặc biệt'
          : '',
    credentialFile:
      newUser.role === UserRole.TEACHER && !newUser.credentialFile
        ? 'Credential PDF là bắt buộc cho giáo viên'
        : newUser.role === UserRole.TEACHER && newUser.credentialFile?.type !== 'application/pdf'
          ? 'File credential phải là PDF'
          : '',
  };

  const editValidationErrors = {
    username:
      editUser.username !== undefined && editUser.username.trim().length === 0
        ? 'Tên người dùng không được để trống'
        : '',
    email:
      editUser.email !== undefined && editUser.email.trim().length > 0 && !EMAIL_REGEX.test(editUser.email.trim())
        ? 'Email không hợp lệ'
        : '',
  };

  const isCreateFormValid = Object.values(createValidationErrors).every((message) => !message);
  const isEditFormValid = Object.values(editValidationErrors).every((message) => !message);

  const fetchUsers = async (keyword: string, pageNumber: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = keyword.trim()
        ? await adminUsersApi.searchUsers({ keyword: keyword.trim(), page: pageNumber, limit: PAGE_SIZE })
        : await adminUsersApi.getAllUsers({ page: pageNumber, limit: PAGE_SIZE });
      setUsers(response.users);
      setFilteredUsers(response.users);
      setTotalUsers(response.total ?? 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers(searchQuery, page);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, page]);

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
    setFilteredUsers(filtered);
  }, [tabValue, users]);

  const handleCreateUser = async () => {
    setHasTriedCreateSubmit(true);
    if (!isCreateFormValid) {
      setError('Vui lòng kiểm tra lại dữ liệu trong form tạo người dùng');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await adminUsersApi.createUser(newUser);
      setOpenCreateDialog(false);
      setHasTriedCreateSubmit(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: UserRole.TEACHER,
        credentialFile: null,
      });
      await fetchUsers(searchQuery, page);
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    if (!isEditFormValid) {
      setError('Vui lòng kiểm tra lại dữ liệu trong form chỉnh sửa');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await adminUsersApi.updateUser(selectedUser._id, editUser);
      setOpenEditDialog(false);
      setSelectedUser(null);
      await fetchUsers(searchQuery, page);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setLoading(true);
      setError(null);
      await adminUsersApi.deleteUser(selectedUser._id);
      setOpenDeleteDialog(false);
      setSelectedUser(null);
      await fetchUsers(searchQuery, page);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setLoading(false);
    }
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
      case 'banned': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'banned': return 'Bị cấm';
      case 'deleted': return 'Đã xóa';
      default: return status;
    }
  };

  const renderEntityInfo = (user: AdminUser) => {
    if (user.role === UserRole.TEACHER) {
      if (!user.teacher) {
        return <Typography variant="body2" color="warning.main">Chưa có hồ sơ giáo viên</Typography>;
      }

      return (
        <Stack spacing={0.5}>
          <Typography variant="body2">Hồ sơ giáo viên</Typography>
          {user.teacher.fileName && (
            <Typography variant="caption" color="text.secondary">
              File: {user.teacher.fileName}
            </Typography>
          )}
          {user.teacher.credential && (
            <Button
              size="small"
              href={user.teacher.credential}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ p: 0, minWidth: 0, justifyContent: 'flex-start' }}
            >
              Xem credential
            </Button>
          )}
        </Stack>
      );
    }

    if (user.role === UserRole.ADMIN || user.role === UserRole.MODERATOR) {
      if (!user.admin) {
        return <Typography variant="body2" color="warning.main">Chưa có hồ sơ quản trị</Typography>;
      }

      return (
        <Stack spacing={0.5}>
          <Typography variant="body2">Hồ sơ quản trị</Typography>
          <Typography variant="caption" color="text.secondary">
            Authorization level: {user.admin.authorization_lvl}
          </Typography>
        </Stack>
      );
    }

    return <Typography variant="body2" color="text.secondary">-</Typography>;
  };

  const handleToggleUserStatus = async (user: AdminUser) => {
    try {
      setLoading(true);
      await adminUsersApi.toggleUserStatus(user._id);
      await fetchUsers(searchQuery, page);
    } catch (err) {
      console.error('Error toggling user status:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle user status');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setEditUser({
      username: user.username,
      email: user.email,
    });
    setOpenEditDialog(true);
  };

  const openDelete = (user: AdminUser) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  // Loading state
  if (loading && (!users || users.length === 0)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
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
          onClick={() => {
            setHasTriedCreateSubmit(false);
            setOpenCreateDialog(true);
          }}
        >
          Tạo người dùng
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
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
          <Tab label={`Tất cả (${users?.length || 0})`} />
          <Tab label={`Giáo viên (${users?.filter(u => u.role === UserRole.TEACHER).length || 0})`} />
          <Tab label={`Học sinh (${users?.filter(u => u.role === UserRole.STUDENT).length || 0})`} />
          <Tab label={`Người điều hành (${users?.filter(u => u.role === UserRole.MODERATOR).length || 0})`} />
        </Tabs>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={getRoleLabel(user.role)}
                        size="small"
                        color={getRoleColor(user.role) as any}
                      />
                    </TableCell>
                    <TableCell>{renderEntityInfo(user)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(user.status)}
                        size="small"
                        color={getStatusColor(user.status) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {user.date_create ? new Date(user.date_create).toLocaleDateString('vi-VN') : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color={user.status === 'active' ? 'error' : 'success'}
                        onClick={() => handleToggleUserStatus(user)}
                        title={user.status === 'active' ? 'Ban user' : 'Unban user'}
                      >
                        {user.status === 'active' ? <Block /> : <CheckCircle />}
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => openEdit(user)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => openDelete(user)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      Không tìm thấy người dùng nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <Pagination
            color="primary"
            page={page}
            count={Math.max(1, Math.ceil(totalUsers / PAGE_SIZE))}
            onChange={(_, nextPage) => setPage(nextPage)}
            disabled={loading}
          />
        </Box>
      </Paper>

      {/* Create User Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => {
          setOpenCreateDialog(false);
          setHasTriedCreateSubmit(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <PersonAdd />
            <Typography variant="h6">Tạo người dùng mới</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tên người dùng"
              fullWidth
              required
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
              error={hasTriedCreateSubmit && !!createValidationErrors.username}
              helperText={hasTriedCreateSubmit ? createValidationErrors.username : ''}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              error={hasTriedCreateSubmit && !!createValidationErrors.email}
              helperText={hasTriedCreateSubmit ? createValidationErrors.email : ''}
            />
            <TextField
              label="Mật khẩu"
              type="password"
              fullWidth
              required
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              error={hasTriedCreateSubmit && !!createValidationErrors.password}
              helperText={
                hasTriedCreateSubmit
                  ? (createValidationErrors.password || 'Ít nhất 10 ký tự, gồm chữ in hoa, số và ký tự đặc biệt')
                  : 'Ít nhất 10 ký tự, gồm chữ in hoa, số và ký tự đặc biệt'
              }
            />
            <FormControl fullWidth>
              <InputLabel>Vai trò</InputLabel>
              <Select
                value={newUser.role}
                label="Vai trò"
                onChange={(e) => {
                  const nextRole = e.target.value as UserRole;
                  setNewUser({
                    ...newUser,
                    role: nextRole,
                    credentialFile: nextRole === UserRole.TEACHER ? newUser.credentialFile : null,
                  });
                }}
              >
                <MenuItem value={UserRole.STUDENT}>Học sinh</MenuItem>
                <MenuItem value={UserRole.TEACHER}>Giáo viên</MenuItem>
                <MenuItem value={UserRole.MODERATOR}>Người điều hành</MenuItem>
              </Select>
            </FormControl>

            {newUser.role === UserRole.TEACHER && (
              <TextField
                fullWidth
                required
                type="file"
                label="Credential PDF"
                InputLabelProps={{ shrink: true }}
                inputProps={{ accept: '.pdf,application/pdf' }}
                onChange={(e) => {
                  const file = (e.target as HTMLInputElement).files?.[0] ?? null;
                  setNewUser({ ...newUser, credentialFile: file });
                }}
                error={hasTriedCreateSubmit && !!createValidationErrors.credentialFile}
                helperText={
                  hasTriedCreateSubmit
                    ? (createValidationErrors.credentialFile || 'Bắt buộc cho tài khoản giáo viên')
                    : 'Bắt buộc cho tài khoản giáo viên'
                }
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenCreateDialog(false);
              setHasTriedCreateSubmit(false);
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateUser}
            disabled={loading}
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
                label="Tên người dùng"
                fullWidth
                value={editUser.username}
                onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                error={!!editValidationErrors.username}
                helperText={editValidationErrors.username}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                error={!!editValidationErrors.email}
                helperText={editValidationErrors.email}
              />
              {renderEntityInfo(selectedUser)}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleEditUser} disabled={loading || !isEditFormValid}>
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
            Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser?.username}</strong> ({selectedUser?.email})?
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
