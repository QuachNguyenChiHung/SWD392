import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Grid,
  List,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import CourseProgressCard from "../../components/dashboard/CourseProgressCard";
import DueAssignmentRow from "../../components/dashboard/DueAssignmentRow";
import UploadedFileItem from "../../components/dashboard/UploadedFileItem";
import type {
  ClassCompletionStat,
  UploadedFileRecord,
  DueAssignment,
} from "../../types/teacherType";
import {
  classCompletionStats,
  quickActions,
  dueAssignments,
  uploadedFiles,
  teacherClasses,
  getTopicsByClassId,
  getAllMaterials
} from "../../../data/teacherMockData";

const TeacherDashboard = () => {
  const navigate = useNavigate();

  // Handle navigation to quiz/material preview
  const handleDueAssignmentClick = (assignment: DueAssignment) => {
    // Find the material from all classes
    const allMaterials = getAllMaterials();
    const material = allMaterials.find(material => material.material_id === assignment.material_id);

    if (material && material.type === 'quiz') {
      navigate('/teacher/display-quiz', {
        state: { material }
      });
    }
  };

  // Handle navigation to file preview
  const handleFileClick = (file: UploadedFileRecord) => {
    // Find the material from all classes
    const allMaterials = getAllMaterials();
    const material = allMaterials.find(material => material.material_id === file.file_id);

    if (material) {
      if (material.type === 'slide') {
        navigate('/teacher/display-slide', {
          state: { material }
        });
      } else if (material.type === 'file') {
        // Handle file download or view
        console.log('Open file:', file);
      }
    }
  };

  // Handle navigation to class detail
  const handleClassProgressClick = (stat: ClassCompletionStat) => {
    // Find the class by course name
    const targetClass = teacherClasses.find(cls => cls.course_name === stat.course);
    if (targetClass) {
      navigate(`/teacher/class/${targetClass.class_id}`, {
        state: {
          classDetail: targetClass,
          materials: getTopicsByClassId(targetClass.class_id)
        }
      });
    }
  };

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
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Class progress</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Students who finished all materials
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      display: "grid",
                      gridAutoFlow: "column",
                      gridAutoColumns: "minmax(240px, 260px)",
                      gap: 2,
                      overflowX: "auto",
                      width: "100%",
                      pb: 1,
                    }}
                  >
                    {classCompletionStats.map((stat) => (
                      <CourseProgressCard
                        key={stat.course}
                        {...stat}
                        onClick={() => handleClassProgressClick(stat)}
                      />
                    ))}
                  </Box>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">What's due</Typography>
                    <Button variant="text" size="small">
                      Up coming class material
                    </Button>
                  </Stack>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Quiz</TableCell>
                        <TableCell>Available</TableCell>
                        <TableCell>End date</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dueAssignments.map((item) => (
                        <DueAssignmentRow
                          key={item.quiz_id}
                          assignment={item}
                          onClick={() => handleDueAssignmentClick(item)}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Latest uploaded files</Typography>
                    <Button variant="text" size="small">
                      View all files
                    </Button>
                  </Stack>
                  <List disablePadding>
                    {uploadedFiles.map((file, index) => (
                      <UploadedFileItem
                        key={file.file}
                        file={file}
                        showDivider={index < uploadedFiles.length - 1}
                        onClick={() => handleFileClick(file)}
                      />
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Grid container direction="column" spacing={3}>
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Quick actions</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {quickActions.length} items
                    </Typography>
                  </Stack>
                  <Stack spacing={2}>
                    {quickActions.map((action) => (
                      <Paper
                        key={action.title}
                        variant="outlined"
                        sx={{
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          flexWrap: "wrap",
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {action.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {action.description}
                          </Typography>
                        </Box>
                        <Button variant="contained" size="small">
                          {action.actionLabel}
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default TeacherDashboard;
