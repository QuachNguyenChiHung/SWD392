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
  Avatar,
  Stack,
} from "@mui/material";
import { Visibility, NavigateNext, MenuBook } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getAllCourses } from "../../services/moderatorService";
import dayjs from "dayjs";

const ModeratorCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await getAllCourses();
      // Ensure res is an array or has a courses array property depending on API response
      const data = res?.data || res?.courses || res || [];
      setCourses(Array.isArray(data) ? data : []);
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
        <Typography color="text.primary" fontWeight="medium">Danh sách khóa học</Typography>
      </Breadcrumbs>

      <Typography variant="h5" fontWeight="bold" mb={3} sx={{ color: "primary.main" }}>
        Trang Khóa học (Kiểm duyệt viên)
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ bgcolor: "grey.100" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Khóa học</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Khối lớp</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Ngày tạo</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Chưa có khóa học nào.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course._id} hover sx={{ transition: "0.2s" }}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.light", color: "primary.dark" }}>
                          <MenuBook />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {course.course_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {course._id?.substring(course._id.length - 6).toUpperCase()}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={`Lớp ${course.grade_level}`} size="small" variant="outlined" color="primary" />
                    </TableCell>
                    <TableCell>
                      {course.date_create ? dayjs(course.date_create).format("DD/MM/YYYY") : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={course.status === "active" ? "Hoạt động" : course.status === "inactive" ? "Đã ẩn" : "Không xác định"}
                        color={course.status === "active" ? "success" : "default"}
                        size="small"
                        sx={{ fontWeight: "medium" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xem các chủ đề (Topics)">
                        <IconButton
                          color="info"
                          onClick={() => navigate(`/moderator/courses/${course._id}/topics`)}
                          sx={{ bgcolor: "info.light", color: "info.dark", "&:hover": { bgcolor: "info.main", color: "white" } }}
                        >
                          <Visibility fontSize="small" />
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
