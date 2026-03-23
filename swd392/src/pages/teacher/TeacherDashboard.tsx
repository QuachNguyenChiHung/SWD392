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
import {
  sectionTitle,
  flatCard,
  flatButtonContained,
  tableContainer,
  tableHeadRow,
  loadingContainer,
  COLORS,
} from "./teacherStyles";
import StudentPageShell from "../../components/student/StudentPageShell";

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
      <Box sx={loadingContainer}>
        <CircularProgress sx={{ color: COLORS.accent }} />
      </Box>
    );
  }

  return (
    <StudentPageShell
      title="Dashboard Giáo viên"
      subtitle="Quản lý lớp học, bài kiểm tra và học liệu trong cùng một giao diện thống nhất"
      chipLabel="Khu vực giáo viên"
    >
      <Stack spacing={3}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container direction="column" spacing={3}>
              {/* Class Stats */}
              <Grid size={{ xs: 12 }}>
                <Paper elevation={0} sx={flatCard}>
                  <Typography sx={sectionTitle}>
                    Thống kê lớp học
                  </Typography>
                  {classProgress.length === 0 ? (
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
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
                <Paper elevation={0} sx={flatCard}>
                  <Typography sx={sectionTitle}>
                    Bài kiểm tra
                  </Typography>
                  {quizzes.length === 0 ? (
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                      Chưa có bài kiểm tra nào.
                    </Typography>
                  ) : (
                    <TableContainer sx={tableContainer}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={tableHeadRow}>
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
                <Paper elevation={0} sx={flatCard}>
                  <Typography sx={sectionTitle}>
                    Tệp đã tải lên gần đây
                  </Typography>
                  {files.length === 0 ? (
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
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
            <Paper elevation={0} sx={flatCard}>
              <Typography sx={sectionTitle}>
                Thao tác nhanh
              </Typography>
              <Stack spacing={2}>
                <Box
                  sx={{
                    p: 2,
                    border: `1px solid ${COLORS.border}`,
                    borderLeft: `3px solid ${COLORS.accent}`,
                    borderRadius: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box>
                    <Typography
                      sx={{ fontWeight: 700, fontSize: "0.85rem", color: COLORS.textDark }}
                    >
                      Tạo lớp học mới
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.8rem", color: COLORS.textSecondary, mt: 0.25 }}
                    >
                      Tạo lớp học mới với tài liệu.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate("/teacher/classes")}
                    sx={flatButtonContained}
                  >
                    Tạo lớp
                  </Button>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    border: `1px solid ${COLORS.border}`,
                    borderLeft: `3px solid ${COLORS.accent}`,
                    borderRadius: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box>
                    <Typography
                      sx={{ fontWeight: 700, fontSize: "0.85rem", color: COLORS.textDark }}
                    >
                      Xem tất cả khóa học
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.8rem", color: COLORS.textSecondary, mt: 0.25 }}
                    >
                      Duyệt danh sách khóa học bạn quản lý.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => navigate("/teacher/courses")}
                    sx={flatButtonContained}
                  >
                    Khóa học
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </StudentPageShell>
  );
};

export default TeacherDashboard;
