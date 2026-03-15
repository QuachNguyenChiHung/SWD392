import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Grid,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CourseProgressCard from "../../components/dashboard/CourseProgressCard";
import DueAssignmentRow from "../../components/dashboard/DueAssignmentRow";
import type { QuizMaterial } from "../../components/dashboard/DueAssignmentRow";
import UploadedFileItem from "../../components/dashboard/UploadedFileItem";
import type { FileMaterial } from "../../components/dashboard/UploadedFileItem";
import { apiService } from "../../services/api";
import classMaterialApi from "../../services/teacherApi/classMaterialApi";

type ClassProgress = {
  name: string;
  completed: number;
  total: number;
};

const TeacherDashboard = () => {
  const navigate = useNavigate();

  const [classProgress, setClassProgress] = useState<ClassProgress[]>([]);
  const [quizzes, setQuizzes] = useState<QuizMaterial[]>([]);
  const [files, setFiles] = useState<FileMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardRes, quizRes, fileRes] = await Promise.all([
          apiService.get("/dashboard"),
          classMaterialApi.getTeacherQuizzes(),
          classMaterialApi.getTeacherFiles(),
        ]);

        setClassProgress(dashboardRes.classProgress ?? []);
        setQuizzes((quizRes as QuizMaterial[]) ?? []);
        setFiles((fileRes as FileMaterial[]) ?? []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard Giáo viên
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Quản lý lớp học và tạo nội dung học tập
      </Typography>
      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container direction="column" spacing={3}>
              {/* Class Stats */}
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Thống kê lớp học
                  </Typography>
                  {classProgress.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có lớp học nào.
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {classProgress.map((cp) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cp.name}>
                          <CourseProgressCard
                            name={cp.name}
                            completed={cp.completed}
                            total={cp.total}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Paper>
              </Grid>

              {/* Quizzes */}
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Bài kiểm tra
                  </Typography>
                  {quizzes.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có bài kiểm tra nào.
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Tiêu đề</TableCell>
                            <TableCell>Ngày tạo</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell align="right" />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {quizzes.slice(0, 5).map((quiz) => (
                            <DueAssignmentRow
                              key={quiz._id}
                              quiz={quiz}
                              onClick={() => navigate(`/teacher/class/${quiz.class_assign_id}/materials/${quiz._id}`)}
                            />
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Paper>
              </Grid>

              {/* Uploaded Files */}
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Tệp đã tải lên gần đây
                  </Typography>
                  {files.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Chưa có tệp nào được tải lên.
                    </Typography>
                  ) : (
                    <List disablePadding>
                      {files.slice(0, 5).map((file, idx) => (
                        <UploadedFileItem
                          key={file._id}
                          file={file}
                          showDivider={idx < Math.min(files.length, 5) - 1}
                          onClick={() => navigate(`/teacher/class/${file.class_assign_id}/materials/${file._id}`)}
                        />
                      ))}
                    </List>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Quick Actions Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Thao tác nhanh
              </Typography>
              <Stack spacing={2}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Tạo lớp học mới</Typography>
                    <Typography variant="body2" color="text.secondary">Tạo lớp học mới với tài liệu.</Typography>
                  </Box>
                  <Button variant="contained" size="small" onClick={() => navigate("/teacher/classes")}>
                    Tạo lớp
                  </Button>
                </Paper>
                <Paper
                  variant="outlined"
                  sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>Xem tất cả khóa học</Typography>
                    <Typography variant="body2" color="text.secondary">Duyệt danh sách khóa học bạn quản lý.</Typography>
                  </Box>
                  <Button variant="contained" size="small" onClick={() => navigate("/teacher/courses")}>
                    Khóa học
                  </Button>
                </Paper>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default TeacherDashboard;
