import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Stack,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit, Delete, Visibility, Add } from "@mui/icons-material";
import { Link } from "react-router-dom";
import {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
} from "../../services/managementApi";

const ModeratorCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<any>(null);
  const [formData, setFormData] = useState({ course_name: "", description: "" });
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" as "info" | "success" | "error" });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await getAllCourses();
      setCourses(res.data || []);
    } catch (err) {
      setSnack({ open: true, message: "Lỗi khi tải danh sách khóa học", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenDialog = (course?: any) => {
    if (course) {
      setCurrentCourse(course);
      setFormData({ course_name: course.course_name, description: course.description || "" });
    } else {
      setCurrentCourse(null);
      setFormData({ course_name: "", description: "" });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (currentCourse) {
        await updateCourse(currentCourse._id, formData);
        setSnack({ open: true, message: "Cập nhật khóa học thành công", severity: "success" });
      } else {
        await createCourse(formData);
        setSnack({ open: true, message: "Tạo khóa học mới thành công", severity: "success" });
      }
      setDialogOpen(false);
      fetchCourses();
    } catch (err: any) {
      setSnack({ open: true, message: err.message || "Lỗi khi lưu khóa học", severity: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khóa học này?")) {
      try {
        await deleteCourse(id);
        setSnack({ open: true, message: "Xóa khóa học thành công", severity: "success" });
        fetchCourses();
      } catch (err: any) {
        setSnack({ open: true, message: err.message || "Lỗi khi xóa khóa học", severity: "error" });
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleCourseStatus(id);
      fetchCourses();
    } catch (err: any) {
      setSnack({ open: true, message: "Lỗi khi thay đổi trạng thái", severity: "error" });
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Quản lý Khóa học</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Thêm khóa học
        </Button>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên khóa học</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell sx={{ fontWeight: "medium" }}>{course.course_name}</TableCell>
                  <TableCell>{course.description || "-"}</TableCell>
                  <TableCell>
                    <Chip 
                      label={course.status === "active" ? "Hoạt động" : "Ẩn"} 
                      color={course.status === "active" ? "success" : "default"}
                      size="small"
                      onClick={() => handleToggleStatus(course._id)}
                      sx={{ cursor: "pointer" }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton component={Link} to={`/moderator/courses/${course._id}/topics`} color="info" title="Xem Topic">
                      <Visibility />
                    </IconButton>
                    <IconButton color="primary" onClick={() => handleOpenDialog(course)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(course._id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Course Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{currentCourse ? "Chỉnh sửa khóa học" : "Thêm khóa học mới"}</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <TextField
              fullWidth
              label="Tên khóa học"
              variant="outlined"
              margin="normal"
              value={formData.course_name}
              onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Mô tả"
              variant="outlined"
              margin="normal"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>Lưu</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ModeratorCoursesPage;
