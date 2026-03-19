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
  Avatar,
  Stack,
  Chip,
} from "@mui/material";
import { Visibility, NavigateNext, Topic as TopicIcon } from "@mui/icons-material";
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
          <Typography color="text.secondary" sx={{ "&:hover": { textDecoration: "underline" } }}>Kiểm duyệt</Typography>
        </Link>
        <Link to="/moderator/courses" style={{ textDecoration: "none", color: "inherit" }}>
          <Typography color="text.secondary" sx={{ "&:hover": { textDecoration: "underline" } }}>Danh sách khóa học</Typography>
        </Link>
        <Typography color="text.primary" fontWeight="medium">Chủ đề (Topics)</Typography>
      </Breadcrumbs>

      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: "primary.main" }}>
          Trang Chủ đề (Kiểm duyệt viên)
        </Typography>
        {courseInfo && (
          <Stack direction="row" spacing={1} mt={1} alignItems="center">
            <Typography variant="body1" color="text.secondary">
              Khóa học: <strong>{courseInfo.course_name}</strong>
            </Typography>
            <Chip label={`Lớp ${courseInfo.grade_level}`} size="small" color="primary" variant="outlined" />
          </Stack>
        )}
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ bgcolor: "grey.100" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Chủ đề</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Mô tả</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Chưa có chủ đề nào trong khóa học này.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                topics.map((topic, index) => (
                  <TableRow key={topic._id} hover sx={{ transition: "0.2s" }}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: "secondary.light", color: "secondary.dark" }}>
                          <TopicIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Chủ đề {index + 1}: {topic.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {topic._id?.substring(topic._id.length - 6).toUpperCase()}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <Tooltip title={topic.description || "Không có mô tả"}>
                        <span>{topic.description || "-"}</span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Xem các tài liệu trong Chủ đề">
                        <IconButton
                          color="info"
                          onClick={() => navigate(`/moderator/topics/${topic._id}/materials`)}
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

export default ModeratorTopicsPage;
