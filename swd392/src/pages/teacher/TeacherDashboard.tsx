import { Fragment } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";

const TeacherDashboard = () => {
  type ProgressCard = {
    course: string;
    progress: number;
    classes: string;
  };

  type ScheduleSlot = {
    slot: string;
    time: string;
    course: string;
    topic: string;
    place: string;
  };

  type DueAssignment = {
    course: string;
    unit: string;
    dueDate: string;
    completionRate: number;
    status: "waiting" | "ready" | "graded";
  };

  type UploadedFile = {
    file: string;
    course: string;
    createdAt: string;
  };

  type GradeSummary = {
    title: string;
    course: string;
    category: string;
    score: string;
  };

  type Announcement = {
    title: string;
    detail: string;
    timestamp: string;
  };

  const courseProgress: ProgressCard[] = [
    { course: "Math 101", progress: 63, classes: "5 classes" },
    { course: "Math 102", progress: 45, classes: "3 classes" },
    { course: "Math 103", progress: 33, classes: "4 classes" },
    { course: "Math 104", progress: 25, classes: "2 classes" },
  ];

  const schedule: ScheduleSlot[] = [
    {
      slot: "Slot 3",
      time: "10:45 AM - 11:30 AM",
      course: "Math 101",
      topic: "Unit 33: Simple equations",
      place: "Classroom 3a",
    },
    {
      slot: "Slot 4",
      time: "12:00 PM - 12:45 PM",
      course: "Math 101",
      topic: "Unit 33: Multiple numbers",
      place: "Classroom 3b",
    },
    {
      slot: "Slot 5",
      time: "02:00 PM - 02:45 PM",
      course: "Math 103",
      topic: "Unit 12: Algebraic expressions",
      place: "Classroom 2a",
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

  const uploadedFiles: UploadedFile[] = [
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

  const gradeSummary: GradeSummary[] = [
    {
      title: "Attendance",
      course: "Math 101",
      category: "Classwork",
      score: "4 / 5",
    },
    {
      title: "Assignment",
      course: "Math 104",
      category: "Homework",
      score: "8.4 / 10",
    },
    {
      title: "Quiz",
      course: "Math 103",
      category: "Quiz",
      score: "14 / 15",
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
          <Grid size={{ xs: 6, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Courses progress</Typography>
                <Typography variant="body2" color="text.secondary"></Typography>
              </Stack>
              <Grid container spacing={2}>
                {courseProgress.map((course) => (
                  <Grid key={course.course} size={{ xs: 6, md: 4 }}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, textAlign: "center", height: "100%" }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          display: "inline-flex",
                          mb: 1,
                        }}
                      >
                        <CircularProgress
                          variant="determinate"
                          value={course.progress}
                          size={80}
                          thickness={4}
                          color="primary"
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: "absolute",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight={600}>
                            {course.progress}%
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {course.course}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {course.classes}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Today schedule</Typography>
                <Typography variant="caption" color="text.secondary">
                  3 slots
                </Typography>
              </Stack>
              <List disablePadding>
                {schedule.map((slot, index) => (
                  <ListItem
                    key={`${slot.slot}-${index}`}
                    alignItems="flex-start"
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      mb: index === schedule.length - 1 ? 0 : 2,
                      px: 2,
                      py: 2,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            {slot.slot} | {slot.time}
                          </Typography>
                          <Chip label={slot.course} size="small" />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5} mt={1}>
                          <Typography variant="body2" fontWeight={600}>
                            {slot.topic}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Place: {slot.place}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
              <Typography variant="body2" color="text.secondary" mt={2}>
                Your day ends here :) Enjoy your day.
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 6, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">What's due</Typography>
                <Button variant="text" size="small">
                  All courses
                </Button>
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Course | Topic</TableCell>
                    <TableCell>Due date</TableCell>
                    <TableCell>Subm. rate</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dueAssignments.map((item) => (
                    <TableRow key={item.course} hover>
                      <TableCell>
                        <Typography variant="subtitle2">
                          {item.course}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.unit}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.dueDate}</TableCell>
                      <TableCell>{item.completionRate}%</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            item.status === "waiting"
                              ? "Waiting submissions"
                              : item.status === "ready"
                                ? "Ready for grading"
                                : "Graded successfully"
                          }
                          color={statusColorMap[item.status]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <MoreVert fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Latest grades</Typography>
                <Button variant="text" size="small">
                  + New
                </Button>
              </Stack>
              <Stack spacing={2}>
                {gradeSummary.map((grade) => (
                  <Paper key={grade.title} variant="outlined" sx={{ p: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="subtitle2">
                          {grade.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {grade.course} · {grade.category}
                        </Typography>
                      </Box>
                      <Typography variant="h6">{grade.score}</Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 6, md: 8 }}>
            <Paper sx={{ p: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Latest uploaded files</Typography>
                <Button variant="text" size="small">
                  All courses
                </Button>
              </Stack>
              <List disablePadding>
                {uploadedFiles.map((file, index) => (
                  <Fragment key={file.file}>
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end">
                          <MoreVert />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            {file.file}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {file.course} · {file.createdAt}
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < uploadedFiles.length - 1 && (
                      <Divider component="li" />
                    )}
                  </Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Announcements</Typography>
                <Button variant="contained" size="small">
                  + New
                </Button>
              </Stack>
              <Stack spacing={2}>
                {announcements.map((item) => (
                  <Paper key={item.title} variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2">{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {item.detail}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.timestamp}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default TeacherDashboard;
