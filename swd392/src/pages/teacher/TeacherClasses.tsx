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
import ClassTableRow, {
  type ClassTableRowProps,
} from "../../components/teacher/ClassTableRow";

const TeacherClasses = () => {
  const classes: ClassTableRowProps[] = [
    {
      title: "Hóa học 9A",
      courseCode: "Chemistry 9 - 2022",
      studentCount: 32,
      createdAt: "12/09/2025",
      classKey: "CH9A-2025-KEY",
      classId: "ch9a-2025",
    },
    {
      title: "Toán nâng cao 11",
      courseCode: "Mathematics 11 - 2023",
      studentCount: 28,
      createdAt: "03/01/2026",
      classKey: "MATH11-2023-KEY",
      classId: "math11-2023",
    },
    {
      title: "Vật lý chuyên 10",
      courseCode: "Physics 10 - 2024",
      studentCount: 25,
      createdAt: "18/11/2025",
      classKey: "PHY10-2024-KEY",
      classId: "phy10-2024",
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
              <ClassTableRow key={classItem.courseCode} {...classItem} />
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default TeacherClasses;
