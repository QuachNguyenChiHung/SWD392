import {
  Box,
  Typography,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import ClassTableRow from "../../components/teacher/ClassTableRow";
import type { Class } from "../../types/teacherType";

const TeacherClasses = () => {
  const classes: (Class & { studentCount: number })[] = [
    {
      class_id: "ch9a-2025",
      class_name: "Hóa học 9A",
      keypass: "CH9A-2025-KEY",
      course_id: "chem9-2022",
      course_name: "Chemistry 9 - 2022",
      teacher_id: "teacher-001",
      img_cover_link: "/images/chemistry.jpg",
      keywords: "chemistry, reactions, lab",
      date_create: new Date("2025-09-12"),
      status: "active",
      studentCount: 32,
    },
    {
      class_id: "math11-2023",
      class_name: "Toán nâng cao 11",
      keypass: "MATH11-2023-KEY",
      course_id: "math11-2023",
      course_name: "Mathematics 11 - 2023",
      teacher_id: "teacher-001",
      img_cover_link: "/images/math.jpg",
      keywords: "mathematics, advanced, calculus",
      date_create: new Date("2026-01-03"),
      status: "active",
      studentCount: 28,
    },
    {
      class_id: "phy10-2024",
      class_name: "Vật lý chuyên 10",
      keypass: "PHY10-2024-KEY",
      course_id: "physics10-2024",
      course_name: "Physics 10 - 2024",
      teacher_id: "teacher-001",
      img_cover_link: "/images/physics.jpg",
      keywords: "physics, mechanics, forces",
      date_create: new Date("2025-11-18"),
      status: "active",
      studentCount: 25,
    },
  ];

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Quản lý lớp học
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          Tạo lớp học mới
        </Button>
      </Box>

      <Stack spacing={1} mb={2}>
        <Typography variant="subtitle1" color="text.secondary">
          Theo dõi mã lớp học, sĩ số, ngày khởi tạo và khóa truy cập (ẩn mặc
          định).
        </Typography>
      </Stack>

      <Paper sx={{ width: "100%", overflowX: "auto" }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Lớp học</TableCell>
              <TableCell>Học sinh</TableCell>
              <TableCell>Ngày khởi tạo</TableCell>
              <TableCell>Khóa lớp</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classes.map((classItem) => (
              <ClassTableRow key={classItem.class_id} {...classItem} />
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default TeacherClasses;
