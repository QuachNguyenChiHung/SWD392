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
import CourseProgressCard from "../../components/dashboard/CourseProgressCard";
import DueAssignmentRow from "../../components/dashboard/DueAssignmentRow";
import UploadedFileItem from "../../components/dashboard/UploadedFileItem";
import AnnouncementCard from "../../components/dashboard/AnnouncementCard";
import type { Announcement } from "../../types";
import type {
  ClassCompletionStat,
  UploadedFileRecord,
  DueAssignment,
} from "../../types/teacherType";

const TeacherDashboard = () => {
  const classCompletionStats: ClassCompletionStat[] = [
    { course: "Math 101", completed: 26, enrolled: 30 },
    { course: "Math 102", completed: 18, enrolled: 24 },
    { course: "Math 103", completed: 14, enrolled: 20 },
    { course: "Math 104", completed: 10, enrolled: 18 },
  ];

  type QuickAction = {
    title: string;
    description: string;
    actionLabel: string;
  };

  const quickActions: QuickAction[] = [
    {
      title: "Create a new class",
      description: "Set up a fresh class workspace with materials.",
      actionLabel: "Create class",
    },
    {
      title: "View all courses",
      description: "Browse the current course catalog you manage.",
      actionLabel: "Course list",
    },
  ];

  const dueAssignments: DueAssignment[] = [
    {
      quiz_id: 101,
      material_id: 501,
      title: "Reaction rates quiz",
      keyword: "rates",
      type: "quiz",
      available_date: new Date("2026-02-12"),
      max_attempt_number: 3,
      end_date: new Date("2026-02-20"),
      status: true,
    },
    {
      quiz_id: 102,
      material_id: 502,
      title: "Stoichiometry check-in",
      keyword: "mole",
      type: "quiz",
      available_date: new Date("2026-02-14"),
      max_attempt_number: 2,
      end_date: new Date("2026-02-22"),
      status: false,
    },
    {
      quiz_id: 103,
      material_id: 503,
      title: "Lab safety essentials",
      keyword: null,
      type: "quiz",
      available_date: new Date("2026-02-15"),
      max_attempt_number: null,
      end_date: new Date("2026-02-25"),
      status: true,
    },
  ];

  const uploadedFiles: UploadedFileRecord[] = [
    {
      file: "ClassPresentation.PDF",
      course: "Math 101 | Unit 2",
      createdAt: "12 Dec 2017",
      file_id: 201,
      file_name: "ClassPresentation.PDF",
      file_path: "/files/math101/class-presentation.pdf",
    },
    {
      file: "Slideshow 22Dec.PPT",
      course: "Math 102 | Unit 2",
      createdAt: "09 Dec 2017",
      file_id: 202,
      file_name: "Slideshow 22Dec.PPT",
      file_path: "/files/math102/slideshow-22dec.ppt",
    },
    {
      file: "Solving Sheet.XLS",
      course: "Math 104 | Linear equations",
      createdAt: "08 Dec 2017",
      file_id: 203,
      file_name: "Solving Sheet.XLS",
      file_path: "/files/math104/solving-sheet.xls",
    },
  ];

  const announcements: Announcement[] = [
    {
      title: "Midterm review uploaded",
      detail: "Check the shared drive for the latest midterm guides.",
      timestamp: "5m ago",
    },
    {
      title: "Class photo day",
      detail: "Remember to wear uniforms on Thursday.",
      timestamp: "1h ago",
    },
  ];

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
                    <Typography variant="h6">Courses progress</Typography>
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
                      <CourseProgressCard key={stat.course} {...stat} />
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
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Announcements</Typography>
                  </Stack>
                  <Stack spacing={2}>
                    {announcements.map((item) => (
                      <AnnouncementCard key={item.title} announcement={item} />
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
