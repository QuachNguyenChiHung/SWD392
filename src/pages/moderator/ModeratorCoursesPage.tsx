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
  IconButton,
  CircularProgress,
  Breadcrumbs,
  Chip,
  Tooltip,
} from "@mui/material";
import { Visibility, NavigateNext } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAllCourses } from "../../services/moderatorService";

const ModeratorCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await getAllCourses();
      setCourses(res || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách khóa học:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <Box p={3}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
        <Typography color="text.primary">Kiểm duyệt</Typography>
        <Typography color="text.primary">Danh sách khóa học</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight="bold" mb={3}>
        Xem Khóa học (Kiểm duyệt viên)
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên khóa học</TableCell>
                <TableCell>Khối lớp</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Chưa có khóa học nào.
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell sx={{ fontWeight: "medium" }}>
                      {course.course_name}
                    </TableCell>
                    <TableCell>Lớp {course.grade_level}</TableCell>
                    <TableCell>
                      <Chip
                        label={course.status === "active" ? "Hoạt động" : "Ẩn"}
                        color={course.status === "active" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem các chủ đề">
                        <IconButton
                          color="info"
                          onClick={() => navigate(`/moderator/courses/${course._id}/topics`)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ModeratorCoursesPage;
