import { Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Stack, CircularProgress, Pagination, List, ListItem, ListItemText, Breadcrumbs, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import { Add, Search, Edit, Delete, School, ToggleOn, ToggleOff, Topic, ArrowBack, NavigateNext, InsertDriveFile, ViewInAr } from '@mui/icons-material';
import type { AdminCourse, AdminTopic, AdminClassMaterial, CreateCourseRequest, UpdateCourseRequest } from '../../types/adminType';
import { adminCoursesApi, adminTopicsApi, adminMaterialsApi } from '../../services/adminApi';

const AdminCourses = () => {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<AdminCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Drill-down
  const [openDrilldown, setOpenDrilldown] = useState(false);
  const [drilldownView, setDrilldownView] = useState<'topics' | 'materials' | 'material-detail'>('topics');
  const [drilldownCourse, setDrilldownCourse] = useState<AdminCourse | null>(null);
  const [drilldownCourseId, setDrilldownCourseId] = useState('');
  const [courseTopics, setCourseTopics] = useState<AdminTopic[]>([]);
  const [topicPage, setTopicPage] = useState(1);
  const [topicHasNextPage, setTopicHasNextPage] = useState(false);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [drilldownTopic, setDrilldownTopic] = useState<AdminTopic | null>(null);
  const [topicMaterials, setTopicMaterials] = useState<AdminClassMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<AdminClassMaterial | null>(null);
  const [materialContentDetail, setMaterialContentDetail] = useState<any | null>(null);
  const [materialDetailLoading, setMaterialDetailLoading] = useState(false);
  
  // New course form state
  const [newCourse, setNewCourse] = useState<CreateCourseRequest>({
    course_name: '',
    grade_level: 10,
  });

  // Edit course form state
  const [editCourse, setEditCourse] = useState<UpdateCourseRequest>({
    course_name: '',
    grade_level: 10,
  });

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses('');
  }, []);

  const fetchCourses = async (keyword: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = keyword.trim()
        ? await adminCoursesApi.searchCourses(keyword.trim(), 1)
        : await adminCoursesApi.getAllCourses({ page: 1 });
      setCourses(data);
      setFilteredCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCourses(searchQuery);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // Filter function
  useEffect(() => {
    setFilteredCourses(courses);
  }, [courses]);

  const handleCreateCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      await adminCoursesApi.createCourse(newCourse);
      setOpenCreateDialog(false);
      setNewCourse({
        course_name: '',
        grade_level: 10,
      });
      await fetchCourses(searchQuery);
    } catch (err) {
      console.error('Error creating course:', err);
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      setLoading(true);
      setError(null);
      await adminCoursesApi.updateCourse(selectedCourse._id, editCourse);
      setOpenEditDialog(false);
      setSelectedCourse(null);
      await fetchCourses(searchQuery);
    } catch (err) {
      console.error('Error updating course:', err);
      setError(err instanceof Error ? err.message : 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;
    
    try {
      setLoading(true);
      setError(null);
      await adminCoursesApi.deleteCourse(selectedCourse._id);
      setOpenDeleteDialog(false);
      setSelectedCourse(null);
      await fetchCourses(searchQuery);
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCourseStatus = async (course: AdminCourse) => {
    try {
      setLoading(true);
      await adminCoursesApi.toggleCourseStatus(course._id);
      await fetchCourses(searchQuery);
    } catch (err) {
      console.error('Error toggling course status:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle course status');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (course: AdminCourse) => {
    setSelectedCourse(course);
    setEditCourse({
      course_name: course.course_name,
      grade_level: course.grade_level,
    });
    setOpenEditDialog(true);
  };

  const openDelete = (course: AdminCourse) => {
    setSelectedCourse(course);
    setOpenDeleteDialog(true);
  };

  const resolveCourseId = (course: AdminCourse): string => {
    const raw = course as unknown as Record<string, unknown>;
    const id = raw._id ?? raw.id;
    return typeof id === 'string' ? id : '';
  };

  const handleOpenDrilldown = (course: AdminCourse) => {
    const courseId = resolveCourseId(course);
    if (!courseId) { setError('Không tìm được Course ID.'); return; }
    setDrilldownCourse(course);
    setDrilldownCourseId(courseId);
    setDrilldownView('topics');
    setCourseTopics([]);
    setTopicPage(1);
    setDrilldownTopic(null);
    setTopicMaterials([]);
    setMaterialContentDetail(null);
    setSelectedMaterial(null);
    setOpenDrilldown(true);
  };

  const handleCloseDrilldown = () => {
    setOpenDrilldown(false);
    setDrilldownCourseId('');
    setDrilldownView('topics');
    setTopicPage(1);
  };

  const handleBackToTopics = () => {
    setDrilldownView('topics');
    setDrilldownTopic(null);
    setTopicMaterials([]);
  };

  const handleBackToMaterials = () => {
    setDrilldownView('materials');
    setMaterialContentDetail(null);
    setSelectedMaterial(null);
  };

  const handleViewTopicMaterials = async (topic: AdminTopic) => {
    setDrilldownTopic(topic);
    setDrilldownView('materials');
    setMaterialsLoading(true);
    setTopicMaterials([]);
    try {
      const materials = await adminMaterialsApi.getClassMaterialsByTopicId(topic._id);
      setTopicMaterials(materials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load materials');
    } finally {
      setMaterialsLoading(false);
    }
  };

  const handleViewMaterialDetail = async (material: AdminClassMaterial) => {
    setSelectedMaterial(material);
    setDrilldownView('material-detail');
    setMaterialDetailLoading(true);
    setMaterialContentDetail(null);
    try {
      if (!material.content_id && material.type !== '2d_render') {
        throw new Error('Material chưa có content_id để tải nội dung chi tiết.');
      }

      if (material.type === 'file') {
        const file = await adminMaterialsApi.getFileById(material.content_id);
        setMaterialContentDetail({ type: 'file', data: file });
      } else if (material.type === 'slide') {
        const slide = await adminMaterialsApi.getSlideById(material.content_id);
        setMaterialContentDetail({ type: 'slide', data: slide });
      } else if (material.type === 'quiz') {
        const [quiz, questions] = await Promise.all([
          adminMaterialsApi.getQuizById(material.content_id),
          adminMaterialsApi.getQuestionsByQuizId(material.content_id),
        ]);
        setMaterialContentDetail({ type: 'quiz', data: { quiz, questions } });
      } else {
        const detail = await adminMaterialsApi.getMaterialById(material._id);
        setMaterialContentDetail({ type: '2d_render', data: detail?.data?.content ?? detail?.data ?? null });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load material detail');
    } finally {
      setMaterialDetailLoading(false);
    }
  };

  useEffect(() => {
    if (!openDrilldown || !drilldownCourseId || drilldownView !== 'topics') return;
    setTopicsLoading(true);
    adminTopicsApi.getTopicsByCourse(drilldownCourseId, topicPage)
      .then((response) => {
        const payload = (response as any)?.data ?? response;
        const topics = Array.isArray(payload?.topics)
          ? payload.topics
          : Array.isArray(payload?.course?.topics)
            ? payload.course.topics
            : [];
        const totalPages = Number((payload as any)?.totalPages ?? (payload as any)?.total_pages);
        setCourseTopics(topics);
        setTopicHasNextPage(Number.isFinite(totalPages) ? topicPage < totalPages : topics.length >= 12);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load topics'))
      .finally(() => setTopicsLoading(false));
  }, [openDrilldown, drilldownCourseId, topicPage, drilldownView]);

  const getMaterialTypeLabel = (type: string) => {
    switch (type) {
      case 'slide': return 'Slide';
      case 'file': return 'File';
      case 'quiz': return 'Quiz';
      case '2d_render': return '2D Render';
      default: return type;
    }
  };

  const getMaterialTypeColor = (type: string) => {
    switch (type) {
      case 'slide': return 'info';
      case 'file': return 'warning';
      case 'quiz': return 'success';
      case '2d_render': return 'secondary';
      default: return 'default';
    }
  };

  const renderMaterialContent = () => {
    if (!selectedMaterial || !materialContentDetail) return null;
    const content = materialContentDetail.data;
    switch (selectedMaterial.type) {
      case 'slide':
        return (
          <Stack spacing={1.5}>
            <Typography variant="body2"><strong>Tên slide:</strong> {content?.slide_name || selectedMaterial.title}</Typography>
            {content?.file_path
              ? <Button href={content.file_path} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<InsertDriveFile />}>Mở file slide</Button>
              : <Alert severity="info">Không có đường dẫn file slide.</Alert>}
          </Stack>
        );
      case 'file':
        return (
          <Stack spacing={1.5}>
            <Typography variant="body2"><strong>Tên file:</strong> {content?.file_name || selectedMaterial.title}</Typography>
            {content?.file_path
              ? <Button href={content.file_path} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<InsertDriveFile />}>Tải / xem file</Button>
              : <Alert severity="info">Không có đường dẫn file.</Alert>}
          </Stack>
        );
      case 'quiz':
        {
          const quiz = content?.quiz ?? content;
          const questions = Array.isArray(content?.questions) ? content.questions : [];
        return (
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight="bold">{quiz?.title || selectedMaterial.title}</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={`Type: ${quiz?.type || '-'}`} size="small" variant="outlined" />
              <Chip label={`Attempts: ${quiz?.max_attempt_number ?? '-'}`} size="small" variant="outlined" />
              <Chip label={quiz?.status ? 'Active' : 'Inactive'} size="small" color={quiz?.status ? 'success' : 'default'} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Available: {quiz?.available_date ? new Date(quiz.available_date).toLocaleString('vi-VN') : 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              End date: {quiz?.end_date ? new Date(quiz.end_date).toLocaleString('vi-VN') : 'N/A'}
            </Typography>

            {questions.length > 0 ? (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" fontWeight={700}>Danh sách câu hỏi</Typography>
                {questions.map((q: any, idx: number) => (
                  <Paper key={q?._id || idx} variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                      Câu {idx + 1}: {q?.title || 'Không có tiêu đề'}
                    </Typography>
                    <Stack spacing={0.75}>
                      {Array.isArray(q?.options) && q.options.length > 0 ? q.options.map((opt: any, optionIndex: number) => {
                        const optionText = typeof opt === 'string' ? opt : (opt?.text ?? '');
                        const isCorrect = optionIndex === q?.correct_index;
                        return (
                          <Box
                            key={optionIndex}
                            sx={{
                              p: 0.75,
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: isCorrect ? 'success.main' : 'divider',
                              bgcolor: isCorrect ? 'success.light' : 'background.paper',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2">{String.fromCharCode(65 + optionIndex)}. {optionText}</Typography>
                            {isCorrect && <Chip label="Đáp án đúng" size="small" color="success" />}
                          </Box>
                        );
                      }) : (
                        <Typography variant="body2" color="text.secondary">Không có lựa chọn cho câu hỏi này.</Typography>
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Alert severity="info">Chưa lấy được danh sách câu hỏi từ quiz này.</Alert>
            )}
          </Stack>
        );
      }
      case '2d_render':
        return (
          <Stack spacing={1.5}>
            <Typography variant="body2"><strong>2D Render:</strong> {content?.title || selectedMaterial.title}</Typography>
            {content?.render_url
              ? <Button href={content.render_url} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<ViewInAr />}>Xem 2D Render</Button>
              : <Alert severity="info">Không có nội dung 2D Render.</Alert>}
          </Stack>
        );
      default:
        return <Alert severity="warning">Loại tài liệu không hỗ trợ xem trực tiếp.</Alert>;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'default';
  };

  const getStatusLabel = (status: string) => {
    return status === 'active' ? 'Hoạt động' : 'Không hoạt động';
  };

  // Loading state
  if (loading && (!courses || courses.length === 0)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Quản lý Khóa học
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý danh sách khóa học trong hệ thống
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setOpenCreateDialog(true)}
        >
          Tạo khóa học
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm khóa học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên khóa học</TableCell>
                <TableCell>Cấp độ</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Topics</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <School color="primary" />
                        <Typography variant="body1" fontWeight="medium">
                          {course.course_name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`Lớp ${course.grade_level}`} 
                        size="small" 
                        color="info"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(course.status)} 
                        size="small" 
                        color={getStatusColor(course.status) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(course.date_create).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Topic />}
                        onClick={() => handleOpenDrilldown(course)}
                      >
                        Xem topics
                      </Button>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color={course.status === 'active' ? 'warning' : 'success'}
                        onClick={() => handleToggleCourseStatus(course)}
                        title={course.status === 'active' ? 'Tắt khóa học' : 'Bật khóa học'}
                      >
                        {course.status === 'active' ? <ToggleOff /> : <ToggleOn />}
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => openEdit(course)}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => openDelete(course)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      Không tìm thấy khóa học nào
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Course Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <School />
            <Typography variant="h6">Tạo khóa học mới</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tên khóa học"
              fullWidth
              required
              value={newCourse.course_name}
              onChange={(e) => setNewCourse({...newCourse, course_name: e.target.value})}
            />
            <TextField
              label="Cấp độ (Lớp)"
              type="number"
              fullWidth
              required
              value={newCourse.grade_level}
              onChange={(e) => setNewCourse({...newCourse, grade_level: parseInt(e.target.value)})}
              inputProps={{ min: 1, max: 12 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Hủy</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateCourse}
            disabled={!newCourse.course_name || loading}
          >
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa khóa học</DialogTitle>
        <DialogContent>
          {selectedCourse && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Tên khóa học"
                fullWidth
                value={editCourse.course_name}
                onChange={(e) => setEditCourse({...editCourse, course_name: e.target.value})}
              />
              <TextField
                label="Cấp độ (Lớp)"
                type="number"
                fullWidth
                value={editCourse.grade_level}
                onChange={(e) => setEditCourse({...editCourse, grade_level: parseInt(e.target.value)})}
                inputProps={{ min: 1, max: 12 }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleEditCourse} disabled={loading}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Hành động này sẽ xóa vĩnh viễn khóa học và TẤT CẢ dữ liệu liên quan!
          </Alert>
          <Typography>
            Bạn có chắc chắn muốn xóa khóa học <strong>{selectedCourse?.course_name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Tất cả topics, classes, materials liên quan sẽ bị xóa.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDeleteCourse} disabled={loading}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDrilldown} onClose={handleCloseDrilldown} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
            <Typography
              variant="subtitle1"
              fontWeight={drilldownView === 'topics' ? 'bold' : 'normal'}
              color={drilldownView !== 'topics' ? 'primary' : 'text.primary'}
              sx={{ cursor: drilldownView !== 'topics' ? 'pointer' : 'default' }}
              onClick={drilldownView !== 'topics' ? handleBackToTopics : undefined}
            >
              {drilldownCourse?.course_name || 'Khóa học'}
            </Typography>
            {(drilldownView === 'materials' || drilldownView === 'material-detail') && (
              <Typography
                variant="subtitle1"
                fontWeight={drilldownView === 'materials' ? 'bold' : 'normal'}
                color={drilldownView === 'material-detail' ? 'primary' : 'text.primary'}
                sx={{ cursor: drilldownView === 'material-detail' ? 'pointer' : 'default' }}
                onClick={drilldownView === 'material-detail' ? handleBackToMaterials : undefined}
              >
                {drilldownTopic?.title || 'Topic'}
              </Typography>
            )}
            {drilldownView === 'material-detail' && (
              <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                {selectedMaterial?.title || 'Tài liệu'}
              </Typography>
            )}
          </Breadcrumbs>
        </DialogTitle>

        <DialogContent dividers>
          {/* TOPICS */}
          {drilldownView === 'topics' && (
            <>
              {topicsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
              ) : courseTopics.length > 0 ? (
                <List disablePadding>
                  {courseTopics.map((topic) => (
                    <ListItem
                      key={topic._id}
                      divider
                      secondaryAction={
                        <Button size="small" variant="outlined" startIcon={<Topic />} onClick={() => handleViewTopicMaterials(topic)}>
                          Xem tài liệu
                        </Button>
                      }
                    >
                      <ListItemText primary={topic.title} secondary={topic.description || 'Không có mô tả'} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Khóa học này chưa có topic.</Typography>
              )}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">Trang {topicPage}</Typography>
                <Pagination color="primary" page={topicPage} count={topicHasNextPage ? topicPage + 1 : topicPage} onChange={(_, value) => setTopicPage(value)} disabled={topicsLoading} />
              </Stack>
            </>
          )}

          {/* MATERIALS */}
          {drilldownView === 'materials' && (
            <>
              <Button startIcon={<ArrowBack />} size="small" onClick={handleBackToTopics} sx={{ mb: 2 }}>Quay lại topics</Button>
              {materialsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
              ) : topicMaterials.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell><strong>Tiêu đề</strong></TableCell>
                        <TableCell><strong>Loại</strong></TableCell>
                        <TableCell><strong>Trạng thái</strong></TableCell>
                        <TableCell align="right"><strong>Xem nội dung</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topicMaterials.map((material) => (
                        <TableRow key={material._id} hover>
                          <TableCell>{material.title}</TableCell>
                          <TableCell>
                            <Chip label={getMaterialTypeLabel(material.type)} color={getMaterialTypeColor(material.type) as any} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip label={material.status} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="right">
                            <Button size="small" variant="outlined" onClick={() => handleViewMaterialDetail(material)}>
                              Xem {getMaterialTypeLabel(material.type)}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Topic này chưa có tài liệu nào.</Typography>
              )}
            </>
          )}

          {/* MATERIAL DETAIL */}
          {drilldownView === 'material-detail' && (
            <>
              <Button startIcon={<ArrowBack />} size="small" onClick={handleBackToMaterials} sx={{ mb: 2 }}>Quay lại danh sách tài liệu</Button>
              {materialDetailLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
              ) : materialContentDetail ? (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <Chip label={getMaterialTypeLabel(selectedMaterial?.type || '')} color={getMaterialTypeColor(selectedMaterial?.type || '') as any} />
                    <Typography variant="h6">{selectedMaterial?.title}</Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  {renderMaterialContent()}
                </Box>
              ) : (
                <Alert severity="warning">Không tải được nội dung tài liệu.</Alert>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDrilldown}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCourses;
