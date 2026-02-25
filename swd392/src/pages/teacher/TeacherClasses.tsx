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
import CourseTopicTable from "../../components/CourseTopicTable";
import type { Class, Course } from "../../types/teacherType";
import { useState } from "react";
import { teacherClasses, courseOptions } from "../../../data/teacherMockData";

const TeacherClasses = () => {
  const classes: (Class & { studentCount: number })[] = teacherClasses;
  const [modalClassCreation, setModalClassCreation] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [className, setClassName] = useState("");

  const handleModalClose = () => {
    setModalClassCreation(false);
    setSelectedCourse(null);
    setClassName("");
  };

  const handleCreateClass = () => {
    if (!className.trim()) {
      alert("Vui lòng nhập tên lớp học");
      return;
    }
    if (!selectedCourse) {
      alert("Vui lòng chọn khóa học");
      return;
    }

    // TODO: Implement API call to create class
    console.log("Creating class:", {
      name: className,
      course: selectedCourse
    });

    handleModalClose();
  };
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
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '80%', md: 700 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxHeight: '85vh',
          overflowY: 'auto'
        }}>
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
            Tạo lớp học mới
          </Typography>

          <Stack spacing={3}>
            <TextField
              label="Tên lớp học"
              variant="outlined"
              required
              fullWidth
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="VD: Hóa học 9A"
            />

            <Autocomplete
              fullWidth
              options={courseOptions}
              getOptionLabel={(option) => `${option.course_name} (Lớp ${option.grade_level})`}
              value={selectedCourse}
              onChange={(event, value) => setSelectedCourse(value)}
              renderInput={(params) =>
                <TextField
                  {...params}
                  label="Chọn khóa học"
                  variant="outlined"
                  required
                  placeholder="Tìm và chọn khóa học"
                />
              }
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">
                      {option.course_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Lớp {option.grade_level} • {option.topics?.length || 0} chủ đề
                    </Typography>
                  </Box>
                </Box>
              )}
            />

            {selectedCourse && (
              <Box>
                <Typography variant="body2" color="text.primary" gutterBottom>
                  <strong>Mô tả khóa học:</strong> {selectedCourse.description || "Chưa có mô tả"}
                </Typography>

                {selectedCourse.topics && selectedCourse.topics.length > 0 && (
                  <CourseTopicTable
                    topics={selectedCourse.topics}
                    courseName={selectedCourse.course_name}
                  />
                )}
              </Box>
            )}
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="end" sx={{ mt: 4 }}>
            <Button variant="outlined" onClick={handleModalClose}>
              Hủy
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateClass}
              disabled={!className.trim() || !selectedCourse}
            >
              Tạo lớp học
            </Button>
          </Stack>
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
