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
  Tooltip,
} from "@mui/material";
import { Visibility, NavigateNext } from "@mui/icons-material";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getTopicsByCourse } from "../../services/moderatorService";

const ModeratorTopicsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<any[]>([]);
  const [courseInfo, setCourseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await getTopicsByCourse(courseId);
      setTopics(res.topics || []);
      setCourseInfo({
        course_name: res.course_name,
        grade_level: res.grade_level
      });
    } catch (err) {
      console.error("Lỗi khi tải danh sách chủ đề:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [courseId]);

  return (
    <Box p={3}>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
        <Link to="/moderator/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
          Kiểm duyệt
        </Link>
        <Link to="/moderator/courses" style={{ textDecoration: "none", color: "inherit" }}>
           Khóa học
        </Link>
        <Typography color="text.primary">Chủ đề (Topics)</Typography>
      </Breadcrumbs>

      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Xem Chủ đề (Kiểm duyệt viên)
        </Typography>
        {courseInfo && (
            <Typography variant="body2" color="text.secondary">
                Khóa học: {courseInfo.course_name} - Lớp {courseInfo.grade_level}
            </Typography>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên chủ đề</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Chưa có chủ đề nào trong khóa học này.
                  </TableCell>
                </TableRow>
              ) : (
                topics.map((topic) => (
                  <TableRow key={topic._id}>
                    <TableCell sx={{ fontWeight: "medium" }}>
                      {topic.title}
                    </TableCell>
                    <TableCell>{topic.description || "-"}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Xem các tài liệu">
                        <IconButton
                          color="info"
                          onClick={() => navigate(`/moderator/topics/${topic._id}/materials`)}
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

export default ModeratorTopicsPage;
