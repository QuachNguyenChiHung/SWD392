import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit, Refresh } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import type { AdminCourse, AdminTopic, CreateTopicRequest, UpdateTopicRequest } from '../../types/adminType';
import { adminCoursesApi, adminTopicsApi } from '../../services/adminApi';

interface TopicFormState {
  title: string;
  course_id: string;
  description: string;
  contentJsonText: string;
}

const emptyForm: TopicFormState = {
  title: '',
  course_id: '',
  description: '',
  contentJsonText: '',
};

const AdminTopics = () => {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<AdminTopic | null>(null);
  const [form, setForm] = useState<TopicFormState>(emptyForm);

  const parseContentJson = (value: string) => {
    if (!value.trim()) return undefined;
    return JSON.parse(value);
  };

  const fetchCourses = async () => {
    const data = await adminCoursesApi.getAllCourses({ page: 1 });
    setCourses(data);
  };

  const fetchTopics = async () => {
    try {
      setLoading(true);
      setError(null);

      if (searchQuery.trim()) {
        const data = await adminTopicsApi.searchTopics(searchQuery.trim(), 1);
        setTopics(data);
        return;
      }

      if (!selectedCourseId) {
        setTopics([]);
        return;
      }

      const response = await adminTopicsApi.getTopicsByCourse(selectedCourseId, 1);
      const normalizedTopics = response.course.topics.map((topic) => ({
        ...topic,
        course_id: response.course._id,
        course: {
          course_name: response.course.course_name,
          grade_level: response.course.grade_level,
        },
      }));
      setTopics(normalizedTopics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load topics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchCourses();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [searchQuery, selectedCourseId]);

  const handleCreateTopic = async () => {
    try {
      const payload: CreateTopicRequest = {
        title: form.title,
        course_id: form.course_id,
        description: form.description || undefined,
        content_json: parseContentJson(form.contentJsonText),
      };
      await adminTopicsApi.createTopic(payload);
      setOpenCreateDialog(false);
      setForm(emptyForm);
      setSelectedCourseId(payload.course_id);
      setSearchQuery('');
      await fetchTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create topic');
    }
  };

  const handleEditTopic = async () => {
    if (!selectedTopic) return;

    try {
      const payload: UpdateTopicRequest = {
        title: form.title,
        description: form.description || undefined,
        content_json: parseContentJson(form.contentJsonText),
      };
      await adminTopicsApi.updateTopic(selectedTopic._id, payload);
      setOpenEditDialog(false);
      setSelectedTopic(null);
      setForm(emptyForm);
      await fetchTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update topic');
    }
  };

  const handleDeleteTopic = async () => {
    if (!selectedTopic) return;

    try {
      await adminTopicsApi.deleteTopic(selectedTopic._id);
      setOpenDeleteDialog(false);
      setSelectedTopic(null);
      await fetchTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete topic');
    }
  };

  const openEdit = (topic: AdminTopic) => {
    setSelectedTopic(topic);
    setForm({
      title: topic.title,
      course_id: topic.course_id,
      description: topic.description ?? '',
      contentJsonText: topic.content_json ? JSON.stringify(topic.content_json, null, 2) : '',
    });
    setOpenEditDialog(true);
  };

  const openDelete = (topic: AdminTopic) => {
    setSelectedTopic(topic);
    setOpenDeleteDialog(true);
  };

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
            Quản lý chủ đề
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tạo, tìm kiếm, cập nhật và xóa topics theo swagger admin
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Refresh />} onClick={fetchTopics}>
            Tải lại
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Tạo topic
          </Button>
        </Stack>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Khóa học</InputLabel>
            <Select
              value={selectedCourseId}
              label="Khóa học"
              onChange={(event) => setSelectedCourseId(event.target.value)}
            >
              <MenuItem value="">Tất cả / chưa chọn</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course._id} value={course._id}>
                  {course.course_name} - Lớp {course.grade_level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Tìm topic"
            placeholder="Nhập keyword để dùng API search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </Stack>
      </Paper>

      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <Refresh className="spin" />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Khóa học</TableCell>
                  <TableCell align="right">Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topics.length > 0 ? (
                  topics.map((topic) => (
                    <TableRow key={topic._id} hover>
                      <TableCell>{topic.title}</TableCell>
                      <TableCell>{topic.description || '-'}</TableCell>
                      <TableCell>
                        {topic.course ? `${topic.course.course_name} - Lớp ${topic.course.grade_level}` : topic.course_id}
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" startIcon={<Edit />} onClick={() => openEdit(topic)}>
                          Sửa
                        </Button>
                        <Button size="small" color="error" startIcon={<Delete />} onClick={() => openDelete(topic)}>
                          Xóa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        Chưa có topic nào. Hãy chọn khóa học hoặc nhập từ khóa để tìm.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Tạo topic</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Tiêu đề" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} fullWidth required />
            <FormControl fullWidth>
              <InputLabel>Khóa học</InputLabel>
              <Select
                value={form.course_id}
                label="Khóa học"
                onChange={(event) => setForm({ ...form, course_id: event.target.value })}
              >
                {courses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.course_name} - Lớp {course.grade_level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Mô tả" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} fullWidth multiline minRows={3} />
            <TextField
              label="content_json (tùy chọn, JSON hợp lệ)"
              value={form.contentJsonText}
              onChange={(event) => setForm({ ...form, contentJsonText: event.target.value })}
              fullWidth
              multiline
              minRows={6}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleCreateTopic} disabled={!form.title || !form.course_id}>
            Tạo
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh sửa topic</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Tiêu đề" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} fullWidth required />
            <TextField label="Mô tả" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} fullWidth multiline minRows={3} />
            <TextField
              label="content_json (tùy chọn, JSON hợp lệ)"
              value={form.contentJsonText}
              onChange={(event) => setForm({ ...form, contentJsonText: event.target.value })}
              fullWidth
              multiline
              minRows={6}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleEditTopic} disabled={!form.title}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Xóa topic</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            API này sẽ xóa cascade toàn bộ material, question, quiz, progress liên quan tới topic.
          </Alert>
          <Typography>
            Bạn có chắc chắn muốn xóa topic <strong>{selectedTopic?.title}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button variant="contained" color="error" onClick={handleDeleteTopic}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTopics;