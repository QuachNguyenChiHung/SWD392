import { Box, Typography, Stack, Paper, Button, Grid } from "@mui/material";
import { School, Assignment, People, AutoAwesome } from "@mui/icons-material";
import ClassItem from "../../components/classObject";
import type { Class } from "../../types";

const TeacherDashboard = () => {
  const stats = [
    {
      label: "Lớp học quản lý",
      value: "3",
      icon: <School />,
      color: "#1976d2",
    },
    { label: "Học sinh", value: "87", icon: <People />, color: "#2e7d32" },
    { label: "Bài giảng", value: "24", icon: <Assignment />, color: "#ed6c02" },
    {
      label: "AI đã tạo",
      value: "15",
      icon: <AutoAwesome />,
      color: "#9c27b0",
    },
  ];

  const classes: Class[] = [
    {
      class_id: "1",
      class_name: "Hóa học 9-12.2-2024",
      keypass: "ABC123",
      course_id: "C1",
      teacher_id: "T1",
      img_cover_link: "",
      keywords: "hóa 9, cơ bản",
      date_create: new Date("2024-12-02"),
      status: "active",
    },
    {
      class_id: "2",
      class_name: "Hóa học 10-Nâng cao",
      keypass: "CHEM10",
      course_id: "C2",
      teacher_id: "T1",
      img_cover_link: "",
      keywords: "hóa 10, nâng cao, bảng tuần hoàn",
      date_create: new Date("2025-01-15"),
      status: "active",
    },
    {
      class_id: "3",
      class_name: "Hóa học 11-Hữu cơ",
      keypass: "ORG11",
      course_id: "C3",
      teacher_id: "T1",
      img_cover_link: "",
      keywords: "hóa 11, hữu cơ, hydrocarbon",
      date_create: new Date("2025-02-01"),
      status: "active",
    },
    {
      class_id: "4",
      class_name: "Hóa học 12-Luyện thi",
      keypass: "EXAM12",
      course_id: "C4",
      teacher_id: "T1",
      img_cover_link: "",
      keywords: "hóa 12, luyện thi, đại học",
      date_create: new Date("2025-03-10"),
      status: "active",
    },
    {
      class_id: "5",
      class_name: "Hóa học 10-Cơ bản 2025",
      keypass: "BASE10",
      course_id: "C5",
      teacher_id: "T1",
      img_cover_link: "",
      keywords: "hóa 10, cơ bản, nguyên tử",
      date_create: new Date("2025-06-20"),
      status: "inactive",
    },
    {
      class_id: "6",
      class_name: "Hóa học 9-Ôn tập HK1",
      keypass: "REV9HK",
      course_id: "C6",
      teacher_id: "T1",
      img_cover_link: "",
      keywords: "hóa 9, ôn tập, học kỳ 1",
      date_create: new Date("2024-09-05"),
      status: "archived",
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

      <Stack spacing={3} direction="row" flexWrap="wrap" sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Box key={index} sx={{ flex: "1 1 200px", minWidth: 200 }}>
            <Paper
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                backgroundColor: stat.color,
                color: "white",
              }}
            >
              <Box sx={{ fontSize: 40, mb: 1 }}>{stat.icon}</Box>
              <Typography variant="h4" fontWeight="bold">
                {stat.value}
              </Typography>
              <Typography variant="body2">{stat.label}</Typography>
            </Paper>
          </Box>
        ))}
      </Stack>

      <Stack spacing={3} direction={{ xs: "column", md: "row" }}>
        <Box sx={{ flex: 2 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Danh sách lớp học
            </Typography>
            <Grid
              container
              spacing={{ xs: 2, md: 3 }}
              columns={{ xs: 4, sm: 8, md: 12 }}
            >
              {classes.map((cls, index) => (
                <Grid key={index} size={{ xs: 2, sm: 4, md: 6 }}>
                  <ClassItem cls={cls} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hoạt động nhanh
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mb: 2 }}
            >
              Tạo lớp học mới
            </Button>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ mb: 2 }}
            >
              Tạo bài giảng mới
            </Button>
            <Button variant="contained" color="success" fullWidth>
              Quản lý học sinh
            </Button>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
};

export default TeacherDashboard;
