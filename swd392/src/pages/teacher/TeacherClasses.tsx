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
  Chip,
  CardMedia,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import ClassTableRow from "../../components/teacher/ClassTableRow";
import type { Class, Course, CreateClassData, Topic } from "../../types/teacherType";
import { useState, useEffect } from "react";
import { teacherClassApi } from "../../services/teacherApi/teacherClassApi";
import { courseApi } from "../../services/teacherApi/courseApi";
import { topicApi } from "../../services/teacherApi/topicApi";

const TeacherClasses = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalClassCreation, setModalClassCreation] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [className, setClassName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [courseTopics, setCourseTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [createImagePreview, setCreateImagePreview] = useState<string>("");

  // Change image modal states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedClassForImage, setSelectedClassForImage] = useState<Class | null>(null);
  const [changeImageFile, setChangeImageFile] = useState<File | null>(null);
  const [changeImagePreview, setChangeImagePreview] = useState<string>("");
  const [changingImage, setChangingImage] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [nextPageEmpty, setNextPageEmpty] = useState(false);
  const [nextPageData, setNextPageData] = useState<Class[]>([]);

  // Course states
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Fetch classes when page changes
  useEffect(() => {
    fetchClasses(page, showDeleted);
  }, [page, showDeleted]);

  const fetchClasses = async (pageNum = 1, viewHidden = true) => {
    try {
      setLoading(true);
      setError(null);
      // Fetch current page
      const currentPageClasses = await teacherClassApi.getClassesByTeacher(pageNum, viewHidden);
      setClasses(Array.isArray(currentPageClasses) ? currentPageClasses : []);

      // Prefetch next page
      const nextPageClasses = await teacherClassApi.getClassesByTeacher(pageNum + 1, viewHidden);
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
      const courseList = response.courses || response || [];
      setCourses(courseList);
      return courseList as Course[];
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Không thể tải danh sách khóa học. Vui lòng thử lại.');
      setCourses([]);
      return [] as Course[];
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
    if (createImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(createImagePreview);
    }
    setModalClassCreation(false);
    setSelectedCourse(null);
    setClassName("");
    setCreateImageFile(null);
    setCreateImagePreview("");
    setCreating(false);
    setCourses([]);
    setCourseTopics([]);
    setTopicsLoading(false);
    setError(null);
  };

  const handleImageModalClose = () => {
    if (changeImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(changeImagePreview);
    }
    setImageModalOpen(false);
    setSelectedClassForImage(null);
    setChangeImageFile(null);
    setChangeImagePreview("");
    setChangingImage(false);
  };

  const handleCreateImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp ảnh hợp lệ");
      return;
    }

    if (createImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(createImagePreview);
    }

    setCreateImageFile(file);
    setCreateImagePreview(URL.createObjectURL(file));
  };

  const handleChangeImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn tệp ảnh hợp lệ");
      return;
    }

    if (changeImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(changeImagePreview);
    }

    setChangeImageFile(file);
    setChangeImagePreview(URL.createObjectURL(file));
  };

  const handleOpenImageModal = (classItem: Class) => {
    setSelectedClassForImage(classItem);
    setImageModalOpen(true);
  };

  const fetchTopicsByCourse = async (courseId: string) => {
    try {
      setTopicsLoading(true);
      const response = await topicApi.getTopicsByCourse(courseId, 1);
      setCourseTopics(response?.topics || []);
    } catch (err) {
      console.error('Error fetching topics for selected course:', err);
      setCourseTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleCourseSelection = (course: Course | null) => {
    setSelectedCourse(course);
    if (!course?._id) {
      setCourseTopics([]);
      return;
    }
    fetchTopicsByCourse(course._id);
  };

  const handleStatusChange = async (
    classItem: Class,
    status: "active" | "inactive" | "archived" | "deleted",
  ) => {
    if (classItem.status === status) return;
    try {
      await teacherClassApi.updateClass(classItem._id, { status });
      await fetchClasses(page, showDeleted);
    } catch (err) {
      console.error('Error updating class status:', err);
      alert('Không thể cập nhật trạng thái lớp học. Vui lòng thử lại.');
    }
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
      let uploadedImageUrl: string | undefined;

      if (createImageFile) {
        const uploadResponse = await teacherClassApi.uploadImageCover(createImageFile);
        uploadedImageUrl = uploadResponse?.url;
      }

      const createData: CreateClassData = {
        class_name: className.trim(),
        course_id: selectedCourse._id,
        ...(uploadedImageUrl ? { img_cover_link: uploadedImageUrl } : {}),
      };

      await teacherClassApi.createClass(createData);

      // Refresh classes list
      await fetchClasses(page, showDeleted);

      // Close modal and reset form
      handleModalClose();

    } catch (err) {
      console.error('Error creating class:', err);
      alert('Không thể tạo lớp học. Vui lòng thử lại.');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateClassImage = async () => {
    if (!selectedClassForImage) {
      return;
    }

    if (!changeImageFile) {
      alert("Vui lòng chọn ảnh mới");
      return;
    }

    try {
      setChangingImage(true);

      if (selectedClassForImage.img_cover_link) {
        await teacherClassApi.updateImageCover(changeImageFile, selectedClassForImage.img_cover_link);
      } else {
        const uploadResponse = await teacherClassApi.uploadImageCover(changeImageFile);
        const imageUrl = uploadResponse?.url;

        if (!imageUrl) {
          throw new Error("Không nhận được URL ảnh từ server");
        }

        await teacherClassApi.updateClass(selectedClassForImage._id, { img_cover_link: imageUrl });
      }

      await fetchClasses(page, showDeleted);
      handleImageModalClose();
    } catch (err) {
      console.error('Error changing class image:', err);
      alert('Không thể cập nhật ảnh lớp học. Vui lòng thử lại.');
    } finally {
      setChangingImage(false);
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
        <Typography variant="h4" fontWeight="bold">Quản lý lớp học</Typography>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            onClick={() => setShowDeleted((prev) => !prev)}
          >
            {showDeleted ? "Ẩn lớp đã xóa" : "Hiện lớp đã xóa"}
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={handleModalOpen}>
            Tạo lớp học mới
          </Button>
        </Stack>
      </Box>

      <Stack spacing={1} mb={2}>
        <Typography variant="subtitle1" color="text.secondary">
          Theo dõi mã lớp học, course ID, trạng thái, ngày khởi tạo và khóa truy cập (ẩn mặc định).
        </Typography>
      </Stack>

      <Paper sx={{ width: "100%", overflowX: "auto" }}>
        <Table size="medium">
          <TableHead>
            <TableRow>
              <TableCell>Lớp học</TableCell>
              <TableCell>Course ID</TableCell>
              <TableCell>Ngày khởi tạo</TableCell>
              <TableCell>Khóa lớp</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow key="loading">
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={30} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Đang tải danh sách lớp học...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : !classes?.length ? (
              <TableRow key="empty">
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Không có lớp học phù hợp
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {showDeleted ? 'Chưa có lớp học nào.' : 'Bật "Hiện lớp đã xóa" để xem các lớp đã xóa.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              classes.map((classItem) => (
                <ClassTableRow
                  key={classItem._id}
                  {...classItem}
                  onStatusChange={handleStatusChange}
                  onChangeImage={handleOpenImageModal}
                />
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
                  onChange={(_event, value) => {
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

                <Stack spacing={1}>
                  <Typography variant="subtitle2">Ảnh bìa lớp học (tùy chọn)</Typography>
                  <Button variant="outlined" component="label" disabled={creating}>
                    Chọn ảnh
                    <input hidden accept="image/*" type="file" onChange={handleCreateImageSelect} />
                  </Button>
                  {createImagePreview && (
                    <CardMedia
                      component="img"
                      image={createImagePreview}
                      alt="Ảnh bìa lớp học"
                      sx={{ width: 220, height: 130, borderRadius: 1, objectFit: "cover", border: "1px solid", borderColor: "divider" }}
                    />
                  )}
                </Stack>

                {selectedCourse && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Chủ đề của khóa học đã chọn
                    </Typography>
                    {topicsLoading ? (
                      <Typography variant="body2" color="text.secondary">
                        Đang tải chủ đề...
                      </Typography>
                    ) : courseTopics.length > 0 ? (
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {courseTopics.map((topic) => (
                          <Chip key={topic._id} label={topic.title} size="small" />
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Khóa học này chưa có chủ đề.
                      </Typography>
                    )}
                  </Box>
                )}
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

      <Modal
        open={imageModalOpen}
        onClose={handleImageModalClose}
        aria-labelledby="change-class-image-title"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: 520 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}>
          <Typography id="change-class-image-title" variant="h6" gutterBottom>
            Đổi ảnh lớp học
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {selectedClassForImage ? `Lớp: ${selectedClassForImage.class_name}` : ""}
          </Typography>

          <Stack spacing={2}>
            <Button variant="outlined" component="label" disabled={changingImage}>
              Chọn ảnh mới
              <input hidden accept="image/*" type="file" onChange={handleChangeImageSelect} />
            </Button>

            {(changeImagePreview || selectedClassForImage?.img_cover_link) && (
              <CardMedia
                component="img"
                image={changeImagePreview || selectedClassForImage?.img_cover_link || ""}
                alt="Ảnh lớp học"
                sx={{ width: '100%', height: 210, borderRadius: 1, objectFit: "cover", border: "1px solid", borderColor: "divider" }}
              />
            )}
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
            <Button variant="outlined" onClick={handleImageModalClose} disabled={changingImage}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleUpdateClassImage}
              disabled={!changeImageFile || changingImage}
              startIcon={changingImage ? <CircularProgress size={20} /> : undefined}
            >
              {changingImage ? 'Đang cập nhật...' : 'Cập nhật ảnh'}
            </Button>
          </Stack>
        </Box>
      </Modal>

    </Box >
  );
};

export default TeacherClasses;
