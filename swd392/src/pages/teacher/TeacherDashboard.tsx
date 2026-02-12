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
import type {
  Announcement,
  ClassCompletionStat,
  DueAssignment,
  UploadedFileRecord,
} from "../../types";

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
      course: "Math 101",
      unit: "Unit 2: Add and subtract numbers",
      dueDate: "23 Dec 2017",
      completionRate: 69,
      status: "waiting",
    },
    {
      course: "Math 102",
      unit: "Unit 2: Motion and forces",
      dueDate: "20 Dec 2017",
      completionRate: 98,
      status: "ready",
    },
    {
      course: "Math 104",
      unit: "Linear equations",
      dueDate: "13 Dec 2017",
      completionRate: 100,
      status: "graded",
    },
  ];

  const uploadedFiles: UploadedFileRecord[] = [
    {
      file: "ClassPresentation.PDF",
      course: "Math 101 | Unit 2",
      createdAt: "12 Dec 2017",
    },
    {
      file: "Slideshow 22Dec.PPT",
      course: "Math 102 | Unit 2",
      createdAt: "09 Dec 2017",
    },
    {
      file: "Solving Sheet.XLS",
      course: "Math 104 | Linear equations",
      createdAt: "08 Dec 2017",
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

  const statusColorMap: Record<
    DueAssignment["status"],
    "warning" | "success" | "default"
  > = {
    waiting: "warning",
    ready: "default",
    graded: "success",
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
                      pr: 1,
                      pb: 1,
                      scrollSnapType: "x mandatory",
                      "&::-webkit-scrollbar": { height: 8 },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "rgba(0,0,0,0.08)",
                        borderRadius: 999,
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(25, 118, 210, 0.6)",
                        borderRadius: 999,
                      },
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
                        <TableCell>Class material</TableCell>
                        <TableCell>Due date</TableCell>
                        <TableCell>Subm. rate</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dueAssignments.map((item) => (
                        <DueAssignmentRow
                          key={item.course}
                          assignment={item}
                          statusColor={statusColorMap[item.status]}
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
