import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
  Breadcrumbs,
} from "@mui/material";
import { Edit, Delete, Add, NavigateNext } from "@mui/icons-material";
import { useParams, Link } from "react-router-dom";
import {
  getTopicsByCourse,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../../services/managementApi";

const ModeratorTopicsPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState<any>(null);
  const [formData, setFormData] = useState({ topic_name: "", description: "", order_num: 0 });
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" as "info" | "success" | "error" });

  const fetchTopics = async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await getTopicsByCourse(courseId);
      setTopics(res.data || []);
    } catch (err) {
      setSnack({ open: true, message: "Lỗi khi tải danh sách chủ đề", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  // eslint-disable-next-line
  }, [courseId]);

  const handleOpenDialog = (topic?: any) => {
    if (topic) {
      setCurrentTopic(topic);
      setFormData({ 
        topic_name: topic.topic_name, 
        description: topic.description || "", 
        order_num: topic.order_num || 0 
      });
    } else {
      setCurrentTopic(null);
      setFormData({ topic_name: "", description: "", order_num: topics.length + 1 });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!courseId) return;
      if (currentTopic) {
        await updateTopic(currentTopic._id, formData);
        setSnack({ open: true, message: "Cập nhật chủ đề thành công", severity: "success" });
      } else {
        await createTopic({ ...formData, course_id: courseId });
        setSnack({ open: true, message: "Tạo chủ đề mới thành công", severity: "success" });
      }
      setDialogOpen(false);
      fetchTopics();
    } catch (err: any) {
      setSnack({ open: true, message: err.message || "Lỗi khi lưu chủ đề", severity: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chủ đề này?")) {
      try {
        await deleteTopic(id);
        setSnack({ open: true, message: "Xóa chủ đề thành công", severity: "success" });
        fetchTopics();
      } catch (err: any) {
        setSnack({ open: true, message: err.message || "Lỗi khi xóa chủ đề", severity: "error" });
      }
    }
  };

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 2 }}>
        <Link to="/moderator/courses" style={{ textDecoration: 'none', color: 'inherit' }}>
          Khóa học
        </Link>
        <Typography color="text.primary">Chủ đề (Topics)</Typography>
      </Breadcrumbs>

      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">Quản lý Chủ đề</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Thêm chủ đề
        </Button>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={80}>Thứ tự</TableCell>
                <TableCell>Tên chủ đề</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell align="right">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {topics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">Chưa có chủ đề nào trong khóa học này.</TableCell>
                </TableRow>
              ) : (
                topics.map((topic) => (
                  <TableRow key={topic._id}>
                    <TableCell>{topic.order_num}</TableCell>
                    <TableCell sx={{ fontWeight: "medium" }}>{topic.topic_name}</TableCell>
                    <TableCell>{topic.description || "-"}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleOpenDialog(topic)}>
                        <Edit />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(topic._id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Topic Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{currentTopic ? "Chỉnh sửa chủ đề" : "Thêm chủ đề mới"}</DialogTitle>
        <DialogContent>
          <Box mt={1}>
            <TextField
              fullWidth
              label="Tên chủ đề"
              variant="outlined"
              margin="normal"
              value={formData.topic_name}
              onChange={(e) => setFormData({ ...formData, topic_name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Thứ tự hiển thị"
              type="number"
              variant="outlined"
              margin="normal"
              value={formData.order_num}
              onChange={(e) => setFormData({ ...formData, order_num: parseInt(e.target.value) || 0 })}
            />
            <TextField
              fullWidth
              label="Mô tả"
              variant="outlined"
              margin="normal"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleSave}>Lưu</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ModeratorTopicsPage;
