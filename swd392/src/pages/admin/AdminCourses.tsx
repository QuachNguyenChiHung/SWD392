import { Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Stack, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
import { Add, Search, Edit, Delete, School, ToggleOn, ToggleOff } from '@mui/icons-material';
import type { AdminCourse, CreateCourseRequest, UpdateCourseRequest } from '../../types/adminType';
import { adminCoursesApi } from '../../services/adminApi';

const AdminCourses = () => {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<AdminCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // New course form state
  const [newCourse, setNewCourse] = useState<CreateCourseRequest>({
    course_name: '',
    grade_level: 10,
  });

  // Edit course form state
  const [editCourse, setEditCourse] = useState<UpdateCourseRequest>({
    course_name: '',
    grade_level: 10,
  });

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminCoursesApi.getAllCourses({ page: 1 });
      setCourses(data);
      setFilteredCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Filter function
  useEffect(() => {
    let filtered = courses;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.course_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  const handleCreateCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      await adminCoursesApi.createCourse(newCourse);
      setOpenCreateDialog(false);
      setNewCourse({
        course_name: '',
        grade_level: 10,
      });
      await fetchCourses();
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      setLoading(true);
      setError(null);
      await adminCoursesApi.updateCourse(selectedCourse._id, editCourse);
      setOpenEditDialog(false);
      setSelectedCourse(null);
      await fetchCourses();
    } catch (err) {
      console.error('Error updating course:', err);
      setError(err instanceof Error ? err.message : 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      setLoading(true);
      setError(null);
      await adminCoursesApi.deleteCourse(selectedCourse._id);
      setOpenDeleteDialog(false);
      setSelectedCourse(null);
      await fetchCourses();
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCourseStatus = async (course: AdminCourse) => {
    try {
      setLoading(true);
      await adminCoursesApi.toggleCourseStatus(course._id);
      await fetchCourses();
    } catch (err) {
      console.error('Error toggling course status:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle course status');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (course: AdminCourse) => {
    setSelectedCourse(course);
    setEditCourse({
      course_name: course.course_name,
      grade_level: course.grade_level,
    });
    setOpenEditDialog(true);
  };

  const openDelete = (course: AdminCourse) => {
    setSelectedCourse(course);
    setOpenDeleteDialog(true);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default';
  };

  const getStatusLabel = (status: string) => {
    return status === 'active' ? 'Hoạt động' : 'Không hoạt động';
  };

  // Loading state
  if (loading && (!courses || courses.length === 0)) {
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
            Quản lý Khóa học
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý danh sách khóa học trong hệ thống
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Tạo khóa học
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm khóa học..."
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

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên khóa học</TableCell>
                <TableCell>Cấp độ</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <School color="primary" />
                        <Typography variant="body1" fontWeight="medium">
                          {course.course_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`Lớp ${course.grade_level}`} 
                        size="small" 
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(course.status)} 
                        size="small" 
                        color={getStatusColor(course.status) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(course.date_create).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color={course.status === 'active' ? 'warning' : 'success'}
                        onClick={() => handleToggleCourseStatus(course)}
                        title={course.status === 'active' ? 'Tắt khóa học' : 'Bật khóa học'}
                      >
                        {course.status === 'active' ? <ToggleOff /> : <ToggleOn />}
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => openEdit(course)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => openDelete(course)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      Không tìm thấy khóa học nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Course Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <School />
            <Typography variant="h6">Tạo khóa học mới</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tên khóa học"
              fullWidth
              required
              value={newCourse.course_name}
              onChange={(e) => setNewCourse({...newCourse, course_name: e.target.value})}
            />
            <TextField
              label="Cấp độ (Lớp)"
              type="number"
              fullWidth
              required
              value={newCourse.grade_level}
              onChange={(e) => setNewCourse({...newCourse, grade_level: parseInt(e.target.value)})}
              inputProps={{ min: 1, max: 12 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateCourse}
            disabled={!newCourse.course_name || loading}
          >
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
        <DialogContent>
          {selectedCourse && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Tên khóa học"
                fullWidth
                value={editCourse.course_name}
                onChange={(e) => setEditCourse({...editCourse, course_name: e.target.value})}
              />
              <TextField
                label="Cấp độ (Lớp)"
                type="number"
                fullWidth
                value={editCourse.grade_level}
                onChange={(e) => setEditCourse({...editCourse, grade_level: parseInt(e.target.value)})}
                inputProps={{ min: 1, max: 12 }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleEditCourse} disabled={loading}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Hành động này sẽ xóa vĩnh viễn khóa học và TẤT CẢ dữ liệu liên quan!
          </Alert>
          <Typography>
            Bạn có chắc chắn muốn xóa khóa học <strong>{selectedCourse?.course_name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tất cả topics, classes, materials liên quan sẽ bị xóa.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDeleteCourse} disabled={loading}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCourses;
