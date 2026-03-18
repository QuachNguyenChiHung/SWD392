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
  CircularProgress,
  Alert,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import ClassTableRow from "../../components/teacher/ClassTableRow";
import type { Class, Course, CreateClassData } from "../../types/teacherType";
import { useState, useEffect } from "react";
import { teacherClassApi } from "../../services/teacherApi/teacherClassApi";
import { courseApi } from "../../services/teacherApi/courseApi";

const TeacherClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalClassCreation, setModalClassCreation] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [className, setClassName] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [nextPageEmpty, setNextPageEmpty] = useState(false);
  const [nextPageData, setNextPageData] = useState<Class[]>([]);

  // Course states
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Fetch classes when page changes
  useEffect(() => {
    fetchClasses(page);
  }, [page]);

  const fetchClasses = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      // Fetch current page
      const currentPageClasses = await teacherClassApi.getClassesByTeacher(pageNum);
      setClasses(Array.isArray(currentPageClasses) ? currentPageClasses : []);

      // Prefetch next page
      const nextPageClasses = await teacherClassApi.getClassesByTeacher(pageNum + 1);
      setNextPageData(Array.isArray(nextPageClasses) ? nextPageClasses : []);
      setNextPageEmpty(!nextPageClasses || nextPageClasses.length === 0);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError('Không thể tải danh sách lớp học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      setError(null);
      const response = await courseApi.getActiveCourses(1);
      setCourses(response.courses || response || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Không thể tải danh sách khóa học. Vui lòng thử lại.');
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleModalOpen = async () => {
    setModalClassCreation(true);
    // Fetch courses when modal opens
    await fetchCourses();
  };

  const handleModalClose = () => {
    setModalClassCreation(false);
    setSelectedCourse(null);
    setClassName("");
    setClassDescription("");
    setCreating(false);
    setCourses([]);
    setError(null);
  };

  const handleCourseSelection = (course: Course | null) => {
    setSelectedCourse(course);
  };

  const handleCreateClass = async () => {
    if (!className.trim()) {
      alert("Vui lòng nhập tên lớp học");
      return;
    }
    if (!selectedCourse) {
      alert("Vui lòng chọn khóa học");
      return;
    }

    try {
      setCreating(true);

      const createData: CreateClassData = {
        class_name: className.trim(),
        description: classDescription.trim() || undefined,
        course_id: selectedCourse._id,
      };

      await teacherClassApi.createClass(createData);

      // Refresh classes list
      await fetchClasses();

      // Close modal and reset form
      handleModalClose();

    } catch (err) {
      console.error('Error creating class:', err);
      alert('Không thể tạo lớp học. Vui lòng thử lại.');
    } finally {
      setCreating(false);
    }
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
        <Button variant="contained" startIcon={<Add />} onClick={handleModalOpen}>
          Tạo lớp học mới
        </Button>
      </Box>

      <Stack spacing={1} mb={2}>
        <Typography variant="subtitle1" color="text.secondary">
          Theo dõi mã lớp học, mô tả, course ID, trạng thái, ngày khởi tạo và khóa truy cập (ẩn mặc định).
        </Typography>
      </Stack>

      <Paper sx={{ width: "100%", overflowX: "auto" }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Lớp học</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Course ID</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày khởi tạo</TableCell>
              <TableCell>Khóa lớp</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow key="loading">
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={30} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Đang tải danh sách lớp học...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : !classes?.length ? (
              <TableRow key="empty">
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Chưa có lớp học nào
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hãy tạo lớp học đầu tiên của bạn
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              classes.map((classItem) => (
                <ClassTableRow key={classItem._id} {...classItem} />
              ))
            )}
          </TableBody>
        </Table>
        {/* Simple Next/Prev buttons */}
        <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center" sx={{ mt: 2 }} paddingBottom={1} paddingRight={1}>
          <Button
            variant="outlined"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Trang trước
          </Button>
          <Button
            variant="outlined"
            disabled={nextPageEmpty}
            onClick={() => {
              // Use cached next page data for instant update
              setClasses(nextPageData);
              setPage(page + 1);
            }}
          >
            Trang sau
          </Button>
        </Stack>
      </Paper>



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

          {coursesLoading ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 6
            }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Đang tải danh sách khóa học...
              </Typography>
            </Box>
          ) : (
            <>
              <Stack spacing={3}>
                <TextField
                  label="Tên lớp học"
                  required
                  fullWidth
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="VD: Hóa học 9A"
                  disabled={creating}
                />

                <TextField
                  label="Mô tả lớp học"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  placeholder="Mô tả ngắn về lớp học (tùy chọn)"
                  disabled={creating}
                />

                <Autocomplete
                  fullWidth
                  options={courses || []}
                  getOptionLabel={(option) => {
                    if (!option || typeof option !== 'object') return '';
                    const name = option.course_name || 'Unknown';
                    const grade = option.grade_level || 'N/A';
                    return `${name} (Lớp ${grade})`;
                  }}
                  value={selectedCourse}
                  onChange={(event, value) => {
                    handleCourseSelection(value);
                  }}
                  disabled={creating}
                  noOptionsText="Không có khóa học nào"
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
                    <Box component="li" {...props} key={option._id}>
                      <Box>
                        <Typography variant="body1">
                          {option.course_name || 'Unknown Course'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Lớp {option.grade_level || 'N/A'} • {option.description ? 'Có mô tả' : 'Chưa có mô tả'}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Stack>

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              <Stack direction="row" spacing={2} justifyContent="end" sx={{ mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={handleModalClose}
                  disabled={creating}
                >
                  Hủy
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateClass}
                  disabled={!className.trim() || !selectedCourse || creating}
                  startIcon={creating ? <CircularProgress size={20} /> : <Add />}
                >
                  {creating ? 'Đang tạo...' : 'Tạo lớp học'}
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Modal>
    </Box >
  );
};

export default TeacherClasses;
