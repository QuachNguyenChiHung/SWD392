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
  Modal,
  TextField,
  Autocomplete,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import ClassTableRow from "../../components/teacher/ClassTableRow";
import type { Class } from "../../types/teacherType";
import { useState } from "react";
import style from "@mui/system/style";

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
  const classOption = [
    { label: "didi oi", id: "6767676767", desc: "didi oi desc" },
    { label: "history of epstein files", id: "69100", desc: "history of epstein files desc" },
  ];
  const [modalClassCreation, setModalClassCreation] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);//mốt thay any thành course type(Hùng)
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
        <Button variant="contained" startIcon={<Add />} onClick={() => setModalClassCreation(true)}>
          Tạo lớp học mới
        </Button>
      </Box>
      <Modal
        open={modalClassCreation}
        onClose={() => setModalClassCreation(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        autoCorrect="true"
      >
        <Box className="modal">
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Tạo lớp học mới
          </Typography>
          <div className="text-input-container">
            <TextField id="standard-basic" label="Mật khẩu lớp học" variant="standard" />
            <TextField id="standard-basic" label="Tên lớp học" variant="standard" required />
            <Autocomplete style={{ flex: '0 0 100%' }} options={classOption}
              onChange={(event, value) => {
                let matchedCourse = classOption.find(course => course.label === value?.label);
                if (matchedCourse) {
                  setSelectedCourse(matchedCourse);
                } else {
                  setSelectedCourse(null);
                }
              }}
              renderInput={(params) =>
                <TextField {...params} id="standard-basic" label="Tên khóa học" variant="standard" required />}
            />
            <Typography variant="body2" color="text.primary" mt={1}>
              Mô tả môn học :{selectedCourse ? selectedCourse.desc : "Chọn khóa học để xem mô tả"}
            </Typography>
          </div>

        </Box>
      </Modal>
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
